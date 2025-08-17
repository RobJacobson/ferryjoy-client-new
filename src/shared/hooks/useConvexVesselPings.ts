/**
 * Hook for maintaining a 20-minute rolling cache of VesselPings via incremental fetches.
 *
 * Overview
 * - Initial hydration: fetch the last N minutes (see PINGS_HISTORY.HISTORY_MINUTES).
 * - Incremental updates: every UPDATE_INTERVAL_MS, fetch pings strictly newer than
 *   the last seen timestamp and merge them into a grouped cache.
 * - Pruning: after each merge, drop pings older than HISTORY_WINDOW_MS.
 * - Watchdog: a 5s timer detects staleness (no updates > STALE_MS) and triggers
 *   a refresh loop.
 *
 * Benefits
 * - Minimizes bandwidth: only new pings are fetched after the initial load.
 * - Keeps logic simple: a single source of truth (local cache) and monotonic token (latestTimeStampMs).
 */

import { api } from "@convex/_generated/api";
import { useConvex } from "convex/react";
import { useCallback, useEffect, useRef, useState } from "react";

import { fromConvexDocument } from "@/data/types/converters";
import type { VesselPing } from "@/data/types/domain/VesselPing";
import { useOnReconnect } from "@/shared/hooks/useOnReconnect";
import { log, VESSEL_HISTORY_MINUTES } from "@/shared/lib";

type VesselPingsMap = Record<number, VesselPing[]>;

const UPDATE_INTERVAL_MS = 60_000; // configurable
const STALE_MS = 150_000; // 2m30s
const HISTORY_MINUTES = VESSEL_HISTORY_MINUTES;
const HISTORY_WINDOW_MS = HISTORY_MINUTES * 60_000;

/** Convex document shape with metadata; converted to domain via fromConvexDocument. */
type ConvexDoc = { _id: string; _creationTime: number; [key: string]: unknown };
/** Maps a Convex VesselPing document to a domain VesselPing. */
const toPing = (doc: ConvexDoc) => fromConvexDocument<VesselPing>(doc);

/**
 * Reducer for grouping pings by VesselID.
 * Appends to the existing array (arrival order assumed to be chronological asc from server).
 * @param acc Map of vesselId -> ordered pings
 * @param ping New ping to append
 * @returns The same accumulator reference with the updated array
 */
const groupByVessel = (
  acc: VesselPingsMap,
  ping: VesselPing
): VesselPingsMap => {
  const list = acc[ping.VesselID] ?? [];
  acc[ping.VesselID] = [...list, ping];
  return acc;
};

/**
 * Returns the latest timestamp from a chronologically ascending array of pings.
 * Assumes server returns pings ordered ascending by TimeStamp.
 */
const latestTimeStampFromPings = (pings: VesselPing[]) =>
  pings.length === 0 ? 0 : pings[pings.length - 1].TimeStamp.getTime();

//

/**
 * Removes stale pings older than the rolling window cutoff (HISTORY_WINDOW_MS).
 * Applies per-vessel to keep only recent history.
 */
const removeStalePings = (map: VesselPingsMap): VesselPingsMap => {
  const cutoffMs = Date.now() - HISTORY_WINDOW_MS;
  const filteredEntries = Object.entries(map).map(([id, arr]) => [
    Number(id),
    arr.filter((p) => p.TimeStamp.getTime() >= cutoffMs),
  ]);
  return Object.fromEntries(filteredEntries) as VesselPingsMap;
};

/**
 * Returns true if the provided timestamp is older than STALE_MS.
 * A zero timestamp is treated as non-stale to avoid thrashing on cold start.
 */
const isStaleNow = (timeStamp: number) =>
  timeStamp === 0 ? false : Date.now() - timeStamp > STALE_MS;

/**
 * Merges new pings into the existing cache and prunes stale pings in one step.
 * Uses immutable shallow cloning for the outer map; inner arrays are recreated.
 */
const mergeAndFilter = (
  map: VesselPingsMap,
  pings: VesselPing[]
): VesselPingsMap => removeStalePings(pings.reduce(groupByVessel, { ...map }));

/**
 * Hook to incrementally fetch and maintain a 20-minute VesselPings cache from Convex.
 *
 * Behavior
 * - Initial hydration on mount via refresh()
 * - Incremental updates every UPDATE_INTERVAL_MS
 * - Staleness watchdog runs every 5s; if stale and not refetching, triggers refresh()
 * - On app foreground or network reconnect, immediately triggers refresh() via useOnReconnect
 *
 * @returns Immutable object with:
 *  - vesselPings: grouped cache keyed by VesselID (VesselPingsMap)
 *  - latestTimeStampMs: most recent ping timestamp seen (ms since epoch)
 *  - refresh: function to clear and reload the last N minutes
 */
export const useConvexVesselPings = () => {
  const convex = useConvex();
  const [cache, setCache] = useState<VesselPingsMap>({});
  const [latestTimeStampMs, setLatestTimeStampMs] = useState<number>(0);
  const isFetching = useRef(false);

  /**
   * Incremental fetch: every UPDATE_INTERVAL_MS, fetch only pings newer than latestTimeStampMs
   * and merge into the local cache. Each merge prunes beyond the rolling window.
   */
  // biome-ignore lint/correctness/useExhaustiveDependencies: Using React compiler
  useEffect(() => {
    const id = setInterval(async () => {
      await fetchAndSaveDocsToCache("incremental");
    }, UPDATE_INTERVAL_MS);
    return () => clearInterval(id);
  }, [convex, latestTimeStampMs]);

  /**
   * Performs a full refresh by fetching the last HISTORY_WINDOW_MS of pings
   * and replacing the cache.
   */
  // biome-ignore lint/correctness/useExhaustiveDependencies: Using React compiler
  const refresh = useCallback(async () => {
    await fetchAndSaveDocsToCache("refresh");
  }, [convex, latestTimeStampMs]);

  /**
   * Fetches pings from the server and applies them to local state.
   * - refresh: uses sinceMs = now - HISTORY_WINDOW_MS and replaces cache
   * - incremental: uses sinceMs = latestTimeStampMs and merges into cache
   * Guarded by isFetching to avoid overlapping requests across triggers.
   */
  const fetchAndSaveDocsToCache = async (
    mode: "refresh" | "incremental"
  ): Promise<void> => {
    if (isFetching.current) return;
    isFetching.current = true;
    try {
      const sinceMs =
        mode === "refresh" ? Date.now() - HISTORY_WINDOW_MS : latestTimeStampMs;
      const docs = await convex.query(
        api.functions.vesselPings.queries.getPingsSince,
        { sinceMs }
      );
      saveDocsToCache(docs as unknown as ConvexDoc[], mode === "refresh");
    } catch (error) {
      log.error("VesselPings: fetchAndSave failed", { error, mode });
    } finally {
      isFetching.current = false;
    }
  };

  /**
   * Applies fetched Convex docs to local state.
   * - Updates latestTimeStampMs from the newest ping in the batch
   * - Replaces or merges into cache, and prunes stale pings to the history window
   * If replace=true and no docs are returned, clears cache and resets timestamp.
   */
  const saveDocsToCache = (docs: ConvexDoc[], replace: boolean = false) => {
    if (replace && docs.length === 0) {
      setLatestTimeStampMs(0);
      setCache({});
      return;
    }
    if (docs.length === 0) return;
    const pings = docs.map(toPing);
    setLatestTimeStampMs(latestTimeStampFromPings(pings));
    if (replace) {
      setCache(mergeAndFilter({}, pings));
    } else {
      setCache((prev) => mergeAndFilter(prev, pings));
    }
  };

  /** Initial hydration on mount. */
  useEffect(() => {
    void refresh();
  }, [refresh]);

  /**
   * On app resume or network reconnect, immediately refresh to avoid stale data.
   * Debounced slightly to coalesce rapid state flips.
   */
  useOnReconnect(
    () => {
      if (isFetching.current) return;
      void refresh();
    },
    { debounceMs: 300 }
  );

  // Watchdog: check staleness every 5s; refresh if stale and idle
  useEffect(() => {
    const id = setInterval(() => {
      if (!isStaleNow(latestTimeStampMs)) return;
      if (isFetching.current) return;
      void refresh();
    }, 5000);
    return () => clearInterval(id);
  }, [latestTimeStampMs, refresh]);

  return {
    vesselPings: cache,
    latestTimeStampMs,
    refresh,
  } as const;
};

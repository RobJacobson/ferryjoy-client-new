/**
 * Hook for maintaining a 20-minute rolling cache of VesselPings via incremental fetches.
 *
 * Overview
 * - Initial hydration: fetch the last N minutes (see PINGS_HISTORY.HISTORY_MINUTES).
 * - Incremental updates: every UPDATE_INTERVAL_MS, fetch pings strictly newer than
 *   the last seen timestamp and merge them into a grouped cache.
 * - Pruning: after each merge, drop pings older than HISTORY_WINDOW_MS.
 * - Watchdog: a 100ms timer detects staleness (no updates > STALE_MS) and triggers
 *   a panic invalidate() + refresh.
 *
 * Benefits
 * - Minimizes bandwidth: only new pings are fetched after the initial load.
 * - Keeps logic simple: a single source of truth (local cache) and monotonic token (lastTimeStampMs).
 */
import { useConvex } from "convex/react";
import { useCallback, useEffect, useRef, useState } from "react";

import { api } from "@/data/convex/_generated/api";
import { fromConvexDocument } from "@/data/types/converters";
import type { VesselPing } from "@/data/types/domain/VesselPing";
import { log, VESSEL_PINGS_CONSTANTS as PINGS_HISTORY } from "@/shared/lib";

type VesselPingsMap = Record<number, VesselPing[]>;

const UPDATE_INTERVAL_MS = 60_000; // configurable
const STALE_MS = 150_000; // 2m30s

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
 * Computes the latest TimeStamp across all vessels from a grouped cache.
 * @param map Grouped cache of vessel pings
 * @returns Milliseconds since epoch of the most recent ping; 0 when empty
 */
const latestTimeMsFromMap = (map: VesselPingsMap): number =>
  Object.values(map).reduce((maxTime, arr) => {
    const last = arr.length ? arr[arr.length - 1] : undefined;
    const time = last ? last.TimeStamp.getTime() : 0;
    return time > maxTime ? time : maxTime;
  }, 0);

/**
 * Curried transformer to drop pings older than the cutoff.
 * @param cutoff Milliseconds threshold (typically now - HISTORY_WINDOW_MS)
 * @returns Function that returns a pruned VesselPingsMap
 */
const filterStalePingsAt =
  (cutoff: number) =>
  (map: VesselPingsMap): VesselPingsMap =>
    Object.fromEntries(
      Object.entries(map).map(([id, arr]) => [
        Number(id),
        arr.filter((p) => p.TimeStamp.getTime() >= cutoff),
      ])
    ) as VesselPingsMap;

/**
 * Pure merge: converts docs to pings and appends them into a shallow-cloned cache.
 * @param map Existing grouped cache
 * @param docs Convex VesselPing documents
 * @returns New grouped cache with merged arrays
 */
const mergePings = (map: VesselPingsMap, docs: ConvexDoc[]): VesselPingsMap =>
  docs.map(toPing).reduce(groupByVessel, { ...map });

/**
 * Hook to incrementally fetch and maintain a 20-minute VesselPings cache from Convex.
 *
 * @returns Immutable object with:
 *  - vesselPings: grouped cache keyed by VesselID (VesselPingsMap)
 *  - lastTimeStampMs: most recent ping timestamp seen (ms since epoch)
 *  - invalidate: panic function to clear and reload the last N minutes
 */
export const useConvexVesselPings = () => {
  const convex = useConvex();
  const [cache, setCache] = useState<VesselPingsMap>({});
  const [lastTimeStampMs, setLastTimeStampMs] = useState<number>(0);
  const invalidateInflightRef = useRef(false);

  /**
   * Fetch the last N minutes and rebuild the cache (initial load or panic reload).
   */
  const refresh = useCallback(async () => {
    try {
      log.info("VesselPings: refresh 20m");
      const docs = await convex.query(
        api.functions.vesselPings.queries.getRecentPings,
        { minutesAgo: PINGS_HISTORY.HISTORY_MINUTES }
      );
      const next = mergePings({}, docs as unknown as ConvexDoc[]);
      const cutoff = Date.now() - PINGS_HISTORY.HISTORY_WINDOW_MS;
      const pruned = filterStalePingsAt(cutoff)(next);
      setCache(pruned);
      setLastTimeStampMs(latestTimeMsFromMap(pruned));
    } catch (error) {
      log.error("VesselPings: refresh failed", { error });
    }
  }, [convex]);

  /**
   * Panic mode: clear cache and reload last N minutes to recover from staleness.
   */
  const invalidate = useCallback(async () => {
    setCache({});
    setLastTimeStampMs(0);
    await refresh();
  }, [refresh]);

  /** Initial hydration on mount. */
  useEffect(() => {
    void refresh();
  }, [refresh]);

  /**
   * Incremental fetch: every UPDATE_INTERVAL_MS, fetch only pings newer than lastTimeStampMs
   * and merge into the local cache. Each merge prunes beyond the rolling window.
   */
  useEffect(() => {
    const id = setInterval(async () => {
      try {
        const since = lastTimeStampMs;
        const docs = (await convex.query(
          api.functions.vesselPings.queries.getPingsSince,
          { sinceMs: since }
        )) as unknown as ConvexDoc[];

        if (docs.length === 0) return;
        setCache((prev) => {
          const merged = mergePings(prev, docs);
          const cutoff = Date.now() - PINGS_HISTORY.HISTORY_WINDOW_MS;
          return filterStalePingsAt(cutoff)(merged);
        });
        setLastTimeStampMs((prevTs) => {
          const nextTs = latestTimeMsFromMap(mergePings(cache, docs));
          return nextTs > prevTs ? nextTs : prevTs;
        });
      } catch (error) {
        log.error("VesselPings: incremental fetch failed", { error });
      }
    }, UPDATE_INTERVAL_MS);
    return () => clearInterval(id);
  }, [convex, lastTimeStampMs, cache]);

  /**
   * Derived staleness checker against STALE_MS.
   * @param ts Latest known ping timestamp in ms
   */
  const isStaleNow = (ts: number) =>
    ts === 0 ? false : Date.now() - ts > STALE_MS;

  // Watchdog: check staleness every 100ms and invalidate once when crossed
  // biome-ignore lint/correctness/useExhaustiveDependencies: stable function
  useEffect(() => {
    const id = setInterval(() => {
      if (!isStaleNow(lastTimeStampMs)) return;
      if (invalidateInflightRef.current) return;
      invalidateInflightRef.current = true;
      void invalidate().finally(() => {
        invalidateInflightRef.current = false;
      });
    }, 100);
    return () => clearInterval(id);
  }, [lastTimeStampMs, invalidate]);

  return {
    vesselPings: cache,
    lastTimeStampMs,
    invalidate,
  } as const;
};

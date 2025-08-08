import { useQuery } from "convex/react";
import type { PropsWithChildren } from "react";
import { createContext, useContext, useEffect, useRef } from "react";

import { api } from "@/data/convex/_generated/api";
import type { Doc } from "@/data/convex/_generated/dataModel";
import { fromConvexDocument } from "@/data/types/converters";
import type { VesselPing } from "@/data/types/domain/VesselPing";
import { log, VESSEL_HISTORY_MINUTES } from "@/shared/lib";

/**
 * Maps vessel IDs to arrays of their historical pings
 */
type VesselPingsMap = Record<number, VesselPing[]>;

/**
 * Context value providing VesselPing data for the most recent pings of all vessels.
 * Contains pings from the past 20 minutes, grouped by vessel.
 */
type VesselPingContextType = {
  /** VesselPing data mapped by VesselID to array of pings for that vessel */
  vesselPings: VesselPingsMap | undefined;
};

/**
 * React context for sharing VesselPing data across the app.
 * Provides ping data for all vessels from the past 20 minutes with real-time updates.
 */
const VesselPingContext = createContext<VesselPingContextType | undefined>(
  undefined
);

/**
 * Provider component that fetches VesselPing data for the past 20 minutes using Convex.
 * Groups pings by vessel on the client side and provides real-time updates.
 */
export const VesselPingProvider = ({ children }: PropsWithChildren) => {
  const hasLoggedFirstLoad = useRef(false);
  const hasLoggedFirstData = useRef(false);

  // Get all VesselPings from the past 20 minutes
  const rawPingData = useQuery(
    api.functions.vesselPings.queries.getRecentPings,
    {
      minutesAgo: VESSEL_HISTORY_MINUTES,
    }
  );

  // Benchmark: Log when context first loads
  useEffect(() => {
    if (!hasLoggedFirstLoad.current) {
      log.info("VesselPingContext: First load started", {
        timestamp: new Date().toISOString(),
      });
      hasLoggedFirstLoad.current = true;
    }
  }, []);

  // Benchmark: Log when first data arrives
  useEffect(() => {
    if (
      rawPingData &&
      Array.isArray(rawPingData) &&
      !hasLoggedFirstData.current
    ) {
      log.info("VesselPingContext: First data received", {
        timestamp: new Date().toISOString(),
        pingCount: rawPingData.length,
        vesselCount: new Set(rawPingData.map((p) => p.VesselID)).size,
      });
      hasLoggedFirstData.current = true;
    }
  }, [rawPingData]);

  // Transform and group the ping data by vessel
  const vesselPings = processVesselPingData(rawPingData);

  return (
    <VesselPingContext value={{ vesselPings }}>{children}</VesselPingContext>
  );
};

/**
 * Processes raw Convex ping data into grouped vessel pings map
 * Returns undefined if data is invalid or processing fails
 */
const processVesselPingData = (
  rawPingData: Doc<"vesselPings">[] | undefined
): VesselPingsMap | undefined => {
  if (!rawPingData || !Array.isArray(rawPingData)) {
    return undefined;
  }

  try {
    return rawPingData
      .map(fromConvexDocument<VesselPing>)
      .reduce(accumulatePingsByVessel, {});
  } catch (error) {
    log.error("Failed to process vessel ping data", {
      error,
      dataLength: rawPingData.length,
    });
    return undefined; // Graceful degradation
  }
};

/**
 * Reducer function that accumulates pings by vessel ID
 */
const accumulatePingsByVessel = (
  acc: VesselPingsMap,
  ping: VesselPing
): VesselPingsMap => {
  const vesselId = ping.VesselID;
  acc[vesselId] = acc[vesselId] || [];
  acc[vesselId].push(ping);
  return acc;
};

/**
 * Hook to access VesselPing data for all vessels from the past 20 minutes.
 * Provides ping data grouped by vessel with automatic real-time updates.
 * Must be used within VesselPingProvider.
 */
export const useVesselPings = (): VesselPingContextType => {
  const context = useContext(VesselPingContext);
  if (context === undefined) {
    throw new Error("useVesselPings must be used within a VesselPingProvider");
  }
  return context;
};

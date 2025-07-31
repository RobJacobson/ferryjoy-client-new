import { useQuery } from "convex/react";
import type { PropsWithChildren } from "react";
import { createContext, useContext, useMemo } from "react";

import { api } from "@/data/convex/_generated/api";
import {
  toVesselPingFromConvex,
  type VesselPing,
} from "@/data/types/VesselPing";

/**
 * Context value providing VesselPing data for the most recent sailing of each vessel.
 * The sailing is defined as the time period from LeftDockActual (rounded down to minute)
 * to ArvDockActual (rounded up to minute) if completed, or ongoing if in progress.
 */
type VesselPingContextType = {
  /** VesselPing data mapped by VesselID to array of pings for that sailing */
  vesselPings: Record<number, VesselPing[]> | undefined;
  /** Loading state - true while fetching sailing or ping data */
  isLoading: boolean;
};

/**
 * React context for sharing VesselPing data across the app.
 * Provides ping data for the most recent sailing of each vessel with real-time updates.
 */
const VesselPingContext = createContext<VesselPingContextType | undefined>(
  undefined
);

/**
 * Rounds a timestamp down to the start of the minute
 */
const roundDownToMinute = (timestamp: number): number => {
  const date = new Date(timestamp);
  date.setSeconds(0, 0);
  return date.getTime();
};

/**
 * Rounds a timestamp up to the start of the next minute
 */
const roundUpToMinute = (timestamp: number): number => {
  const date = new Date(timestamp);
  date.setSeconds(0, 0);
  date.setMinutes(date.getMinutes() + 1);
  return date.getTime();
};

/**
 * Provider component that fetches VesselPing data for recent sailings using Convex.
 * Automatically determines time ranges based on dock times and provides real-time updates.
 */
export const VesselPingProvider = ({ children }: PropsWithChildren) => {
  // Get most recent sailing info for all vessels
  const sailingData = useQuery(
    api.functions.vesselTrips.queries.getMostRecentSailingByVessel
  );

  // Calculate time ranges for each vessel's most recent sailing
  const vesselRanges = useMemo(() => {
    if (!sailingData) return [];

    return sailingData.map((sailing) => ({
      vesselId: sailing.VesselID,
      startTime: roundDownToMinute(sailing.LeftDockActual),
      endTime: sailing.ArvDockActual
        ? roundUpToMinute(sailing.ArvDockActual)
        : undefined, // No end time if sailing is in progress
    }));
  }, [sailingData]);

  // Get VesselPings for all vessels' recent sailings
  const rawPingData = useQuery(
    api.functions.vesselPings.queries.getByVesselsAndTimeRanges,
    vesselRanges.length > 0 ? { vesselRanges } : "skip"
  );

  // Transform and organize the ping data
  const vesselPings = useMemo(() => {
    if (!rawPingData) return undefined;

    const pingsByVessel: Record<number, VesselPing[]> = {};

    rawPingData.forEach(({ vesselId, pings }) => {
      pingsByVessel[vesselId] = pings.map(toVesselPingFromConvex);
    });

    return pingsByVessel;
  }, [rawPingData]);

  const contextValue: VesselPingContextType = {
    vesselPings,
    isLoading: sailingData === undefined || rawPingData === undefined,
  };

  return <VesselPingContext value={contextValue}>{children}</VesselPingContext>;
};

/**
 * Hook to access VesselPing data for the most recent sailing of each vessel.
 * Provides ping data with automatic real-time updates.
 * Must be used within VesselPingProvider.
 */
export const useVesselPings = (): VesselPingContextType => {
  const context = useContext(VesselPingContext);
  if (context === undefined) {
    throw new Error("useVesselPings must be used within a VesselPingProvider");
  }
  return context;
};

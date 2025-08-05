import { useQuery } from "convex/react";
import type { PropsWithChildren } from "react";
import { createContext, useContext, useEffect, useRef } from "react";

import { api } from "@/data/convex/_generated/api";
import { fromConvex } from "@/data/types/converters";
import type { VesselPing } from "@/data/types/domain/VesselPing";
import { log } from "@/shared/lib/logger";

const MINUTES_HISTORY = 15;

/**
 * Context value providing VesselPing data for the most recent pings of all vessels.
 * Contains pings from the past 20 minutes, grouped by vessel.
 */
type VesselPingContextType = {
  /** VesselPing data mapped by VesselID to array of pings for that vessel */
  vesselPings: Record<number, VesselPing[]> | undefined;
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
    { minutesAgo: MINUTES_HISTORY }
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
    if (rawPingData && !hasLoggedFirstData.current) {
      log.info("VesselPingContext: First data received", {
        timestamp: new Date().toISOString(),
        pingCount: rawPingData.length,
        vesselCount: new Set(rawPingData.map((p) => p.VesselID)).size,
      });
      hasLoggedFirstData.current = true;
    }
  }, [rawPingData]);

  // Transform and group the ping data by vessel
  const vesselPings = !rawPingData
    ? undefined
    : (() => {
        const pingsByVessel = rawPingData.reduce<Record<number, VesselPing[]>>(
          (acc, convexPing) => {
            const { _id, _creationTime, ...pingData } = convexPing;
            const ping = fromConvex(pingData) as unknown as VesselPing;
            const vesselId = ping.VesselID;
            acc[vesselId] = acc[vesselId] || [];
            acc[vesselId].push(ping);
            return acc;
          },
          {}
        );

        // Sort pings by timestamp for each vessel (oldest first)
        Object.values(pingsByVessel).forEach((pings) => {
          pings.sort((a, b) => a.TimeStamp.getTime() - b.TimeStamp.getTime());
        });

        return pingsByVessel;
      })();

  const contextValue: VesselPingContextType = {
    vesselPings,
  };

  return <VesselPingContext value={contextValue}>{children}</VesselPingContext>;
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

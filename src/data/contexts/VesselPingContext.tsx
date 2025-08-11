import type { PropsWithChildren } from "react";
import { createContext, useContext } from "react";

import type { VesselPing } from "@/data/types/domain/VesselPing";
import { useConvexVesselPings } from "@/shared/hooks/useConvexVesselPings";

/**
 * Maps vessel IDs to arrays of their historical pings
 */
type VesselPingsMap = Record<number, VesselPing[]>;

/**
 * Context value providing VesselPing data for the most recent pings of all vessels.
 * Contains pings from the past 20 minutes, grouped by vessel.
 */
type VesselPingContextType = {
  vesselPings: VesselPingsMap;
  lastTimeStampMs: number;
  invalidate: () => Promise<void>;
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
  const { vesselPings, lastTimeStampMs, invalidate } = useConvexVesselPings();
  return (
    <VesselPingContext value={{ vesselPings, lastTimeStampMs, invalidate }}>
      {children}
    </VesselPingContext>
  );
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

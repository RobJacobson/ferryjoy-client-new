import { api } from "@convex/_generated/api";
import { useQuery } from "convex/react";
import type { PropsWithChildren } from "react";
import { createContext, useContext } from "react";

import type { ActiveVesselTrip } from "@/data/types/domain/ActiveVesselTrip";

/**
 * Context value providing combined VesselTrip data (active + completed).
 * Uses Convex's real-time query system for automatic updates.
 * Combines active trips (real-time) with completed trips (polled).
 */
type VesselTripContextType = {
  tripData: ActiveVesselTrip[] | undefined; // Combined active + completed trips, undefined while loading
  isLoading: boolean; // Computed loading state
  error?: Error; // Query error if any occurs
};

/**
 * React context for sharing combined VesselTrip data across the app.
 * Provides real-time updates for active trips combined with completed data.
 * Consumers don't need to distinguish between active and completed trips.
 */
const VesselTripContext = createContext<VesselTripContextType | undefined>(
  undefined
);

/**
 * Provider component that fetches and combines active and completed VesselTrip data.
 * Uses the optimized getTripsSince3AM query that combines both datasets.
 * Provides a unified interface for all trip data.
 */
export const VesselTripProvider = ({ children }: PropsWithChildren) => {
  // Use the active trips query
  const tripData = useQuery(
    api.functions.activeVesselTrips.queries.getActiveTrips,
    {}
  );

  const contextValue: VesselTripContextType = {
    tripData,
    isLoading: tripData === undefined,
  };

  return <VesselTripContext value={contextValue}>{children}</VesselTripContext>;
};

/**
 * Hook to access combined VesselTrip data.
 * Provides unified access to both active and completed trips.
 * Must be used within VesselTripProvider.
 */
export const useTripData = (): VesselTripContextType => {
  const context = useContext(VesselTripContext);
  if (context === undefined) {
    throw new Error("useTripData must be used within a VesselTripProvider");
  }
  return context;
};

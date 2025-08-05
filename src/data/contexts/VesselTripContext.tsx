import { useQuery } from "convex/react";
import type { PropsWithChildren } from "react";
import { createContext, useContext } from "react";

import { api } from "@/data/convex/_generated/api";
import type { Doc } from "@/data/convex/_generated/dataModel";
import { fromConvexVesselTrip } from "@/data/types/convex/VesselTrip";
import type { VesselTrip } from "@/data/types/domain/VesselTrip";

/**
 * Context value providing combined VesselTrip data (active + historical).
 * Uses Convex's real-time query system for automatic updates.
 * Combines active trips (real-time) with historical trips (polled).
 */
type VesselTripContextType = {
  tripData: VesselTrip[] | undefined; // Combined active + historical trips, undefined while loading
  isLoading: boolean; // Computed loading state
  error?: Error; // Query error if any occurs
};

/**
 * React context for sharing combined VesselTrip data across the app.
 * Provides real-time updates for active trips combined with historical data.
 * Consumers don't need to distinguish between active and historical trips.
 */
const VesselTripContext = createContext<VesselTripContextType | undefined>(
  undefined
);

/**
 * Provider component that fetches and combines active and historical VesselTrip data.
 * Uses the optimized getTripsSince3AM query that combines both datasets.
 * Provides a unified interface for all trip data.
 */
export const VesselTripProvider = ({ children }: PropsWithChildren) => {
  // Use the combined query that merges active and historical trips
  const rawTripData = useQuery(
    api.functions.vesselTrips.queries.getTripsSince3AM,
    {}
  );

  const contextValue: VesselTripContextType = {
    tripData: rawTripData?.map((doc) => {
      // Extract the data fields from the document, excluding _id and _creationTime
      const { _id, _creationTime, ...tripData } = doc;
      return fromConvexVesselTrip(tripData);
    }),
    isLoading: rawTripData === undefined,
    // Convex useQuery throws errors through React Error Boundaries
    // For now, we don't expose errors directly in the context
  };

  return <VesselTripContext value={contextValue}>{children}</VesselTripContext>;
};

/**
 * Hook to access combined VesselTrip data.
 * Provides unified access to both active and historical trips.
 * Must be used within VesselTripProvider.
 */
export const useTripData = (): VesselTripContextType => {
  const context = useContext(VesselTripContext);
  if (context === undefined) {
    throw new Error("useTripData must be used within a VesselTripProvider");
  }
  return context;
};

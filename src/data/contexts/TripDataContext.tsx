import { useQuery } from "convex/react";
import type { PropsWithChildren } from "react";
import { createContext, useContext } from "react";

import { api } from "@/data/convex/_generated/api";
import type { Doc } from "@/data/convex/_generated/dataModel";
import {
  type ConvexVesselTrip,
  toVesselTripFromConvex,
  type VesselTrip,
} from "@/data/types/VesselTrip";

/**
 * Context value providing VesselTrip data from 3:00 AM today through now,
 * or 3:00 AM yesterday if current time is between midnight and 3:00 AM.
 * Uses Convex's real-time query system - no manual refetching needed!
 */
type VesselTripDataContextType = {
  tripData: VesselTrip[] | undefined; // Array of vessel trips, undefined while loading
  isLoading: boolean; // Computed loading state
  error?: Error; // Query error if any occurs
};

/**
 * React context for sharing VesselTrip data across the app.
 * Provides trip data from the specified time range for analytics and tracking.
 * Uses Convex's reactive queries for automatic real-time updates.
 */
const VesselTripDataContext = createContext<
  VesselTripDataContextType | undefined
>(undefined);

/**
 * Provider component that fetches VesselTrip data from Convex using useQuery.
 * The query automatically handles the 3:00 AM logic server-side and provides
 * real-time updates when new trip data is inserted or updated.
 */
export const VesselTripDataProvider = ({ children }: PropsWithChildren) => {
  // Convex useQuery automatically handles:
  // - Real-time subscriptions
  // - Server-side query recalculation (including time logic)
  // - React re-renders when data changes
  // - Error handling
  const rawTripData = useQuery(
    api.functions.vesselTrips.queries.getTripsSince3AM
  );

  const contextValue: VesselTripDataContextType = {
    tripData: rawTripData?.map(toVesselTripFromConvex),
    isLoading: rawTripData === undefined,
    // Convex useQuery throws errors through React Error Boundaries
    // For now, we don't expose errors directly in the context
  };

  return (
    <VesselTripDataContext value={contextValue}>
      {children}
    </VesselTripDataContext>
  );
};

/**
 * Hook to access VesselTrip data from the specified time range.
 * Provides trip data and loading state with automatic real-time updates.
 * Must be used within VesselTripDataProvider.
 */
export const useTripData = (): VesselTripDataContextType => {
  const context = useContext(VesselTripDataContext);
  if (context === undefined) {
    throw new Error("useTripData must be used within a VesselTripDataProvider");
  }
  return context;
};

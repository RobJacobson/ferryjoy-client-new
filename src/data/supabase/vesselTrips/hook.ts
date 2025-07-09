// VesselTrips React hook

import { createSupabaseHook } from "../shared/useSupabaseRealtime";
import type { Tables } from "../types";
import { fetchTrips } from "./api";
import { toVesselTrip } from "./converter";
import type { VesselTrip } from "./types";

/**
 * Hook function for fetching and managing vessel trip data with real-time updates from Supabase
 *
 * Fetches vessel trips from 3 AM today (or yesterday if before 3 AM) and maintains
 * real-time subscription for live updates. Returns trips grouped by vessel abbreviation
 * for easy lookup and state management.
 *
 * @returns {Object} Object containing:
 *   - data: Map of trips grouped by vessel abbreviation
 *   - loading: Boolean indicating if initial data is being fetched
 *   - error: Error message if data fetching fails
 */
export const useVesselTrip = createSupabaseHook<VesselTrip>({
  fetchData: fetchTrips,
  keyExtractor: (trip) => trip.vesselAbrv,
  realtime: {
    tableName: "vessel_trip",
    filterField: "start_at",
    channelName: "vessel_trip_changes",
  },
  toDomainModel: (payload) => toVesselTrip(payload as Tables<"vessel_trip">),
  dependencies: [], // Run only on mount
});

// Export for backward compatibility
export const useVesselTrips = useVesselTrip;

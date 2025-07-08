// VesselPositionMinute React hook

import { createSupabaseHook } from "../shared/useSupabaseRealtime";
import type { VesselTripMap } from "../vesselTrips/types";
import { fetchVesselPositionMinutesForTrips } from "./api";
import { toVesselPositionMinute } from "./converter";
import type { VesselPositionMinute, VesselPositionMinuteRow } from "./types";

/**
 * Hook function for fetching and managing vessel position minute data with real-time updates from Supabase
 *
 * Fetches vessel position minute data for the last two trips per vessel, only after VesselTrips have loaded.
 * Maintains real-time subscription for live updates. Returns positions grouped by trip ID for easy lookup
 * and state management. Only includes positions with non-null trip_id.
 *
 * @param vesselTrips - Map of vessel trips grouped by vessel abbreviation
 * @param tripsLoading - Whether vessel trips are still loading
 * @returns {Object} Object containing:
 *   - data: Map of positions grouped by trip ID
 *   - loading: Boolean indicating if initial data is being fetched
 *   - error: Error message if data fetching fails
 */
export const useVesselPositionMinute = (
  vesselTrips: VesselTripMap,
  tripsLoading: boolean
) => {
  // Extract trip IDs from the last two trips per vessel
  const tripIds = Object.values(vesselTrips).flatMap((trips) =>
    trips.slice(-2).map((trip) => trip.id)
  );

  // Create a wrapper function that fetches data for specific trip IDs
  const fetchData = async (startTime: Date, tripIds: number[]) => {
    if (tripIds.length === 0) return [];
    return fetchVesselPositionMinutesForTrips(tripIds, startTime);
  };

  // Use the shared hook factory - always create the hook
  const hook = createSupabaseHook<VesselPositionMinute, [number[]]>({
    fetchData,
    keyExtractor: (position) => position.tripID,
    realtime: {
      tableName: "vessel_location_minute",
      filterField: "timestamp",
      channelName: "vessel_position_minute_changes",
    },
    toDomainModel: (payload) =>
      toVesselPositionMinute(payload as VesselPositionMinuteRow),
    dependencies: [tripsLoading], // Only depend on loading state, not vesselTrips object
  });

  // Always call the hook, but handle loading state in the fetchData function
  const result = hook(tripsLoading ? [] : tripIds);

  // Override loading state when trips are still loading
  if (tripsLoading) {
    return { data: {}, loading: true, error: null };
  }

  return result;
};

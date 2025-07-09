// VesselPositionMinute API functions

import log from "@/lib/logger";

import { supabase } from "../client";
import { toVesselPositionMinute } from "./converter";
import type { VesselPositionMinute } from "./types";

/**
 * Fetches all vessel position minute data from Supabase database
 *
 * Retrieves position data for all vessels from the specified start time onwards.
 * Only includes positions with non-null trip_id values.
 *
 * @param startTime - The earliest timestamp to fetch positions from
 * @returns Promise resolving to an array of VesselPositionMinute objects
 * @throws Error if Supabase is not configured or database query fails
 */
export const fetchVesselPositionMinutes = async (
  startTime: Date
): Promise<VesselPositionMinute[]> => {
  if (!supabase) throw new Error("Supabase not configured");

  const { data, error } = await supabase
    .from("vessel_location_minute")
    .select("*")
    .not("trip_id", "is", null)
    .gte("timestamp", startTime.toISOString())
    .order("timestamp", { ascending: true });

  if (error) throw error;
  return data?.map(toVesselPositionMinute) ?? [];
};

// Fetch vessel position minute data for specific trip IDs
/**
 * Fetches vessel position minute data for specific trip IDs
 *
 * Retrieves position data only for the specified trip IDs from the given start time.
 * Useful for fetching position data for specific vessel trips only.
 *
 * @param tripIds - Array of trip IDs to fetch position data for
 * @param startTime - The earliest timestamp to fetch positions from
 * @returns Promise resolving to an array of VesselPositionMinute objects
 * @throws Error if Supabase is not configured or database query fails
 */
export const fetchVesselPositionMinutesForTrips = async (
  tripIds: number[],
  startTime: Date
): Promise<VesselPositionMinute[]> => {
  if (!supabase) throw new Error("Supabase not configured");
  if (tripIds.length === 0) return [];

  const { data, error } = await supabase
    .from("vessel_location_minute")
    .select("*")
    .in("trip_id", tripIds)
    .gte("timestamp", startTime.toISOString())
    .order("timestamp", { ascending: true });

  if (error) throw error;
  return data?.map(toVesselPositionMinute) ?? [];
};

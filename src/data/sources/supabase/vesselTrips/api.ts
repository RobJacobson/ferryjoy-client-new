// VesselTrips API functions

import log from "@/lib/logger";

import { supabase } from "../client";
import { toVesselTrip } from "./converter";
import type { VesselTrip } from "./types";

/**
 * Fetches vessel trips from Supabase database
 *
 * Retrieves all vessel trips from the specified start time onwards.
 * Automatically converts database rows to domain models.
 *
 * @param startTime - The earliest timestamp to fetch trips from (typically 3 AM today)
 * @returns Promise resolving to an array of VesselTrip objects
 * @throws Error if Supabase is not configured or database query fails
 */
export const fetchTrips = async (startTime: Date): Promise<VesselTrip[]> => {
  if (!supabase) throw new Error("Supabase not configured");

  const { data, error } = await supabase
    .from("vessel_trip")
    .select("*")
    .gte("start_at", startTime.toISOString())
    .order("id", { ascending: true });

  if (error) throw error;
  return data?.map(toVesselTrip) ?? [];
};

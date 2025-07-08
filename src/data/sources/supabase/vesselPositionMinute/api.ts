// VesselPositionMinute API functions

import log from "@/lib/logger";

import { supabase } from "../client";
import { toVesselPositionMinute } from "./converter";
import type { VesselPositionMinute } from "./types";

// Fetch vessel position minute data from Supabase starting from given time
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

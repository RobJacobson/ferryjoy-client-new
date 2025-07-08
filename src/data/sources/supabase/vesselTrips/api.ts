// VesselTrips API functions

import log from "@/lib/logger";

import { supabase } from "../client";
import { toVesselTrip } from "./converter";
import type { VesselTrip } from "./types";

// Fetch vessel trips from Supabase starting from given time
export const fetchTrips = async (startTime: Date): Promise<VesselTrip[]> => {
  if (!supabase) throw new Error("Supabase not configured");

  const { data, error } = await supabase
    .from("vessel_trip")
    .select("*")
    .gte("start_at", startTime.toISOString())
    .order("start_at", { ascending: true });

  if (error) throw error;
  return data?.map(toVesselTrip) ?? [];
};

import { useQuery } from "@tanstack/react-query";

import { isSupabaseConfigured, supabase } from "../client";
import type { Tables } from "../database.types";
import { withMonitoring } from "../simpleMonitoring";

/**
 * Fetch vessel trip data from Supabase
 */
const fetchVesselTrip = async (): Promise<Tables<"vessel_trip">[]> => {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error("Supabase not configured");
  }

  const { data, error } = await supabase
    .from("vessel_trip")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch vessel trip: ${error.message}`);
  }

  return data || [];
};

// Simple monitored version
const getVesselTrip = withMonitoring(fetchVesselTrip, "vessel_trip");

/**
 * React Query hook for vessel trip data
 */
export const useVesselTrip = () => {
  return useQuery({
    queryKey: ["vessel_trip"],
    queryFn: getVesselTrip,
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // 1 minute
  });
};

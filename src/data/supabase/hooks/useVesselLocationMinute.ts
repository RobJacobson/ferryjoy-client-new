import { useQuery } from "@tanstack/react-query";

import { isSupabaseConfigured, supabase } from "../client";
import type { Tables } from "../database.types";
import { withMonitoring } from "../simpleMonitoring";

/**
 * Fetch vessel location minute data from Supabase
 */
const fetchVesselLocationMinute = async (): Promise<
  Tables<"vessel_location_minute">[]
> => {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error("Supabase not configured");
  }

  const { data, error } = await supabase
    .from("vessel_location_minute")
    .select("*")
    .order("timestamp", { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch vessel location minute: ${error.message}`);
  }

  return data || [];
};

// Simple monitored version
const getVesselLocationMinute = withMonitoring(
  fetchVesselLocationMinute,
  "vessel_location_minute"
);

/**
 * React Query hook for vessel location minute data
 */
export const useVesselLocationMinute = () => {
  return useQuery({
    queryKey: ["vessel_location_minute"],
    queryFn: getVesselLocationMinute,
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // 1 minute
  });
};

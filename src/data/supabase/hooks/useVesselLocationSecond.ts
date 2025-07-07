import { useQuery } from "@tanstack/react-query";

import { isSupabaseConfigured, supabase } from "../client";
import type { Tables } from "../database.types";
import { withMonitoring } from "../simpleMonitoring";

/**
 * Fetch vessel location second data from Supabase
 */
const fetchVesselLocationSecond = async (): Promise<
  Tables<"vessel_location_second">[]
> => {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error("Supabase not configured");
  }

  const { data, error } = await supabase
    .from("vessel_location_second")
    .select("*")
    .order("timestamp", { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch vessel location second: ${error.message}`);
  }

  return data || [];
};

// Simple monitored version
const getVesselLocationSecond = withMonitoring(
  fetchVesselLocationSecond,
  "vessel_location_second"
);

/**
 * React Query hook for vessel location second data
 */
export const useVesselLocationSecond = () => {
  return useQuery({
    queryKey: ["vessel_location_second"],
    queryFn: getVesselLocationSecond,
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // 1 minute
  });
};

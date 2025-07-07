import { useQuery } from "@tanstack/react-query";

import { isSupabaseConfigured, supabase } from "../client";
import type { Tables } from "../database.types";
import { withMonitoring } from "../simpleMonitoring";

/**
 * Fetch vessel location current data from Supabase
 */
const fetchVesselLocationCurrent = async (): Promise<
  Tables<"vessel_location_current">[]
> => {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error("Supabase not configured");
  }

  const { data, error } = await supabase
    .from("vessel_location_current")
    .select("*")
    .order("timestamp", { ascending: false });

  if (error) {
    throw new Error(
      `Failed to fetch vessel location current: ${error.message}`
    );
  }

  return data || [];
};

// Simple monitored version
const getVesselLocationCurrent = withMonitoring(
  fetchVesselLocationCurrent,
  "vessel_location_current"
);

/**
 * React Query hook for vessel location current data
 */
export const useVesselLocationCurrent = () => {
  return useQuery({
    queryKey: ["vessel_location_current"],
    queryFn: getVesselLocationCurrent,
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // 1 minute
  });
};

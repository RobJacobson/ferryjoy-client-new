import { useQuery } from "@tanstack/react-query";

import { supabase } from "../client";
import { transformVesselLocationMinute } from "../transformers";
import type { VesselLocationMinute } from "../types";

/**
 * Fetches vessel location minute data from Supabase
 */
const getVesselLocationMinute = async (): Promise<VesselLocationMinute[]> => {
  const { data, error } = await supabase
    .from("vessel_location_minute")
    .select("*")
    .order("timestamp", { ascending: false });

  if (error) {
    throw new Error(
      `Failed to fetch vessel location minute data: ${error.message}`
    );
  }

  return data.map(transformVesselLocationMinute);
};

/**
 * React Query hook for vessel location minute data
 * Provides caching, background updates, and error handling
 */
export const useVesselLocationMinute = () => {
  return useQuery({
    queryKey: ["supabase", "vessel_location_minute"],
    queryFn: getVesselLocationMinute,
    staleTime: 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 60 * 1000, // Refetch every minute
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

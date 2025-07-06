import { useQuery } from "@tanstack/react-query";

import { supabase } from "../client";
import { transformVesselLocationSecond } from "../transformers";
import type { VesselLocationSecond } from "../types";

/**
 * Fetches vessel location second data from Supabase
 */
const getVesselLocationSecond = async (): Promise<VesselLocationSecond[]> => {
  const { data, error } = await supabase
    .from("vessel_location_second")
    .select("*")
    .order("timestamp", { ascending: false })
    .limit(1000); // Limit to prevent overwhelming the client

  if (error) {
    throw new Error(
      `Failed to fetch vessel location second data: ${error.message}`
    );
  }

  return data.map(transformVesselLocationSecond);
};

/**
 * React Query hook for vessel location second data
 * Provides caching, background updates, and error handling
 */
export const useVesselLocationSecond = () => {
  return useQuery({
    queryKey: ["supabase", "vessel_location_second"],
    queryFn: getVesselLocationSecond,
    staleTime: 5 * 1000, // 5 seconds
    gcTime: 60 * 1000, // 1 minute
    refetchInterval: 5 * 1000, // Refetch every 5 seconds
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

import { useQuery } from "@tanstack/react-query";

import log from "@/lib/logger";

import { isSupabaseConfigured, supabase } from "../client";
import { transformVesselLocationSecond } from "../transformers";
import type { VesselLocationSecond } from "../types";

/**
 * Fetches vessel location second data from Supabase
 */
const getVesselLocationSecond = async (): Promise<VesselLocationSecond[]> => {
  if (!isSupabaseConfigured || !supabase) {
    log.debug(
      "Skipping vessel location second fetch - Supabase not configured"
    );
    return [];
  }

  log.debug("Fetching vessel location second data");

  try {
    const { data, error } = await supabase
      .from("vessel_location_second")
      .select("*")
      .order("timestamp", { ascending: false })
      .limit(1000); // Limit to prevent overwhelming the client

    if (error) {
      log.error("Failed to fetch vessel location second data:", error.message);
      throw new Error(
        `Failed to fetch vessel location second data: ${error.message}`
      );
    }

    const transformedData = data.map(transformVesselLocationSecond);
    log.debug(
      `Successfully fetched ${transformedData.length} vessel location second records`
    );
    return transformedData;
  } catch (error) {
    log.error("Error in getVesselLocationSecond:", error);
    throw error;
  }
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
    refetchInterval: isSupabaseConfigured ? 5 * 1000 : false, // Only refetch if configured
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

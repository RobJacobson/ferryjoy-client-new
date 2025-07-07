import { useQuery } from "@tanstack/react-query";

import log from "@/lib/logger";

import { isSupabaseConfigured, supabase } from "../client";
import { transformVesselLocationMinute } from "../transformers";
import type { VesselLocationMinute } from "../types";

/**
 * Fetches vessel location minute data from Supabase
 */
const getVesselLocationMinute = async (): Promise<VesselLocationMinute[]> => {
  if (!isSupabaseConfigured || !supabase) {
    log.debug(
      "Skipping vessel location minute fetch - Supabase not configured"
    );
    return [];
  }

  log.debug("Fetching vessel location minute data");

  try {
    const { data, error } = await supabase
      .from("vessel_location_minute")
      .select("*")
      .order("timestamp", { ascending: false });

    if (error) {
      log.error("Failed to fetch vessel location minute data:", error.message);
      throw new Error(
        `Failed to fetch vessel location minute data: ${error.message}`
      );
    }

    const transformedData = data.map(transformVesselLocationMinute);
    log.debug(
      `Successfully fetched ${transformedData.length} vessel location minute records`
    );
    return transformedData;
  } catch (error) {
    log.error("Error in getVesselLocationMinute:", error);
    throw error;
  }
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
    refetchInterval: isSupabaseConfigured ? 60 * 1000 : false, // Only refetch if configured
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

import { useQuery } from "@tanstack/react-query";

import log from "@/lib/logger";

import { isSupabaseConfigured, supabase } from "../client";
import { transformVesselLocationCurrent } from "../transformers";
import type { VesselLocationCurrent } from "../types";

/**
 * Fetches vessel location current data from Supabase
 */
const getVesselLocationCurrent = async (): Promise<VesselLocationCurrent[]> => {
  if (!isSupabaseConfigured || !supabase) {
    log.debug(
      "Skipping vessel location current fetch - Supabase not configured"
    );
    return [];
  }

  log.debug("Fetching vessel location current data");

  try {
    const { data, error } = await supabase
      .from("vessel_location_current")
      .select("*")
      .order("timestamp", { ascending: false });

    if (error) {
      log.error("Failed to fetch vessel location current data:", error.message);
      throw new Error(
        `Failed to fetch vessel location current data: ${error.message}`
      );
    }

    const transformedData = data.map(transformVesselLocationCurrent);
    log.debug(
      `Successfully fetched ${transformedData.length} vessel location current records`
    );
    return transformedData;
  } catch (error) {
    log.error("Error in getVesselLocationCurrent:", error);
    throw error;
  }
};

/**
 * React Query hook for vessel location current data
 * Provides caching, background updates, and error handling
 */
export const useVesselLocationCurrent = () => {
  return useQuery({
    queryKey: ["supabase", "vessel_location_current"],
    queryFn: getVesselLocationCurrent,
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: isSupabaseConfigured ? 30 * 1000 : false, // Only refetch if configured
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

import { useQuery } from "@tanstack/react-query";

import log from "@/lib/logger";

import { isSupabaseConfigured, supabase } from "../client";
import { transformVesselTrip } from "../transformers";
import type { VesselTrip } from "../types";

/**
 * Fetches vessel trip data from Supabase
 */
const getVesselTrip = async (): Promise<VesselTrip[]> => {
  if (!isSupabaseConfigured || !supabase) {
    log.debug("Skipping vessel trip fetch - Supabase not configured");
    return [];
  }

  log.debug("Fetching vessel trip data");

  try {
    const { data, error } = await supabase
      .from("vessel_trip")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      log.error("Failed to fetch vessel trip data:", error.message);
      throw new Error(`Failed to fetch vessel trip data: ${error.message}`);
    }

    const transformedData = data.map(transformVesselTrip);
    log.debug(
      `Successfully fetched ${transformedData.length} vessel trip records`
    );
    return transformedData;
  } catch (error) {
    log.error("Error in getVesselTrip:", error);
    throw error;
  }
};

/**
 * React Query hook for vessel trip data
 * Provides caching, background updates, and error handling
 */
export const useVesselTrip = () => {
  return useQuery({
    queryKey: ["supabase", "vessel_trip"],
    queryFn: getVesselTrip,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchInterval: isSupabaseConfigured ? 5 * 60 * 1000 : false, // Only refetch if configured
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

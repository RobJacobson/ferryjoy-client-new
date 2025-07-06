import { useQuery } from "@tanstack/react-query";

import { supabase } from "../client";
import { transformVesselTrip } from "../transformers";
import type { VesselTrip } from "../types";

/**
 * Fetches vessel trip data from Supabase
 */
const getVesselTrip = async (): Promise<VesselTrip[]> => {
  const { data, error } = await supabase
    .from("vessel_trip")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch vessel trip data: ${error.message}`);
  }

  return data.map(transformVesselTrip);
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
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

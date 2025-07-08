// VesselLocations React Query hooks

import { type UseQueryOptions, useQuery } from "@tanstack/react-query";

import { getVesselLocations } from "./api";
import type { VesselLocation } from "./types";

const SECOND = 1000;

/**
 * Hook function for fetching vessel location data from WSF API with React Query
 */
export const useVesselLocations = (
  options?: UseQueryOptions<VesselLocation[], Error>
) =>
  useQuery({
    queryKey: ["wsf", "vessels", "locations"],
    queryFn: getVesselLocations,
    staleTime: 30 * SECOND, // 30 seconds
    gcTime: 5 * 60 * SECOND, // 5 minutes
    refetchInterval: 15 * SECOND, // Refetch every 15 seconds
    refetchIntervalInBackground: true, // Continue refetching when app is in background
    retry: 3,
    retryDelay: (attemptIndex: number) => SECOND * 2 ** attemptIndex,
    ...options,
  });

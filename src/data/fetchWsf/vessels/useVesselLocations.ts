import { type UseQueryOptions, useQuery } from "@tanstack/react-query";

import type {
  VesselLocation,
  VesselLocationApiResponse,
} from "@/data/shared/VesselLocation";
import { toVesselLocationFromWsf } from "@/data/shared/VesselLocation";

import { API_BASE, API_KEY, fetchWsf } from "../../shared/fetch";

const SECOND = 1000;

// API function
export const getVesselLocations = async (): Promise<VesselLocation[]> => {
  const url = `${API_BASE}/vessellocations?apiaccesscode=${API_KEY}`;
  const rawData = await fetchWsf<VesselLocationApiResponse[]>(url);
  if (!rawData) return [];

  const result = rawData.map(toVesselLocationFromWsf);

  return result;
};

// Hook
export const useVesselLocations = (
  options?: Partial<UseQueryOptions<VesselLocation[]>>
) => {
  return useQuery({
    queryKey: ["wsf", "vessels", "locations"],
    queryFn: getVesselLocations,
    staleTime: 10 * SECOND,
    gcTime: 20 * SECOND,
    refetchInterval: 5 * SECOND,
    retry: 3,
    retryDelay: (attemptIndex: number) => SECOND * 2 ** attemptIndex,
    ...options,
  });
};

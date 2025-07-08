// Schedule Vessels hooks

import { useQuery } from "@tanstack/react-query";

import type { Vessel } from "../shared/types";
import { getVessels, getVesselsByRoute } from "./api";

/**
 * Hook for fetching all vessels from WSF Schedule API
 *
 * Retrieves all available ferry vessels with their basic information
 * including vessel IDs, names, classes, capacities, and status.
 *
 * @returns React Query result with array of Vessel objects
 */
export const useVessels = () => {
  return useQuery({
    queryKey: ["schedule", "vessels"],
    queryFn: getVessels,
  });
};

/**
 * Hook for fetching vessels by route from WSF Schedule API
 *
 * Retrieves vessels that are assigned to a specific route,
 * useful for understanding which vessels serve a particular route.
 *
 * @param routeId - The route ID to fetch vessels for
 * @returns React Query result with array of Vessel objects
 */
export const useVesselsByRoute = (routeId: number) => {
  return useQuery({
    queryKey: ["schedule", "vessels", "byRoute", routeId],
    queryFn: () => getVesselsByRoute({ routeID: routeId }),
    enabled: !!routeId,
  });
};

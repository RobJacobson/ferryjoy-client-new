// Schedule Vessels hooks

import { useQuery } from "@tanstack/react-query";

import type { Vessel } from "../../vessels/types";
import { getVessels, getVesselsByRoute } from "./api";

/**
 * Hook for fetching all vessels from WSF Schedule API
 */
export const useVessels = () => {
  return useQuery({
    queryKey: ["schedule", "vessels"],
    queryFn: getVessels,
  });
};

/**
 * Hook for fetching vessels by route from WSF Schedule API
 */
export const useVesselsByRoute = (routeId: number) => {
  return useQuery({
    queryKey: ["schedule", "vessels", "byRoute", routeId],
    queryFn: () => getVesselsByRoute(routeId),
    enabled: !!routeId,
  });
};

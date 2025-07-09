// Schedule Time Adjustments hooks

import { useQuery } from "@tanstack/react-query";

import type { TimeAdjustment } from "../types";
import {
  getTimeAdjustments,
  getTimeAdjustmentsByRoute,
  getTimeAdjustmentsBySchedRoute,
} from "./api";

/**
 * Hook for fetching all time adjustments from WSF Schedule API
 */
export const useTimeAdjustments = () => {
  return useQuery({
    queryKey: ["schedule", "timeAdjustments"],
    queryFn: getTimeAdjustments,
  });
};

/**
 * Hook for fetching time adjustments by route from WSF Schedule API
 */
export const useTimeAdjustmentsByRoute = (routeId: number) => {
  return useQuery({
    queryKey: ["schedule", "timeAdjustments", "byRoute", routeId],
    queryFn: () => getTimeAdjustmentsByRoute(routeId),
    enabled: !!routeId,
  });
};

/**
 * Hook for fetching time adjustments by scheduled route from WSF Schedule API
 */
export const useTimeAdjustmentsBySchedRoute = (schedRouteID: number) => {
  return useQuery({
    queryKey: ["schedule", "timeAdjustments", "bySchedRoute", schedRouteID],
    queryFn: () => getTimeAdjustmentsBySchedRoute(schedRouteID),
    enabled: !!schedRouteID,
  });
};

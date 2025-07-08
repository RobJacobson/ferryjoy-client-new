// Schedule Routes hooks

import { useQuery } from "@tanstack/react-query";

import type { Route } from "../shared/types";
import {
  getActiveSeasons,
  getAlerts,
  getRouteDetails,
  getRouteDetailsByRoute,
  getRouteDetailsByTerminals,
  getRoutes,
  getRoutesByDate,
  getRoutesByTerminals,
  getRoutesWithDisruptions,
  getScheduledRoutes,
  getScheduledRoutesBySeason,
} from "./api";

/**
 * Parameters for fetching routes by terminals
 */
type RoutesByTerminalsParams = {
  tripDate: Date;
  departingTerminalId: number;
  arrivingTerminalId: number;
};

/**
 * Hook for fetching all routes from WSF Schedule API
 */
export const useRoutes = () => {
  return useQuery({
    queryKey: ["schedule", "routes"],
    queryFn: getRoutes,
  });
};

/**
 * Hook for fetching routes by date from WSF Schedule API
 */
export const useRoutesByDate = (tripDate: Date) => {
  return useQuery({
    queryKey: [
      "schedule",
      "routes",
      "byDate",
      tripDate.toISOString().split("T")[0],
    ],
    queryFn: () => getRoutesByDate({ tripDate }),
    enabled: !!tripDate,
  });
};

/**
 * Hook for fetching routes between specific terminals from WSF Schedule API
 */
export const useRoutesByTerminals = (params: RoutesByTerminalsParams) => {
  return useQuery({
    queryKey: [
      "schedule",
      "routes",
      "byTerminals",
      params.tripDate.toISOString().split("T")[0],
      params.departingTerminalId,
      params.arrivingTerminalId,
    ],
    queryFn: () =>
      getRoutesByTerminals({
        tripDate: params.tripDate,
        departingTerminalID: params.departingTerminalId,
        arrivingTerminalID: params.arrivingTerminalId,
      }),
    enabled:
      !!params.tripDate &&
      !!params.departingTerminalId &&
      !!params.arrivingTerminalId,
  });
};

/**
 * Hook for fetching routes with service disruptions from WSF Schedule API
 */
export const useRoutesWithDisruptions = (tripDate: Date) => {
  return useQuery({
    queryKey: [
      "schedule",
      "routes",
      "withDisruptions",
      tripDate.toISOString().split("T")[0],
    ],
    queryFn: () => getRoutesWithDisruptions({ tripDate }),
    enabled: !!tripDate,
  });
};

/**
 * Hook for fetching route details from WSF Schedule API
 */
export const useRouteDetails = (tripDate: Date) => {
  return useQuery({
    queryKey: [
      "schedule",
      "routes",
      "details",
      tripDate.toISOString().split("T")[0],
    ],
    queryFn: () => getRouteDetails({ tripDate }),
    enabled: !!tripDate,
  });
};

/**
 * Hook for fetching route details by terminals from WSF Schedule API
 */
export const useRouteDetailsByTerminals = (params: RoutesByTerminalsParams) => {
  return useQuery({
    queryKey: [
      "schedule",
      "routes",
      "detailsByTerminals",
      params.tripDate.toISOString().split("T")[0],
      params.departingTerminalId,
      params.arrivingTerminalId,
    ],
    queryFn: () =>
      getRouteDetailsByTerminals({
        tripDate: params.tripDate,
        departingTerminalID: params.departingTerminalId,
        arrivingTerminalID: params.arrivingTerminalId,
      }),
    enabled:
      !!params.tripDate &&
      !!params.departingTerminalId &&
      !!params.arrivingTerminalId,
  });
};

/**
 * Hook for fetching route details by route from WSF Schedule API
 */
export const useRouteDetailsByRoute = (tripDate: Date, routeId: number) => {
  return useQuery({
    queryKey: [
      "schedule",
      "routes",
      "detailsByRoute",
      tripDate.toISOString().split("T")[0],
      routeId,
    ],
    queryFn: () => getRouteDetailsByRoute({ tripDate, routeID: routeId }),
    enabled: !!tripDate && !!routeId,
  });
};

/**
 * Hook for fetching scheduled routes from WSF Schedule API
 */
export const useScheduledRoutes = () => {
  return useQuery({
    queryKey: ["schedule", "scheduledRoutes"],
    queryFn: getScheduledRoutes,
  });
};

/**
 * Hook for fetching scheduled routes by season from WSF Schedule API
 */
export const useScheduledRoutesBySeason = (scheduleId: number) => {
  return useQuery({
    queryKey: ["schedule", "scheduledRoutes", "bySeason", scheduleId],
    queryFn: () => getScheduledRoutesBySeason({ scheduleID: scheduleId }),
    enabled: !!scheduleId,
  });
};

/**
 * Hook for fetching active seasons from WSF Schedule API
 */
export const useActiveSeasons = () => {
  return useQuery({
    queryKey: ["schedule", "activeSeasons"],
    queryFn: getActiveSeasons,
  });
};

/**
 * Hook for fetching alerts from WSF Schedule API
 */
export const useAlerts = () => {
  return useQuery({
    queryKey: ["schedule", "alerts"],
    queryFn: getAlerts,
  });
};

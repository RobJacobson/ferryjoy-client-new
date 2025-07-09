// Schedule Schedules hooks

import { useQuery } from "@tanstack/react-query";

import type { ScheduleDeparture as Sailing, Schedule } from "../types";
import {
  getAllSailings,
  getSailings,
  getScheduleByRoute,
  getScheduleByTerminals,
  getScheduleTodayByRoute,
  getScheduleTodayByTerminals,
} from "./api";

/**
 * Hook for fetching schedule by route from WSF Schedule API
 */
export const useScheduleByRoute = (tripDate: Date, routeId: number) => {
  return useQuery({
    queryKey: [
      "schedule",
      "schedules",
      "byRoute",
      tripDate.toISOString().split("T")[0],
      routeId,
    ],
    queryFn: () => getScheduleByRoute({ tripDate, routeID: routeId }),
    enabled: !!tripDate && !!routeId,
  });
};

/**
 * Hook for fetching schedule by terminals from WSF Schedule API
 */
export const useScheduleByTerminals = (params: {
  tripDate: Date;
  departingTerminalID: number;
  arrivingTerminalID: number;
}) => {
  return useQuery({
    queryKey: [
      "schedule",
      "schedules",
      "byTerminals",
      params.tripDate.toISOString().split("T")[0],
      params.departingTerminalID,
      params.arrivingTerminalID,
    ],
    queryFn: () => getScheduleByTerminals(params),
    enabled:
      !!params.tripDate &&
      !!params.departingTerminalID &&
      !!params.arrivingTerminalID,
  });
};

/**
 * Hook for fetching today's schedule by route from WSF Schedule API
 */
export const useScheduleTodayByRoute = (routeId: number) => {
  return useQuery({
    queryKey: ["schedule", "schedules", "todayByRoute", routeId],
    queryFn: () => getScheduleTodayByRoute({ routeID: routeId }),
    enabled: !!routeId,
  });
};

/**
 * Hook for fetching today's schedule by terminals from WSF Schedule API
 */
export const useScheduleTodayByTerminals = (params: {
  departingTerminalID: number;
  arrivingTerminalID: number;
}) => {
  return useQuery({
    queryKey: [
      "schedule",
      "schedules",
      "todayByTerminals",
      params.departingTerminalID,
      params.arrivingTerminalID,
    ],
    queryFn: () => getScheduleTodayByTerminals(params),
    enabled: !!params.departingTerminalID && !!params.arrivingTerminalID,
  });
};

/**
 * Hook for fetching sailings from WSF Schedule API
 */
export const useSailings = (schedRouteID: number) => {
  return useQuery({
    queryKey: ["schedule", "sailings", schedRouteID],
    queryFn: () => getSailings({ schedRouteID }),
    enabled: !!schedRouteID,
  });
};

/**
 * Hook for fetching all sailings from WSF Schedule API
 */
export const useAllSailings = (schedRouteID: number, year: number) => {
  return useQuery({
    queryKey: ["schedule", "allSailings", schedRouteID, year],
    queryFn: () => getAllSailings({ schedRouteID, year }),
    enabled: !!schedRouteID && !!year,
  });
};

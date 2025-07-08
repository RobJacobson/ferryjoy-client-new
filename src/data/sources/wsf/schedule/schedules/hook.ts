// Schedule Schedules hooks

import { useQuery } from "@tanstack/react-query";

import {
  getAllSailings,
  getSailings,
  getScheduleByRoute,
  getScheduleByTerminals,
  getScheduleTodayByRoute,
  getScheduleTodayByTerminals,
} from "./api";
import type { Sailing, Schedule } from "./types";

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
export const useScheduleByTerminals = (
  tripDate: Date,
  departingTerminalId: number,
  arrivingTerminalId: number
) => {
  return useQuery({
    queryKey: [
      "schedule",
      "schedules",
      "byTerminals",
      tripDate.toISOString().split("T")[0],
      departingTerminalId,
      arrivingTerminalId,
    ],
    queryFn: () =>
      getScheduleByTerminals({
        tripDate,
        departingTerminalID: departingTerminalId,
        arrivingTerminalID: arrivingTerminalId,
      }),
    enabled: !!tripDate && !!departingTerminalId && !!arrivingTerminalId,
  });
};

/**
 * Hook for fetching today's schedule by route from WSF Schedule API
 */
export const useScheduleTodayByRoute = (
  routeId: number,
  onlyRemainingTimes = false
) => {
  return useQuery({
    queryKey: [
      "schedule",
      "schedules",
      "todayByRoute",
      routeId,
      onlyRemainingTimes,
    ],
    queryFn: () =>
      getScheduleTodayByRoute({ routeID: routeId, onlyRemainingTimes }),
    enabled: !!routeId,
  });
};

/**
 * Hook for fetching today's schedule by terminals from WSF Schedule API
 */
export const useScheduleTodayByTerminals = (
  departingTerminalId: number,
  arrivingTerminalId: number,
  onlyRemainingTimes = false
) => {
  return useQuery({
    queryKey: [
      "schedule",
      "schedules",
      "todayByTerminals",
      departingTerminalId,
      arrivingTerminalId,
      onlyRemainingTimes,
    ],
    queryFn: () =>
      getScheduleTodayByTerminals({
        departingTerminalID: departingTerminalId,
        arrivingTerminalID: arrivingTerminalId,
        onlyRemainingTimes,
      }),
    enabled: !!departingTerminalId && !!arrivingTerminalId,
  });
};

/**
 * Hook for fetching sailings from WSF Schedule API
 */
export const useSailings = (schedRouteId: number) => {
  return useQuery({
    queryKey: ["schedule", "sailings", schedRouteId],
    queryFn: () => getSailings({ schedRouteID: schedRouteId }),
    enabled: !!schedRouteId,
  });
};

/**
 * Hook for fetching all sailings from WSF Schedule API
 */
export const useAllSailings = (schedRouteId: number, year: number) => {
  return useQuery({
    queryKey: ["schedule", "allSailings", schedRouteId, year],
    queryFn: () => getAllSailings({ schedRouteID: schedRouteId, year }),
    enabled: !!schedRouteId && !!year,
  });
};

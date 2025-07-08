// Schedule Schedules API functions

import { fetchWsfArray } from "../../shared/fetch";
import { toSailing, toSchedule } from "./converter";
import type {
  Sailing,
  Schedule,
  WsfSailingResponse,
  WsfScheduleResponse,
} from "./types";

/**
 * URL templates for schedules endpoints with strongly-typed parameters
 */
const ROUTES = {
  byRoute: {
    path: "/schedule/{tripDate}/{routeID}" as const,
    log: "info",
  },
  byTerminals: {
    path: "/schedule/{tripDate}/{departingTerminalID}/{arrivingTerminalID}" as const,
    log: "info",
  },
  todayByRoute: {
    path: "/scheduletoday/{routeID}" as const,
    log: "info",
  },
  todayByTerminals: {
    path: "/scheduletoday/{departingTerminalID}/{arrivingTerminalID}" as const,
    log: "info",
  },
  sailings: {
    path: "/sailings/{schedRouteID}" as const,
    log: "info",
  },
  allSailings: {
    path: "/allsailings/{schedRouteID}/{year}" as const,
    log: "info",
  },
} as const;

/**
 * API function for fetching schedule by route from WSF Schedule API
 */
export const getScheduleByRoute = (params: {
  tripDate: Date;
  routeID: number;
}): Promise<Schedule[]> =>
  fetchWsfArray<WsfScheduleResponse>("schedule", ROUTES.byRoute, params).then(
    (arr) => arr.map(toSchedule)
  );

/**
 * API function for fetching schedule by terminals from WSF Schedule API
 */
export const getScheduleByTerminals = (params: {
  tripDate: Date;
  departingTerminalID: number;
  arrivingTerminalID: number;
}): Promise<Schedule[]> =>
  fetchWsfArray<WsfScheduleResponse>(
    "schedule",
    ROUTES.byTerminals,
    params
  ).then((arr) => arr.map(toSchedule));

/**
 * API function for fetching today's schedule by route from WSF Schedule API
 */
export const getScheduleTodayByRoute = (params: {
  routeID: number;
  onlyRemainingTimes?: boolean;
}): Promise<Schedule[]> =>
  fetchWsfArray<WsfScheduleResponse>(
    "schedule",
    ROUTES.todayByRoute,
    params
  ).then((arr) => arr.map(toSchedule));

/**
 * API function for fetching today's schedule by terminals from WSF Schedule API
 */
export const getScheduleTodayByTerminals = (params: {
  departingTerminalID: number;
  arrivingTerminalID: number;
  onlyRemainingTimes?: boolean;
}): Promise<Schedule[]> =>
  fetchWsfArray<WsfScheduleResponse>(
    "schedule",
    ROUTES.todayByTerminals,
    params
  ).then((arr) => arr.map(toSchedule));

/**
 * API function for fetching sailings from WSF Schedule API
 */
export const getSailings = (params: {
  schedRouteID: number;
}): Promise<Sailing[]> =>
  fetchWsfArray<WsfSailingResponse>("schedule", ROUTES.sailings, params).then(
    (arr) => arr.map(toSailing)
  );

/**
 * API function for fetching all sailings from WSF Schedule API
 */
export const getAllSailings = (params: {
  schedRouteID: number;
  year: number;
}): Promise<Sailing[]> =>
  fetchWsfArray<WsfSailingResponse>(
    "schedule",
    ROUTES.allSailings,
    params
  ).then((arr) => arr.map(toSailing));

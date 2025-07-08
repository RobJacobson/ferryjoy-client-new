// Schedule Routes API functions

import { fetchWsfArray } from "../../shared/fetch";
import type { Route } from "../shared/types";
import {
  toActiveSeason,
  toAlert,
  toRoute,
  toRouteDetails,
  toScheduledRoute,
} from "./converter";
import type {
  WsfActiveSeasonResponse,
  WsfAlertResponse,
  WsfRouteDetailsResponse,
  WsfRouteResponse,
  WsfScheduledRouteResponse,
} from "./types";

/**
 * URL templates for routes endpoints with strongly-typed parameters
 */
const ROUTES = {
  all: {
    path: "/routes" as const,
    log: "info",
  },
  byDate: {
    path: "/routes/{tripDate}" as const,
    log: "info",
  },
  byTerminals: {
    path: "/routes/{tripDate}/{departingTerminalID}/{arrivingTerminalID}" as const,
    log: "info",
  },
  withDisruptions: {
    path: "/routeshavingservicedisruptions/{tripDate}" as const,
    log: "info",
  },
  details: {
    path: "/routedetails/{tripDate}" as const,
    log: "info",
  },
  detailsByTerminals: {
    path: "/routedetails/{tripDate}/{departingTerminalID}/{arrivingTerminalID}" as const,
    log: "info",
  },
  detailsByRoute: {
    path: "/routedetails/{tripDate}/{routeID}" as const,
    log: "info",
  },
  scheduledRoutes: {
    path: "/schedroutes" as const,
    log: "info",
  },
  scheduledRoutesBySeason: {
    path: "/schedroutes/{scheduleID}" as const,
    log: "info",
  },
  activeSeasons: {
    path: "/activeseasons" as const,
    log: "info",
  },
  alerts: {
    path: "/alerts" as const,
    log: "info",
  },
} as const;

/**
 * API function for fetching all routes from WSF Schedule API
 */
export const getRoutes = (): Promise<Route[]> =>
  fetchWsfArray<WsfRouteResponse>("schedule", ROUTES.all).then((arr) =>
    arr.map(toRoute)
  );

/**
 * API function for fetching routes by date from WSF Schedule API
 */
export const getRoutesByDate = (params: { tripDate: Date }): Promise<Route[]> =>
  fetchWsfArray<WsfRouteResponse>("schedule", ROUTES.byDate, params).then(
    (arr) => arr.map(toRoute)
  );

/**
 * API function for fetching routes between specific terminals from WSF Schedule API
 */
export const getRoutesByTerminals = (params: {
  tripDate: Date;
  departingTerminalID: number;
  arrivingTerminalID: number;
}): Promise<Route[]> =>
  fetchWsfArray<WsfRouteResponse>("schedule", ROUTES.byTerminals, params).then(
    (arr) => arr.map(toRoute)
  );

/**
 * API function for fetching routes with service disruptions from WSF Schedule API
 */
export const getRoutesWithDisruptions = (params: {
  tripDate: Date;
}): Promise<Route[]> =>
  fetchWsfArray<WsfRouteResponse>(
    "schedule",
    ROUTES.withDisruptions,
    params
  ).then((arr) => arr.map(toRoute));

/**
 * API function for fetching route details from WSF Schedule API
 */
export const getRouteDetails = (params: { tripDate: Date }): Promise<Route[]> =>
  fetchWsfArray<WsfRouteDetailsResponse>(
    "schedule",
    ROUTES.details,
    params
  ).then((arr) => arr.map(toRouteDetails));

/**
 * API function for fetching route details by terminals from WSF Schedule API
 */
export const getRouteDetailsByTerminals = (params: {
  tripDate: Date;
  departingTerminalID: number;
  arrivingTerminalID: number;
}): Promise<Route[]> =>
  fetchWsfArray<WsfRouteDetailsResponse>(
    "schedule",
    ROUTES.detailsByTerminals,
    params
  ).then((arr) => arr.map(toRouteDetails));

/**
 * API function for fetching route details by route from WSF Schedule API
 */
export const getRouteDetailsByRoute = (params: {
  tripDate: Date;
  routeID: number;
}): Promise<Route[]> =>
  fetchWsfArray<WsfRouteDetailsResponse>(
    "schedule",
    ROUTES.detailsByRoute,
    params
  ).then((arr) => arr.map(toRouteDetails));

/**
 * API function for fetching scheduled routes from WSF Schedule API
 */
export const getScheduledRoutes = () =>
  fetchWsfArray<WsfScheduledRouteResponse>(
    "schedule",
    ROUTES.scheduledRoutes
  ).then((arr) => arr.map(toScheduledRoute));

/**
 * API function for fetching scheduled routes by season from WSF Schedule API
 */
export const getScheduledRoutesBySeason = (params: { scheduleID: number }) =>
  fetchWsfArray<WsfScheduledRouteResponse>(
    "schedule",
    ROUTES.scheduledRoutesBySeason,
    params
  ).then((arr) => arr.map(toScheduledRoute));

/**
 * API function for fetching active seasons from WSF Schedule API
 */
export const getActiveSeasons = () =>
  fetchWsfArray<WsfActiveSeasonResponse>("schedule", ROUTES.activeSeasons).then(
    (arr) => arr.map(toActiveSeason)
  );

/**
 * API function for fetching alerts from WSF Schedule API
 */
export const getAlerts = () =>
  fetchWsfArray<WsfAlertResponse>("schedule", ROUTES.alerts).then((arr) =>
    arr.map(toAlert)
  );

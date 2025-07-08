// Schedule Time Adjustments API functions

import { fetchWsfArray } from "../../shared/fetch";
import { toTimeAdjustment } from "./converter";
import type { TimeAdjustment, WsfTimeAdjustmentResponse } from "./types";

/**
 * URL templates for time adjustments endpoints with strongly-typed parameters
 */
const ROUTES = {
  all: {
    path: "/timeadj" as const,
    log: "info",
  },
  byRoute: {
    path: "/timeadjbyroute/{routeID}" as const,
    log: "info",
  },
  bySchedRoute: {
    path: "/timeadjbyschedroute/{schedRouteID}" as const,
    log: "info",
  },
} as const;

/**
 * API function for fetching all time adjustments from WSF Schedule API
 */
export const getTimeAdjustments = (): Promise<TimeAdjustment[]> =>
  fetchWsfArray<WsfTimeAdjustmentResponse>("schedule", ROUTES.all).then((arr) =>
    arr.map(toTimeAdjustment)
  );

/**
 * API function for fetching time adjustments by route from WSF Schedule API
 */
export const getTimeAdjustmentsByRoute = (params: {
  routeID: number;
}): Promise<TimeAdjustment[]> =>
  fetchWsfArray<WsfTimeAdjustmentResponse>(
    "schedule",
    ROUTES.byRoute,
    params
  ).then((arr) => arr.map(toTimeAdjustment));

/**
 * API function for fetching time adjustments by scheduled route from WSF Schedule API
 */
export const getTimeAdjustmentsBySchedRoute = (params: {
  schedRouteID: number;
}): Promise<TimeAdjustment[]> =>
  fetchWsfArray<WsfTimeAdjustmentResponse>(
    "schedule",
    ROUTES.bySchedRoute,
    params
  ).then((arr) => arr.map(toTimeAdjustment));

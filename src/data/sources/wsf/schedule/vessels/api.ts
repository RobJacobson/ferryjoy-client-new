// Schedule Vessels API functions

import { fetchWsfArray } from "../../shared/fetch";
import type { Vessel } from "../shared/types";
import { toVessel } from "./converter";
import type { WsfVesselResponse } from "./types";

/**
 * URL templates for vessels endpoints with strongly-typed parameters
 */
const ROUTES = {
  all: {
    path: "/vessels" as const,
    log: "info",
  },
  byRoute: {
    path: "/vessels/{routeID}" as const,
    log: "info",
  },
} as const;

/**
 * API function for fetching all vessels from WSF Schedule API
 */
export const getVessels = async (): Promise<Vessel[]> =>
  (await fetchWsfArray<WsfVesselResponse>("schedule", ROUTES.all)).map(
    toVessel
  );

/**
 * API function for fetching vessels by route from WSF Schedule API
 */
export const getVesselsByRoute = async (params: {
  routeID: number;
}): Promise<Vessel[]> =>
  (
    await fetchWsfArray<WsfVesselResponse>("schedule", ROUTES.byRoute, params)
  ).map(toVessel);

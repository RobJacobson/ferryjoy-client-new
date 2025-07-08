// VesselVerbose API functions

import { createArrayApi } from "../../shared/apiFactory";
import { toVesselVerbose } from "./converter";
import type { VesselVerbose, VesselVerboseApiResponse } from "./types";

/**
 * URL template for vessel verbose endpoint with strongly-typed parameters
 */
const ROUTES = {
  vesselVerbose: {
    path: "vesselverbose" as const,
    log: "info",
  },
} as const;

/**
 * API function for fetching detailed vessel information from WSF API
 *
 * Retrieves comprehensive vessel details including specifications, capacities,
 * amenities, and historical information. This data is cached for longer periods
 * as it changes infrequently.
 *
 * @returns Promise resolving to an array of VesselVerbose objects
 */
export const getVesselVerbose = createArrayApi<
  VesselVerboseApiResponse,
  VesselVerbose
>("vessels", ROUTES.vesselVerbose, toVesselVerbose);

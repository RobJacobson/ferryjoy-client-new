// VesselVerbose API functions

import { createArrayApi } from "../../shared/apiFactory";
import { toVesselVerbose } from "./converter";
import type { VesselVerbose, VesselVerboseApiResponse } from "./types";

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
>("vessels", "vesselverbose", toVesselVerbose);

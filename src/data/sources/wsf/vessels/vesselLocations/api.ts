// VesselLocations API functions

import { createArrayApi } from "../../shared/apiFactory";
import { toVesselLocation } from "./converter";
import type { VesselLocation, VesselLocationApiResponse } from "./types";

/**
 * API function for fetching current vessel location data from WSF API
 *
 * Retrieves real-time vessel positions, speeds, headings, and status information
 * from the Washington State Ferries API. Data is automatically converted to
 * domain models with proper date parsing.
 *
 * @returns Promise resolving to an array of VesselLocation objects
 */
export const getVesselLocations = createArrayApi<
  VesselLocationApiResponse,
  VesselLocation
>("vessels", "vessellocations", toVesselLocation);

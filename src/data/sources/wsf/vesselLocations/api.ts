// VesselLocations API functions

import { API_BASE, API_KEY, fetchWsf } from "../shared/fetch";
import { toVesselLocationFromWsf } from "./converter";
import type { VesselLocationApiResponse } from "./types";

// API function
export const getVesselLocations = async () => {
  const url = `${API_BASE}/vessellocations?apiaccesscode=${API_KEY}`;
  const rawData = await fetchWsf<VesselLocationApiResponse[]>(url);
  if (!rawData) return [];

  const result = rawData.map(toVesselLocationFromWsf);

  return result;
};

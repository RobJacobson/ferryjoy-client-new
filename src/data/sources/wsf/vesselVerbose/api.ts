// VesselVerbose API functions

import log from "@/lib/logger";

import { API_BASE, API_KEY, fetchWsf } from "../shared/fetch";
import { mapVesselVerbose } from "./converter";
import type { VesselVerboseApiResponse } from "./types";

// API function
export const getVesselVerbose = async () => {
  log.debug("Fetching vessel verbose data");
  const url = `${API_BASE}/vesselverbose?apiaccesscode=${API_KEY}`;
  const rawData = await fetchWsf<VesselVerboseApiResponse[]>(url);
  if (!rawData) return [];

  const result = rawData.map(mapVesselVerbose);

  if (result.length > 0) {
    log.info(`Retrieved ${result.length} vessel verbose records`);
  }
  return result;
};

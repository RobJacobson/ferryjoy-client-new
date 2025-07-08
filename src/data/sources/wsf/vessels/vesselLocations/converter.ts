// VesselLocations data conversion functions

import { parseWsfDate } from "../../shared/utils";
import type { VesselLocation, WsfVesselLocationResponse } from "./types";

/**
 * Converter function for transforming API response to VesselLocation object from WSF API
 */
export const toVesselLocation = (
  data: WsfVesselLocationResponse
): VesselLocation => ({
  vesselID: data.VesselID,
  vesselName: data.VesselName,
  vesselAbrv: data.VesselAbrv,
  lat: data.Lat,
  lon: data.Lon,
  speed: data.Speed,
  heading: data.Heading,
  inService: data.InService,
  depTermAbrv: data.DepTermAbrv,
  arvTermAbrv: data.ArvTermAbrv,
  eta: data.ETA ? parseWsfDate(data.ETA) : null,
  timestamp: parseWsfDate(data.TimeStamp),
});

/**
 * Converter function for transforming API response array to VesselLocation array from WSF API
 */
export const toVesselLocationArray = (
  data: WsfVesselLocationResponse[]
): VesselLocation[] => data.map(toVesselLocation);

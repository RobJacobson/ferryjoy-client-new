// VesselLocations data conversion functions

import { parseWsfDate } from "../../shared/api";
import type { VesselLocation, VesselLocationApiResponse } from "./types";

/**
 * Converter function for transforming API response to VesselLocation object from WSF API
 */
export const toVesselLocation = (
  api: VesselLocationApiResponse
): VesselLocation => ({
  vesselID: api.VesselID,
  vesselName: api.VesselName,
  depTermID: api.DepartingTerminalID,
  depTermName: api.DepartingTerminalName,
  depTermAbrv: api.DepartingTerminalAbbrev,
  arvTermID: api.ArrivingTerminalID,
  arvTermName: api.ArrivingTerminalName,
  arvTermAbrv: api.ArrivingTerminalAbbrev,
  lat: api.Latitude,
  lon: api.Longitude,
  speed: api.Speed,
  heading: api.Heading,
  inService: api.InService,
  atDock: api.AtDock,
  leftDock: api.LeftDock ? parseWsfDate(api.LeftDock) : null,
  eta: api.Eta ? parseWsfDate(api.Eta) : null,
  schedDep: api.ScheduledDeparture
    ? parseWsfDate(api.ScheduledDeparture)
    : null,
  opRouteAbrv: api.OpRouteAbbrev?.at(0) ?? null,
  vesselPosNum: api.VesselPositionNum,
  sortSeq: api.SortSeq,
  timeStamp: parseWsfDate(api.TimeStamp),
});

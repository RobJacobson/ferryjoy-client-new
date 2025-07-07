import { parseWsfDate, type WsfDateString } from "../fetchWsf/utils";

// Position type for vessel location coordinates and movement
export type VesselPosition = {
  lat: number;
  lon: number;
  speed: number;
  heading: number;
};

// Raw API response type (PascalCase from WSF API)
export type VesselLocationApiResponse = {
  VesselID: number;
  VesselName: string;
  DepartingTerminalID: number;
  DepartingTerminalName: string;
  DepartingTerminalAbbrev: string;
  ArrivingTerminalID: number | null;
  ArrivingTerminalName: string | null;
  ArrivingTerminalAbbrev: string | null;
  Latitude: number;
  Longitude: number;
  Speed: number;
  Heading: number;
  InService: boolean;
  AtDock: boolean;
  LeftDock: WsfDateString | null;
  Eta: WsfDateString | null;
  ScheduledDeparture: WsfDateString | null;
  OpRouteAbbrev: [] | null;
  VesselPositionNum: number | null;
  SortSeq: number;
  TimeStamp: WsfDateString;
};

// Type definition
export type VesselLocation = {
  vesselID: number;
  vesselName: string;
  depTermID: number;
  depTermName: string;
  depTermAbrv: string;
  arvTermID: number | null;
  arvTermName: string | null;
  arvTermAbrv: string | null;
  lat: number;
  lon: number;
  speed: number;
  heading: number;
  inService: boolean;
  atDock: boolean;
  leftDock: Date | null;
  eta: Date | null;
  schedDep: Date | null;
  opRouteAbrv: string | null;
  vesselPosNum: number | null;
  sortSeq: number;
  timeStamp: Date;
};

// Mapping function
export const toVesselLocationFromWsf = (
  api: VesselLocationApiResponse
): VesselLocation => {
  return {
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
  };
};

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
  LeftDock: Date | null;
  Eta: Date | null;
  ScheduledDeparture: Date | null;
  OpRouteAbbrev: string | null; // Converted from array to string in wsfApiReviver
  VesselPositionNum: number | null;
  SortSeq: number;
  TimeStamp: Date;
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

// Type definition for Convex storage
export type VesselLocationConvex = {
  vesselID: number;
  vesselName: string;
  depTermID: number;
  depTermName: string;
  depTermAbrv: string;
  arvTermID?: number;
  arvTermName?: string;
  arvTermAbrv?: string;
  lat: number;
  lon: number;
  speed: number;
  heading: number;
  inService: boolean;
  atDock: boolean;
  leftDock?: number;
  eta?: number;
  schedDep?: number;
  opRouteAbrv?: string;
  vesselPosNum?: number;
  sortSeq: number;
  timeStamp: number;
};

// Mapping function
export const toVesselLocationFromWsf = (
  apiResponse: VesselLocationApiResponse
): VesselLocation => {
  return {
    vesselID: apiResponse.VesselID,
    vesselName: apiResponse.VesselName,
    depTermID: apiResponse.DepartingTerminalID,
    depTermName: apiResponse.DepartingTerminalName,
    depTermAbrv: apiResponse.DepartingTerminalAbbrev,
    arvTermID: apiResponse.ArrivingTerminalID,
    arvTermName: apiResponse.ArrivingTerminalName,
    arvTermAbrv: apiResponse.ArrivingTerminalAbbrev,
    lat: apiResponse.Latitude,
    lon: apiResponse.Longitude,
    speed: apiResponse.Speed,
    heading: apiResponse.Heading,
    inService: apiResponse.InService,
    atDock: apiResponse.AtDock,
    leftDock: apiResponse.LeftDock,
    eta: apiResponse.Eta,
    schedDep: apiResponse.ScheduledDeparture,
    opRouteAbrv: apiResponse.OpRouteAbbrev,
    vesselPosNum: apiResponse.VesselPositionNum,
    sortSeq: apiResponse.SortSeq,
    timeStamp: apiResponse.TimeStamp,
  };
};

export const toVesselLocationConvex = (
  vessel: VesselLocation
): VesselLocationConvex => ({
  vesselID: vessel.vesselID,
  vesselName: vessel.vesselName,
  depTermID: vessel.depTermID,
  depTermName: vessel.depTermName,
  depTermAbrv: vessel.depTermAbrv,
  arvTermID: vessel.arvTermID ?? undefined,
  arvTermName: vessel.arvTermName ?? undefined,
  arvTermAbrv: vessel.arvTermAbrv ?? undefined,
  lat: vessel.lat,
  lon: vessel.lon,
  speed: vessel.speed,
  heading: vessel.heading,
  inService: vessel.inService,
  atDock: vessel.atDock,
  leftDock: vessel.leftDock?.getTime() ?? undefined,
  eta: vessel.eta?.getTime() ?? undefined,
  schedDep: vessel.schedDep?.getTime() ?? undefined,
  opRouteAbrv: vessel.opRouteAbrv ?? undefined,
  vesselPosNum: vessel.vesselPosNum ?? undefined,
  sortSeq: vessel.sortSeq,
  timeStamp: vessel.timeStamp.getTime(),
});

export const toVesselLocationFromConvex = (
  vessel: VesselLocationConvex
): VesselLocation => ({
  vesselID: vessel.vesselID,
  vesselName: vessel.vesselName,
  depTermID: vessel.depTermID,
  depTermName: vessel.depTermName,
  depTermAbrv: vessel.depTermAbrv,
  arvTermID: vessel.arvTermID ?? null,
  arvTermName: vessel.arvTermName ?? null,
  arvTermAbrv: vessel.arvTermAbrv ?? null,
  lat: vessel.lat,
  lon: vessel.lon,
  speed: vessel.speed,
  heading: vessel.heading,
  inService: vessel.inService,
  atDock: vessel.atDock,
  leftDock: vessel.leftDock ? new Date(vessel.leftDock) : null,
  eta: vessel.eta ? new Date(vessel.eta) : null,
  schedDep: vessel.schedDep ? new Date(vessel.schedDep) : null,
  opRouteAbrv: vessel.opRouteAbrv ?? null,
  vesselPosNum: vessel.vesselPosNum ?? null,
  sortSeq: vessel.sortSeq,
  timeStamp: new Date(vessel.timeStamp),
});

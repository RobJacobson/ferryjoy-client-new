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
  inService: boolean;
  atDock: boolean;
  leftDock: Date | null;
  eta: Date | null;
  schedDep: Date | null;
  opRouteAbrv: string | null;
  vesselPosNum: number | null;
  sortSeq: number;
  timeStamp: Date;
} & VesselPosition;

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

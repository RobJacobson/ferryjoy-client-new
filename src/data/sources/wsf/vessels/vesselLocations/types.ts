import type { LatLon } from "../../../../types/shared";
import type { WsfDateString } from "../../shared/api";

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
} & LatLon;

// Position type for vessel location coordinates and movement
export type VesselPosition = {
  lat: number;
  lon: number;
  speed: number;
  heading: number;
};

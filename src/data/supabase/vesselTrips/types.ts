import type { Tables } from "../types";

// Database row type
export type VesselTripRow = Tables<"vessel_trip">;

// Domain type
export type VesselTrip = {
  id: number;
  vesselID: number;
  vesselName: string;
  vesselAbrv: string;
  depTermID: number;
  depTermAbrv: string;
  arvTermID: number | null;
  arvTermAbrv: string | null;
  inService: boolean;
  eta: Date | null;
  schedDep: Date | null;
  opRouteAbrv: string;
  vesselPosNum: number | null;
  sortSeq: number;
  timeStart: Date | null;
  timeLeftDock: Date | null;
  timeArrived: Date | null;
  timeUpdated: Date | null;
};

// Map type for grouping trips by vessel abbreviation
export type VesselTripMap = Record<string, VesselTrip[]>;

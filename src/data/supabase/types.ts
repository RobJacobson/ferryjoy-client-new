/**
 * Vessel location current data with camelCase field names and Date objects
 */
export type VesselLocationCurrent = {
  arvTermAbrv: string | null;
  arvTermId: number | null;
  arvTermName: string | null;
  atDock: boolean;
  depTermAbrv: string;
  depTermId: number;
  depTermName: string;
  eta: Date | null;
  heading: number;
  inService: boolean;
  lat: number;
  leftDock: Date | null;
  lon: number;
  opRouteAbrv: string | null;
  schedDep: Date | null;
  speed: number;
  timestamp: Date;
  vesselAbrv: string | null;
  vesselId: number;
  vesselName: string;
  vesselPosNum: number | null;
  vesselTripKey: string | null;
};

/**
 * Vessel location minute data with camelCase field names and Date objects
 */
export type VesselLocationMinute = {
  atDock: boolean | null;
  heading: number | null;
  id: number;
  inService: boolean | null;
  lat: number | null;
  lon: number | null;
  speed: number | null;
  timestamp: Date | null;
  vesselId: number | null;
  vesselTripKey: string;
};

/**
 * Vessel location second data with camelCase field names and Date objects
 */
export type VesselLocationSecond = {
  arvTermAbrv: string | null;
  arvTermId: number | null;
  arvTermName: string | null;
  atDock: boolean;
  createdAt: Date;
  depTermAbrv: string;
  depTermId: number;
  depTermName: string;
  eta: Date | null;
  heading: number;
  id: number;
  inService: boolean;
  lat: number;
  leftDock: Date | null;
  lon: number;
  opRouteAbrv: string | null;
  schedDep: Date | null;
  speed: number;
  timestamp: Date;
  vesselAbrv: string | null;
  vesselId: number;
  vesselName: string;
  vesselPosNum: number | null;
  vesselTripKey: string | null;
};

/**
 * Vessel trip data with camelCase field names and Date objects
 */
export type VesselTrip = {
  arvTermAbrv: string | null;
  arvTermId: number | null;
  arvTermName: string | null;
  atDock: boolean | null;
  createdAt: Date;
  depTermAbrv: string | null;
  depTermId: number | null;
  depTermName: string | null;
  endAt: Date | null;
  eta: Date | null;
  inService: boolean | null;
  key: string;
  leftDock: Date | null;
  opRouteAbrv: string | null;
  schedDep: Date | null;
  startAt: Date | null;
  updatedAt: Date | null;
  vesselAbrv: string | null;
  vesselId: number | null;
  vesselName: string | null;
  vesselPosNum: number | null;
};

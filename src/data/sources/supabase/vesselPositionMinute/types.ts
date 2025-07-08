import type { Tables } from "../types";

// Database row type
export type VesselPositionMinuteRow = Tables<"vessel_location_minute">;

// Domain type with camelCase properties
export type VesselPositionMinute = {
  id: number;
  vesselID: number;
  tripID: number;
  lat: number;
  lon: number;
  speed: number;
  heading: number;
  inService: boolean;
  atDock: boolean;
  arvTermID: number | null;
  depTermID: number;
  timestamp: Date;
};

// Map type for grouping positions by trip ID
export type VesselPositionMinuteMap = Record<number, VesselPositionMinute[]>;

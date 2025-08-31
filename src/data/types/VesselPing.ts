import type { VesselLocation } from "./VesselLocation";

/**
 * Simplified vessel location data for tracking vessel movements
 * Contains only essential position and status information
 */
export type VesselPing = {
  /** Unique identifier for the vessel */
  VesselID: number;
  /** Current latitude position of the vessel */
  Latitude: number;
  /** Current longitude position of the vessel */
  Longitude: number;
  /** Current speed of the vessel in knots */
  Speed: number;
  /** Current heading of the vessel in degrees */
  Heading: number;
  /** Whether the vessel is currently docked at a terminal */
  AtDock: boolean;
  /** Timestamp when this location data was recorded */
  TimeStamp: Date;
};

/**
 * Converts a VesselLocation to a simplified VesselPing
 * Extracts only the essential tracking data for vessel movement monitoring
 * Rounds latitude and longitude to four decimal places for precision
 */
export const toVesselPing = (vl: VesselLocation): VesselPing => ({
  VesselID: vl.VesselID,
  Latitude: Math.round(vl.Latitude * 100000) / 100000,
  Longitude: Math.round(vl.Longitude * 100000) / 100000,
  Speed: vl.Speed > 0.2 ? vl.Speed : 0,
  Heading: vl.Heading,
  AtDock: vl.AtDock,
  TimeStamp: vl.TimeStamp,
});

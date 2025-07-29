import type { VesselLocation as VesselLocationDottie } from "ws-dottie";

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
 * Converts a VesselLocation from ws-dottie to a simplified VesselPing
 * Extracts only the essential tracking data for vessel movement monitoring
 */
export const toVesselPing = (vl: VesselLocationDottie) => ({
  VesselID: vl.VesselID,
  Latitude: vl.Latitude,
  Longitude: vl.Longitude,
  Speed: vl.Speed,
  Heading: vl.Heading,
  AtDock: vl.AtDock,
  TimeStamp: vl.TimeStamp,
});

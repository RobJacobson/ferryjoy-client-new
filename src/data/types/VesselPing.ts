import type { VesselLocation as VesselLocationDottie } from "ws-dottie";

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
 * Convex-compatible vessel ping type
 * Uses number timestamps instead of Date objects for Convex compatibility
 */
export type ConvexVesselPing = {
  VesselID: number;
  Latitude: number;
  Longitude: number;
  Speed: number;
  Heading: number;
  AtDock: boolean;
  TimeStamp: number;
};

/**
 * Converts a VesselLocation from ws-dottie to a simplified VesselPing
 * Extracts only the essential tracking data for vessel movement monitoring
 * Rounds latitude and longitude to four decimal places for precision
 */
export const toVesselPing = (vl: VesselLocation) => ({
  VesselID: vl.VesselID,
  Latitude: Math.round(vl.Latitude * 10000) / 10000,
  Longitude: Math.round(vl.Longitude * 10000) / 10000,
  Speed: vl.Speed > 0.2 ? vl.Speed : 0,
  Heading: vl.Heading,
  AtDock: vl.AtDock,
  TimeStamp: vl.TimeStamp,
});

/**
 * Converts VesselPing to Convex format
 * Converts Date fields to numbers for Convex compatibility
 */
export const toConvexVesselPing = (ping: VesselPing): ConvexVesselPing => ({
  ...ping,
  TimeStamp: ping.TimeStamp.getTime(),
});

/**
 * Converts ConvexVesselPing back to VesselPing format
 * Converts number timestamps back to Date objects
 */
export const toVesselPingFromConvex = (
  convexPing: ConvexVesselPing
): VesselPing => ({
  ...convexPing,
  TimeStamp: new Date(convexPing.TimeStamp),
});

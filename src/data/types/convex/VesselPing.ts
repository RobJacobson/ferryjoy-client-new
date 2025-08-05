import { v } from "convex/values";

import { fromConvex, toConvex } from "../converters";
import type { VesselPing as DomainVesselPing } from "../domain/VesselPing";

/**
 * Convex-compatible vessel ping type
 * Uses number timestamps for Convex compatibility
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
 * Shared vessel ping validation schema
 * This matches the ConvexVesselPing type with dates as numbers
 */
export const vesselPingValidationSchema = {
  VesselID: v.number(),
  Latitude: v.number(),
  Longitude: v.number(),
  Speed: v.number(),
  Heading: v.number(),
  AtDock: v.boolean(),
  TimeStamp: v.number(),
} as const;

/**
 * Converts domain VesselPing to Convex format
 */
export const toConvexVesselPing = (
  ping: DomainVesselPing
): ConvexVesselPing => {
  return {
    ...ping,
    TimeStamp: ping.TimeStamp.getTime(),
  };
};

/**
 * Converts Convex VesselPing back to domain format
 */
export const fromConvexVesselPing = (
  convexPing: ConvexVesselPing
): DomainVesselPing => {
  return {
    ...convexPing,
    TimeStamp: new Date(convexPing.TimeStamp),
  };
};

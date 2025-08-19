import type { Infer } from "convex/values";
import { v } from "convex/values";

import type { VesselPing } from "../domain/VesselPing";

/**
 * Shared vessel ping validation schema
 * This defines the structure for vessel pings in the Convex database
 * Uses number timestamps for Convex compatibility
 */
export const vesselPingValidationSchema = v.object({
  VesselID: v.number(),
  Latitude: v.number(),
  Longitude: v.number(),
  Speed: v.number(),
  Heading: v.number(),
  AtDock: v.boolean(),
  TimeStamp: v.number(),
});

/**
 * Convex-compatible vessel ping type inferred from validation schema
 * Uses number timestamps for Convex compatibility
 * This type is automatically kept in sync with the validation schema
 */
export type ConvexVesselPing = Infer<typeof vesselPingValidationSchema>;

// ============================================================================
// MANUAL CONVERSION FUNCTIONS
// ============================================================================

/**
 * Converts domain vessel ping to Convex format
 * Date → number
 */
export const toConvexVesselPing = (domain: VesselPing): ConvexVesselPing => ({
  VesselID: domain.VesselID,
  Latitude: domain.Latitude,
  Longitude: domain.Longitude,
  Speed: domain.Speed,
  Heading: domain.Heading,
  AtDock: domain.AtDock,
  TimeStamp: domain.TimeStamp.getTime(),
});

/**
 * Converts Convex vessel ping to domain format
 * number → Date
 */
export const fromConvexVesselPing = (convex: ConvexVesselPing): VesselPing => ({
  VesselID: convex.VesselID,
  Latitude: convex.Latitude,
  Longitude: convex.Longitude,
  Speed: convex.Speed,
  Heading: convex.Heading,
  AtDock: convex.AtDock,
  TimeStamp: new Date(convex.TimeStamp),
});

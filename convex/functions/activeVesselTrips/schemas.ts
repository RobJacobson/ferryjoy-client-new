import type { Infer } from "convex/values";
import { v } from "convex/values";
import type { VesselLocation } from "ws-dottie";

import type { VesselTrip } from "@/data/types/domain/VesselTrip";
import { getVesselAbbreviation } from "@/data/utils/vesselAbbreviations";

export const baseVesselTripSchema = {
  VesselID: v.number(),
  VesselName: v.string(),
  VesselAbbrev: v.string(),
  DepartingTerminalID: v.number(),
  DepartingTerminalName: v.string(),
  DepartingTerminalAbbrev: v.string(),
  ArrivingTerminalID: v.optional(v.number()),
  ArrivingTerminalName: v.optional(v.string()),
  ArrivingTerminalAbbrev: v.optional(v.string()),
  ScheduledDeparture: v.optional(v.number()),
  LeftDock: v.optional(v.number()),
  Eta: v.optional(v.number()),
  InService: v.boolean(),
  AtDock: v.boolean(),
  OpRouteAbbrev: v.optional(v.string()),
  VesselPositionNum: v.optional(v.number()),
  TimeStamp: v.number(),
  TripStart: v.optional(v.number()),
};

export const activeVesselTripValidationSchema = v.object({
  ...baseVesselTripSchema,
});

export const extendedVesselTripValidationSchema = v.object({
  ...baseVesselTripSchema,
  Key: v.string(),
});

export type ConvexVesselTrip = Infer<typeof activeVesselTripValidationSchema>;
export type ConvexVesselTripExtended = Infer<
  typeof extendedVesselTripValidationSchema
>;

// ============================================================================
// MANUAL CONVERSION FUNCTIONS
// ============================================================================

/**
 * Converts raw WSF vessel location data to Convex format
 * Date → number, null → undefined
 */
export const toConvexVesselTrip = (
  domain: VesselLocation
): ConvexVesselTrip => ({
  VesselID: domain.VesselID,
  VesselName: domain.VesselName,
  VesselAbbrev: getVesselAbbreviation(domain.VesselName),
  DepartingTerminalID: domain.DepartingTerminalID,
  DepartingTerminalName: domain.DepartingTerminalName,
  DepartingTerminalAbbrev: domain.DepartingTerminalAbbrev,
  ArrivingTerminalID: domain.ArrivingTerminalID ?? undefined,
  ArrivingTerminalName: domain.ArrivingTerminalName ?? undefined,
  ArrivingTerminalAbbrev: domain.ArrivingTerminalAbbrev ?? undefined,
  InService: domain.InService,
  AtDock: domain.AtDock,
  LeftDock: domain.LeftDock ? domain.LeftDock.getTime() : undefined,
  Eta: domain.Eta ? domain.Eta.getTime() : undefined,
  ScheduledDeparture: domain.ScheduledDeparture
    ? domain.ScheduledDeparture.getTime()
    : undefined,
  OpRouteAbbrev: domain.OpRouteAbbrev?.[0] ?? undefined,
  VesselPositionNum: domain.VesselPositionNum ?? undefined,
  TimeStamp: domain.TimeStamp.getTime(),
  // TripStart:
  //   domain.TripStart && typeof domain.TripStart.getTime === "function"
  //     ? domain.TripStart.getTime()
  //     : undefined,
});

/**
 * Converts Convex vessel trip to domain format
 * number → Date, undefined → null
 */
export const toVesselTrip = (convex: ConvexVesselTrip): VesselTrip => ({
  VesselID: convex.VesselID,
  VesselName: convex.VesselName,
  VesselAbbrev: convex.VesselAbbrev,
  DepartingTerminalID: convex.DepartingTerminalID,
  DepartingTerminalName: convex.DepartingTerminalName,
  DepartingTerminalAbbrev: convex.DepartingTerminalAbbrev,
  ArrivingTerminalID: convex.ArrivingTerminalID ?? null,
  ArrivingTerminalName: convex.ArrivingTerminalName ?? null,
  ArrivingTerminalAbbrev: convex.ArrivingTerminalAbbrev ?? null,
  InService: convex.InService,
  AtDock: convex.AtDock,
  LeftDock: convex.LeftDock ? new Date(convex.LeftDock) : null,
  Eta: convex.Eta ? new Date(convex.Eta) : null,
  ScheduledDeparture: convex.ScheduledDeparture
    ? new Date(convex.ScheduledDeparture)
    : null,
  OpRouteAbbrev: convex.OpRouteAbbrev ?? null,
  VesselPositionNum: convex.VesselPositionNum ?? null,
  TimeStamp: new Date(convex.TimeStamp),
  TripStart: new Date(convex.TripStart || 0),
});

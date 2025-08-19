import type { Infer } from "convex/values";
import { v } from "convex/values";

const baseVesselTripSchema = {
  VesselID: v.number(),
  VesselName: v.string(),
  DepartingTerminalID: v.number(),
  DepartingTerminalName: v.string(),
  DepartingTerminalAbbrev: v.string(),
  ArrivingTerminalID: v.optional(v.number()),
  ArrivingTerminalName: v.optional(v.string()),
  ArrivingTerminalAbbrev: v.optional(v.string()),
  InService: v.boolean(),
  AtDock: v.boolean(),
  LeftDock: v.optional(v.number()),
  LeftDockActual: v.optional(v.number()),
  Eta: v.optional(v.number()),
  ScheduledDeparture: v.optional(v.number()),
  ArvDockActual: v.optional(v.number()),
  OpRouteAbbrev: v.optional(v.string()),
  VesselPositionNum: v.optional(v.number()),
  TimeStamp: v.number(),
};

const extendedVesselTripSchema = {
  ...baseVesselTripSchema,
  Key: v.optional(v.string()),
  StartTime: v.optional(v.number()),
  EndTime: v.optional(v.number()),
  AtSeaDuration: v.optional(v.number()),
  AtDockDuration: v.optional(v.number()),
  TotalDuration: v.optional(v.number()),
};

export const vesselTripValidationSchema = v.object({
  ...baseVesselTripSchema,
});

export const vesselTripCompletedValidationSchema = v.object({
  ...baseVesselTripSchema,
  ...extendedVesselTripSchema,
});

export type ConvexVesselTrip = Infer<typeof vesselTripValidationSchema>;

// ============================================================================
// MANUAL CONVERSION FUNCTIONS
// ============================================================================

/**
 * Converts domain vessel trip to Convex format
 * Date → number, null → undefined
 */
export const toConvexVesselTrip = (domain: any): ConvexVesselTrip => ({
  VesselID: domain.VesselID,
  VesselName: domain.VesselName,
  DepartingTerminalID: domain.DepartingTerminalID,
  DepartingTerminalName: domain.DepartingTerminalName,
  DepartingTerminalAbbrev: domain.DepartingTerminalAbbrev,
  ArrivingTerminalID: domain.ArrivingTerminalID ?? undefined,
  ArrivingTerminalName: domain.ArrivingTerminalName ?? undefined,
  ArrivingTerminalAbbrev: domain.ArrivingTerminalAbbrev ?? undefined,
  InService: domain.InService,
  AtDock: domain.AtDock,
  LeftDock: domain.LeftDock?.getTime(),
  LeftDockActual: domain.LeftDockActual?.getTime(),
  Eta: domain.Eta?.getTime(),
  ScheduledDeparture: domain.ScheduledDeparture?.getTime(),
  ArvDockActual: domain.ArvDockActual?.getTime(),
  OpRouteAbbrev: domain.OpRouteAbbrev ?? undefined,
  VesselPositionNum: domain.VesselPositionNum ?? undefined,
  TimeStamp: domain.TimeStamp.getTime(),
});

/**
 * Converts Convex vessel trip to domain format
 * number → Date, undefined → null
 */
export const fromConvexVesselTrip = (convex: ConvexVesselTrip): any => ({
  VesselID: convex.VesselID,
  VesselName: convex.VesselName,
  DepartingTerminalID: convex.DepartingTerminalID,
  DepartingTerminalName: convex.DepartingTerminalName,
  DepartingTerminalAbbrev: convex.DepartingTerminalAbbrev,
  ArrivingTerminalID: convex.ArrivingTerminalID ?? null,
  ArrivingTerminalName: convex.ArrivingTerminalName ?? null,
  ArrivingTerminalAbbrev: convex.ArrivingTerminalAbbrev ?? null,
  InService: convex.InService,
  AtDock: convex.AtDock,
  LeftDock: convex.LeftDock ? new Date(convex.LeftDock) : null,
  LeftDockActual: convex.LeftDockActual
    ? new Date(convex.LeftDockActual)
    : null,
  Eta: convex.Eta ? new Date(convex.Eta) : null,
  ScheduledDeparture: convex.ScheduledDeparture
    ? new Date(convex.ScheduledDeparture)
    : null,
  ArvDockActual: convex.ArvDockActual ? new Date(convex.ArvDockActual) : null,
  OpRouteAbbrev: convex.OpRouteAbbrev ?? null,
  VesselPositionNum: convex.VesselPositionNum ?? null,
  TimeStamp: new Date(convex.TimeStamp),
});

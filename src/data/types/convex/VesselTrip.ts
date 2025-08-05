import { v } from "convex/values";

import { fromConvex, toConvex } from "../converters";
import type { VesselTrip as DomainVesselTrip } from "../domain/VesselTrip";

/**
 * Convex-compatible vessel trip type
 * Uses number timestamps and undefined for optional fields
 */
export type ConvexVesselTrip = {
  VesselID: number;
  VesselName: string;
  DepartingTerminalID: number;
  DepartingTerminalName: string;
  DepartingTerminalAbbrev: string;
  ArrivingTerminalID?: number;
  ArrivingTerminalName?: string;
  ArrivingTerminalAbbrev?: string;
  InService: boolean;
  AtDock: boolean;
  LeftDock?: number;
  LeftDockActual?: number;
  Eta?: number;
  ScheduledDeparture?: number;
  ArvDockActual?: number;
  OpRouteAbbrev?: string;
  VesselPositionNum?: number;
  TimeStamp: number;
};

/**
 * Shared vessel trip validation schema
 * This matches the ConvexVesselTrip type with dates as numbers
 */
export const vesselTripValidationSchema = {
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
} as const;

/**
 * Converts domain VesselTrip to Convex format
 */
export const toConvexVesselTrip = (
  trip: DomainVesselTrip
): ConvexVesselTrip => {
  return {
    ...trip,
    ArrivingTerminalID: trip.ArrivingTerminalID ?? undefined,
    ArrivingTerminalName: trip.ArrivingTerminalName ?? undefined,
    ArrivingTerminalAbbrev: trip.ArrivingTerminalAbbrev ?? undefined,
    LeftDock: trip.LeftDock?.getTime() ?? undefined,
    LeftDockActual: trip.LeftDockActual?.getTime() ?? undefined,
    Eta: trip.Eta?.getTime() ?? undefined,
    ScheduledDeparture: trip.ScheduledDeparture?.getTime() ?? undefined,
    ArvDockActual: trip.ArvDockActual?.getTime() ?? undefined,
    OpRouteAbbrev: trip.OpRouteAbbrev ?? undefined,
    VesselPositionNum: trip.VesselPositionNum ?? undefined,
    TimeStamp: trip.TimeStamp.getTime(),
  };
};

/**
 * Converts Convex VesselTrip back to domain format
 */
export const fromConvexVesselTrip = (
  convexTrip: ConvexVesselTrip
): DomainVesselTrip => {
  return {
    ...convexTrip,
    ArrivingTerminalID: convexTrip.ArrivingTerminalID ?? null,
    ArrivingTerminalName: convexTrip.ArrivingTerminalName ?? null,
    ArrivingTerminalAbbrev: convexTrip.ArrivingTerminalAbbrev ?? null,
    LeftDock: convexTrip.LeftDock ? new Date(convexTrip.LeftDock) : null,
    LeftDockActual: convexTrip.LeftDockActual
      ? new Date(convexTrip.LeftDockActual)
      : null,
    Eta: convexTrip.Eta ? new Date(convexTrip.Eta) : null,
    ScheduledDeparture: convexTrip.ScheduledDeparture
      ? new Date(convexTrip.ScheduledDeparture)
      : null,
    ArvDockActual: convexTrip.ArvDockActual
      ? new Date(convexTrip.ArvDockActual)
      : null,
    OpRouteAbbrev: convexTrip.OpRouteAbbrev ?? null,
    VesselPositionNum: convexTrip.VesselPositionNum ?? null,
    TimeStamp: new Date(convexTrip.TimeStamp),
  };
};

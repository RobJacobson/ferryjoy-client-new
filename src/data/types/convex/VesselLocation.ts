import { v } from "convex/values";

import { fromConvex, toConvex } from "../converters";
import type { VesselLocation as DomainVesselLocation } from "../domain/VesselLocation";

/**
 * Convex-compatible vessel location type
 * Uses number timestamps and undefined for optional fields
 */
export type ConvexVesselLocation = {
  VesselID: number;
  VesselName: string;
  DepartingTerminalID: number;
  DepartingTerminalName: string;
  DepartingTerminalAbbrev: string;
  ArrivingTerminalID: number | undefined;
  ArrivingTerminalName: string | undefined;
  ArrivingTerminalAbbrev: string | undefined;
  Latitude: number;
  Longitude: number;
  Speed: number;
  Heading: number;
  InService: boolean;
  AtDock: boolean;
  LeftDock: number | undefined;
  Eta: number | undefined;
  ScheduledDeparture: number | undefined;
  OpRouteAbbrev: string[];
  VesselPositionNum: number | undefined;
  TimeStamp: number;
};

/**
 * Shared vessel location validation schema
 * This matches the ConvexVesselLocation type with dates as numbers
 */
export const vesselLocationValidationSchema = {
  VesselID: v.number(),
  VesselName: v.string(),
  DepartingTerminalID: v.number(),
  DepartingTerminalName: v.string(),
  DepartingTerminalAbbrev: v.string(),
  ArrivingTerminalID: v.optional(v.number()),
  ArrivingTerminalName: v.optional(v.string()),
  ArrivingTerminalAbbrev: v.optional(v.string()),
  Latitude: v.number(),
  Longitude: v.number(),
  Speed: v.number(),
  Heading: v.number(),
  InService: v.boolean(),
  AtDock: v.boolean(),
  LeftDock: v.optional(v.number()),
  Eta: v.optional(v.number()),
  ScheduledDeparture: v.optional(v.number()),
  OpRouteAbbrev: v.array(v.string()),
  VesselPositionNum: v.optional(v.number()),
  TimeStamp: v.number(),
} as const;

/**
 * Converts domain VesselLocation to Convex format
 */
export const toConvexVesselLocation = (
  vl: DomainVesselLocation
): ConvexVesselLocation => {
  return {
    ...vl,
    ArrivingTerminalID: vl.ArrivingTerminalID ?? undefined,
    ArrivingTerminalName: vl.ArrivingTerminalName ?? undefined,
    ArrivingTerminalAbbrev: vl.ArrivingTerminalAbbrev ?? undefined,
    LeftDock: vl.LeftDock?.getTime() ?? undefined,
    Eta: vl.Eta?.getTime() ?? undefined,
    ScheduledDeparture: vl.ScheduledDeparture?.getTime() ?? undefined,
    VesselPositionNum: vl.VesselPositionNum ?? undefined,
    TimeStamp: vl.TimeStamp.getTime(),
  };
};

/**
 * Converts Convex VesselLocation back to domain format
 */
export const fromConvexVesselLocation = (
  cvl: ConvexVesselLocation
): DomainVesselLocation => {
  return {
    ...cvl,
    ArrivingTerminalID: cvl.ArrivingTerminalID ?? null,
    ArrivingTerminalName: cvl.ArrivingTerminalName ?? null,
    ArrivingTerminalAbbrev: cvl.ArrivingTerminalAbbrev ?? null,
    LeftDock: cvl.LeftDock ? new Date(cvl.LeftDock) : null,
    Eta: cvl.Eta ? new Date(cvl.Eta) : null,
    ScheduledDeparture: cvl.ScheduledDeparture
      ? new Date(cvl.ScheduledDeparture)
      : null,
    VesselPositionNum: cvl.VesselPositionNum ?? null,
    TimeStamp: new Date(cvl.TimeStamp),
  };
};

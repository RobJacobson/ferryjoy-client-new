import { v } from "convex/values";

import type { VesselLocation } from "@/data/types/VesselLocation";

import type { Doc } from "../../_generated/dataModel";

// ConvexVesselLocation type with dates mapped to numbers
export type ConvexVesselLocation = {
  VesselID: number;
  VesselName: string;
  DepartingTerminalID: number;
  DepartingTerminalName: string;
  DepartingTerminalAbbrev: string;
  ArrivingTerminalID: number | null;
  ArrivingTerminalName: string | null;
  ArrivingTerminalAbbrev: string | null;
  Latitude: number;
  Longitude: number;
  Speed: number;
  Heading: number;
  InService: boolean;
  AtDock: boolean;
  LeftDock: number | null;
  Eta: number | null;
  ScheduledDeparture: number | null;
  OpRouteAbbrev: string[];
  VesselPositionNum: number | null;
  TimeStamp: number;
};

// Shared vessel location validation schema
// This matches the VesselLocation type with dates as numbers
export const vesselLocationValidationSchema = {
  VesselID: v.number(),
  VesselName: v.string(),
  DepartingTerminalID: v.number(),
  DepartingTerminalName: v.string(),
  DepartingTerminalAbbrev: v.string(),
  ArrivingTerminalID: v.union(v.number(), v.null()),
  ArrivingTerminalName: v.union(v.string(), v.null()),
  ArrivingTerminalAbbrev: v.union(v.string(), v.null()),
  Latitude: v.number(),
  Longitude: v.number(),
  Speed: v.number(),
  Heading: v.number(),
  InService: v.boolean(),
  AtDock: v.boolean(),
  LeftDock: v.union(v.number(), v.null()),
  Eta: v.union(v.number(), v.null()),
  ScheduledDeparture: v.union(v.number(), v.null()),
  OpRouteAbbrev: v.array(v.string()),
  VesselPositionNum: v.union(v.number(), v.null()),
  TimeStamp: v.number(),
} as const;

// Vessel location mutation arguments (reusing shared schema)
export const vesselLocationArgs = vesselLocationValidationSchema;

export type VesselLocationDoc = Doc<"vesselLocation">;

/**
 * Converts a VesselLocation to ConvexVesselLocation by mapping dates to numbers
 */
export const toConvexVesselLocation = (
  vl: VesselLocation
): ConvexVesselLocation => ({
  ...vl,
  LeftDock: vl.LeftDock?.getTime() ?? null,
  Eta: vl.Eta?.getTime() ?? null,
  ScheduledDeparture: vl.ScheduledDeparture?.getTime() ?? null,
  TimeStamp: vl.TimeStamp.getTime(),
});

/**
 * Converts a ConvexVesselLocation back to VesselLocation by mapping numbers to dates
 */
export const toVesselLocationFromConvex = (
  cvl: ConvexVesselLocation
): VesselLocation => ({
  ...cvl,
  LeftDock: cvl.LeftDock ? new Date(cvl.LeftDock) : null,
  Eta: cvl.Eta ? new Date(cvl.Eta) : null,
  ScheduledDeparture: cvl.ScheduledDeparture
    ? new Date(cvl.ScheduledDeparture)
    : null,
  TimeStamp: new Date(cvl.TimeStamp),
});

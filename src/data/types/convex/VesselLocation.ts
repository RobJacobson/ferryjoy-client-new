import { v } from "convex/values";

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
  ArrivingTerminalID?: number;
  ArrivingTerminalName?: string;
  ArrivingTerminalAbbrev?: string;
  Latitude: number;
  Longitude: number;
  Speed: number;
  Heading: number;
  InService: boolean;
  AtDock: boolean;
  LeftDock?: number;
  Eta?: number;
  ScheduledDeparture?: number;
  OpRouteAbbrev: string[];
  VesselPositionNum?: number;
  TimeStamp: number;
};

/**
 * Shared vessel location validation schema
 * This matches the ConvexVesselLocation type with dates as numbers
 * Uses v.optional for fields that can be undefined (unset)
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

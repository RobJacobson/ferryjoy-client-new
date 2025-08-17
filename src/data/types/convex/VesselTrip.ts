import { v } from "convex/values";

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
 * Uses v.optional for fields that can be undefined (unset)
 * Includes all fields that Convex actually returns from queries
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
  // Additional fields that Convex returns but aren't in our core type
  _id: v.optional(v.string()),
  _creationTime: v.optional(v.number()),
} as const;

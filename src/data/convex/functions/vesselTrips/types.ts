import { v } from "convex/values";

// Shared vessel trip validation schema
// This can be reused in both schema.ts and mutation/query arguments
export const vesselTripValidationSchema = {
  VesselID: v.number(),
  VesselName: v.string(),
  DepartingTerminalID: v.number(),
  DepartingTerminalName: v.string(),
  DepartingTerminalAbbrev: v.string(),
  ArrivingTerminalID: v.optional(v.union(v.number(), v.null())),
  ArrivingTerminalName: v.optional(v.union(v.string(), v.null())),
  ArrivingTerminalAbbrev: v.optional(v.union(v.string(), v.null())),
  InService: v.boolean(),
  AtDock: v.boolean(),
  LeftDock: v.optional(v.number()),
  Eta: v.optional(v.number()),
  ScheduledDeparture: v.optional(v.union(v.number(), v.null())),
  ArvDock: v.optional(v.union(v.number(), v.null())),
  OpRouteAbbrev: v.optional(v.union(v.string(), v.null())),
  VesselPositionNum: v.optional(v.union(v.number(), v.null())),
  TimeStamp: v.number(),
  LastUpdated: v.number(),
} as const;

// Vessel trip mutation arguments (reusing shared schema)
export const vesselTripArgs = vesselTripValidationSchema;

// TypeScript type matching the vesselTripValidationSchema
export type ConvexVesselTrip = {
  VesselID: number;
  VesselName: string;
  DepartingTerminalID: number;
  DepartingTerminalName: string;
  DepartingTerminalAbbrev: string;
  ArrivingTerminalID?: number | null;
  ArrivingTerminalName?: string | null;
  ArrivingTerminalAbbrev?: string | null;
  InService: boolean;
  AtDock: boolean;
  LeftDock?: string | null;
  Eta?: string | null;
  ScheduledDeparture?: string | null;
  ArvDock?: number | null;
  OpRouteAbbrev?: string | null;
  VesselPositionNum?: number | null;
  TimeStamp: number;
  LastUpdated: number;
};

// Vessel query arguments
export const vesselQueryArgs = {
  VesselID: v.number(),
};

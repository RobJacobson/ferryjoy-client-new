import { v } from "convex/values";

// Shared vessel trip validation schema
// This can be reused in both schema.ts and mutation/query arguments
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

// Vessel trip mutation arguments (reusing shared schema)
export const vesselTripArgs = vesselTripValidationSchema;

// Vessel query arguments
export const vesselQueryArgs = {
  VesselID: v.number(),
};

import { v } from "convex/values";

// Shared vessel location validation schema
// This can be reused in both schema.ts and mutation/query arguments
export const vesselLocationValidationSchema = {
  VesselID: v.number(),
  VesselName: v.string(),
  DepartingTerminalID: v.number(),
  DepartingTerminalName: v.string(),
  DepartingTerminalAbbrev: v.string(),
  ArrivingTerminalID: v.optional(v.union(v.number(), v.null())),
  ArrivingTerminalName: v.optional(v.union(v.string(), v.null())),
  ArrivingTerminalAbbrev: v.optional(v.union(v.string(), v.null())),
  Latitude: v.number(),
  Longitude: v.number(),
  Speed: v.number(),
  Heading: v.number(),
  InService: v.boolean(),
  AtDock: v.boolean(),
  LeftDock: v.optional(v.union(v.number(), v.null())),
  Eta: v.optional(v.union(v.number(), v.null())),
  ScheduledDeparture: v.optional(v.union(v.number(), v.null())),
  OpRouteAbbrev: v.array(v.string()),
  VesselPositionNum: v.optional(v.union(v.number(), v.null())),
  TimeStamp: v.number(),
} as const;

// Vessel location mutation arguments (reusing shared schema)
export const vesselLocationArgs = vesselLocationValidationSchema;

// TypeScript type matching the vesselLocationValidationSchema
export type ConvexVesselLocation = {
  VesselID: number;
  VesselName: string;
  DepartingTerminalID: number;
  DepartingTerminalName: string;
  DepartingTerminalAbbrev: string;
  ArrivingTerminalID?: number | null;
  ArrivingTerminalName?: string | null;
  ArrivingTerminalAbbrev?: string | null;
  Latitude: number;
  Longitude: number;
  Speed: number;
  Heading: number;
  InService: boolean;
  AtDock: boolean;
  LeftDock?: number | null;
  Eta?: number | null;
  ScheduledDeparture?: number | null;
  OpRouteAbbrev: string[];
  VesselPositionNum?: number | null;
  TimeStamp: number;
};

// Vessel query arguments
export const vesselQueryArgs = {
  VesselID: v.number(),
};

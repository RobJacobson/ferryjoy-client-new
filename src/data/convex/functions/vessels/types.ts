import { v } from "convex/values";

// Vessel location mutation arguments
export const vesselLocationArgs = {
  VesselID: v.number(),
  VesselName: v.string(),
  Mmsi: v.number(),
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
  EtaBasis: v.optional(v.string()),
  ScheduledDeparture: v.optional(v.number()),
  OpRouteAbbrev: v.array(v.string()),
  VesselPositionNum: v.optional(v.number()),
  SortSeq: v.number(),
  ManagedBy: v.number(),
  TimeStamp: v.number(),
};

// Filtered vessel location mutation arguments (without Mmsi, EtaBasis, SortSeq)
export const vesselLocationFilteredArgs = {
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
};

// Vessel query arguments
export const vesselQueryArgs = {
  VesselID: v.number(),
};

import type { Infer } from "convex/values";
import { v } from "convex/values";

import type { VesselLocation } from "@/data/types/VesselLocation";

export const vesselLocationValidationSchema = v.object({
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
  OpRouteAbbrev: v.string(),
  VesselPositionNum: v.optional(v.number()),
  TimeStamp: v.number(),
});

export type ConvexVesselLocation = Infer<typeof vesselLocationValidationSchema>;

export const toConvexVesselLocation = (
  vl: VesselLocation
): ConvexVesselLocation => ({
  VesselID: vl.VesselID,
  VesselName: vl.VesselName,
  DepartingTerminalID: vl.DepartingTerminalID,
  DepartingTerminalName: vl.DepartingTerminalName,
  DepartingTerminalAbbrev: vl.DepartingTerminalAbbrev,
  ArrivingTerminalID: vl.ArrivingTerminalID ?? undefined,
  ArrivingTerminalName: vl.ArrivingTerminalName ?? undefined,
  ArrivingTerminalAbbrev: vl.ArrivingTerminalAbbrev ?? undefined,
  Latitude: vl.Latitude,
  Longitude: vl.Longitude,
  Speed: vl.Speed,
  Heading: vl.Heading,
  InService: vl.InService,
  AtDock: vl.AtDock,
  LeftDock: vl.LeftDock ? vl.LeftDock.getTime() : undefined,
  Eta: vl.Eta ? vl.Eta.getTime() : undefined,
  ScheduledDeparture: vl.ScheduledDeparture
    ? vl.ScheduledDeparture.getTime()
    : undefined,
  OpRouteAbbrev: vl.OpRouteAbbrev,
  VesselPositionNum: vl.VesselPositionNum ?? undefined,
  TimeStamp: vl.TimeStamp.getTime(),
});

export const fromConvexVesselLocation = (
  cvl: ConvexVesselLocation
): VesselLocation => ({
  VesselID: cvl.VesselID,
  VesselName: cvl.VesselName,
  DepartingTerminalID: cvl.DepartingTerminalID,
  DepartingTerminalName: cvl.DepartingTerminalName,
  DepartingTerminalAbbrev: cvl.DepartingTerminalAbbrev,
  ArrivingTerminalID: cvl.ArrivingTerminalID ?? null,
  ArrivingTerminalName: cvl.ArrivingTerminalName ?? null,
  ArrivingTerminalAbbrev: cvl.ArrivingTerminalAbbrev ?? null,
  Latitude: cvl.Latitude,
  Longitude: cvl.Longitude,
  Speed: cvl.Speed,
  Heading: cvl.Heading,
  InService: cvl.InService,
  AtDock: cvl.AtDock,
  LeftDock: cvl.LeftDock ? new Date(cvl.LeftDock) : null,
  Eta: cvl.Eta ? new Date(cvl.Eta) : null,
  ScheduledDeparture: cvl.ScheduledDeparture
    ? new Date(cvl.ScheduledDeparture)
    : null,
  OpRouteAbbrev: cvl.OpRouteAbbrev,
  VesselPositionNum: cvl.VesselPositionNum ?? null,
  TimeStamp: new Date(cvl.TimeStamp),
});

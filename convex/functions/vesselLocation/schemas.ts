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
  cv: ConvexVesselLocation
): VesselLocation => ({
  VesselID: cv.VesselID,
  VesselName: cv.VesselName,
  DepartingTerminalID: cv.DepartingTerminalID,
  DepartingTerminalName: cv.DepartingTerminalName,
  DepartingTerminalAbbrev: cv.DepartingTerminalAbbrev,
  ArrivingTerminalID: cv.ArrivingTerminalID ?? null,
  ArrivingTerminalName: cv.ArrivingTerminalName ?? null,
  ArrivingTerminalAbbrev: cv.ArrivingTerminalAbbrev ?? null,
  Latitude: cv.Latitude,
  Longitude: cv.Longitude,
  Speed: cv.Speed,
  Heading: cv.Heading,
  InService: cv.InService,
  AtDock: cv.AtDock,
  LeftDock: cv.LeftDock === undefined ? null : new Date(cv.LeftDock),
  Eta: cv.Eta === undefined ? null : new Date(cv.Eta),
  ScheduledDeparture:
    cv.ScheduledDeparture === undefined
      ? null
      : new Date(cv.ScheduledDeparture),
  OpRouteAbbrev: cv.OpRouteAbbrev,
  VesselPositionNum: cv.VesselPositionNum ?? null,
  TimeStamp: new Date(cv.TimeStamp),
});

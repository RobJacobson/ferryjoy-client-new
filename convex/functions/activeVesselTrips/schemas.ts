import type { Doc } from "@convex/_generated/dataModel";
// Inline conversions for dates to reduce indirection
import type { Infer } from "convex/values";
import { v } from "convex/values";

import type { ActiveVesselTrip } from "@/data/types/domain/ActiveVesselTrip";

// Schema for database storage (Convex format with undefined for optional fields)
export const activeVesselTripSchema = v.object({
  VesselID: v.number(),
  VesselName: v.string(),
  VesselAbbrev: v.string(),
  DepartingTerminalID: v.number(),
  DepartingTerminalName: v.string(),
  DepartingTerminalAbbrev: v.string(),
  ArrivingTerminalID: v.optional(v.number()),
  ArrivingTerminalName: v.optional(v.string()),
  ArrivingTerminalAbbrev: v.optional(v.string()),
  ScheduledDeparture: v.optional(v.number()),
  LeftDock: v.optional(v.number()),
  Eta: v.optional(v.number()),
  InService: v.boolean(),
  AtDock: v.boolean(),
  OpRouteAbbrev: v.optional(v.string()),
  VesselPositionNum: v.optional(v.number()),
  TimeStamp: v.number(),
  TripStart: v.optional(v.number()),
});

/**
 * Type for Convex active vessel trip
 */
export type ConvexActiveVesselTrip = Infer<typeof activeVesselTripSchema>;

/**
 * Converts Convex vessel trip to domain format
 * number → Date, undefined → null
 *
 * @param doc - The Convex document to convert
 * @returns Domain format vessel trip
 * @throws Error if conversion fails
 */
export const toActiveVesselTrip = (
  doc: Doc<"activeVesselTrips">
): ActiveVesselTrip => {
  try {
    return {
      VesselID: doc.VesselID,
      VesselName: doc.VesselName,
      VesselAbbrev: doc.VesselAbbrev,
      DepartingTerminalID: doc.DepartingTerminalID,
      DepartingTerminalName: doc.DepartingTerminalName,
      DepartingTerminalAbbrev: doc.DepartingTerminalAbbrev,
      ArrivingTerminalID: doc.ArrivingTerminalID ?? null,
      ArrivingTerminalName: doc.ArrivingTerminalName ?? null,
      ArrivingTerminalAbbrev: doc.ArrivingTerminalAbbrev ?? null,
      InService: doc.InService,
      AtDock: doc.AtDock,
      ScheduledDeparture:
        doc.ScheduledDeparture === undefined
          ? null
          : new Date(doc.ScheduledDeparture),
      LeftDock: doc.LeftDock === undefined ? null : new Date(doc.LeftDock),
      Eta: doc.Eta === undefined ? null : new Date(doc.Eta),
      OpRouteAbbrev: doc.OpRouteAbbrev ?? null,
      VesselPositionNum: doc.VesselPositionNum ?? null,
      TimeStamp: new Date(doc.TimeStamp),
      TripStart: doc.TripStart === undefined ? null : new Date(doc.TripStart),
    };
  } catch (error) {
    throw new Error(`Failed to convert active vessel trip: ${error}`);
  }
};

/**
 * Converts raw WSF vessel location data to Convex format
 * Date → number, null → undefined
 *
 * @param trip - The domain format vessel trip to convert
 * @returns Convex format vessel trip
 * @throws Error if conversion fails
 */
export const toConvexActiveVesselTrip = (
  trip: ActiveVesselTrip
): ConvexActiveVesselTrip => {
  try {
    return {
      VesselID: trip.VesselID,
      VesselName: trip.VesselName,
      VesselAbbrev: trip.VesselAbbrev,
      DepartingTerminalID: trip.DepartingTerminalID,
      DepartingTerminalName: trip.DepartingTerminalName,
      DepartingTerminalAbbrev: trip.DepartingTerminalAbbrev,
      ArrivingTerminalID: trip.ArrivingTerminalID ?? undefined,
      ArrivingTerminalName: trip.ArrivingTerminalName ?? undefined,
      ArrivingTerminalAbbrev: trip.ArrivingTerminalAbbrev ?? undefined,
      InService: trip.InService,
      AtDock: trip.AtDock,
      ScheduledDeparture: trip.ScheduledDeparture
        ? trip.ScheduledDeparture.getTime()
        : undefined,
      LeftDock: trip.LeftDock ? trip.LeftDock.getTime() : undefined,
      Eta: trip.Eta ? trip.Eta.getTime() : undefined,
      OpRouteAbbrev: trip.OpRouteAbbrev ?? undefined,
      VesselPositionNum: trip.VesselPositionNum ?? undefined,
      TimeStamp: trip.TimeStamp.getTime(),
      TripStart: trip.TripStart ? trip.TripStart.getTime() : undefined,
    };
  } catch (error) {
    throw new Error(`Failed to convert to Convex active vessel trip: ${error}`);
  }
};

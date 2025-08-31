import type { Doc } from "@convex/_generated/dataModel";
import { type Infer, v } from "convex/values";

import type { CompletedVesselTrip } from "@/data/types/CompletedVesselTrip";

import { activeVesselTripSchema } from "../activeVesselTrips/schemas";

export const completedVesselTripSchema = v.object({
  ...activeVesselTripSchema.fields,
  // Extended fields
  Key: v.string(),
  TripStart: v.number(),
  TripEnd: v.number(),
  LeftDock: v.number(),
  LeftDockDelay: v.number(),
  AtDockDuration: v.number(),
  AtSeaDuration: v.number(),
  TotalDuration: v.number(),
  ArvDockActual: v.optional(v.number()),
});

/**
 * Type for Convex completed vessel trip
 */
export type ConvexCompletedVesselTrip = Infer<typeof completedVesselTripSchema>;

/**
 * Converts Convex vessel trip to domain format
 * number → Date, undefined → null
 *
 * @param cvt - The Convex document to convert
 * @returns Domain format completed vessel trip
 * @throws Error if conversion fails
 */
export const toCompletedTrip = (
  cvt: Doc<"completedVesselTrips">
): CompletedVesselTrip => {
  try {
    return {
      VesselID: cvt.VesselID,
      VesselName: cvt.VesselName,
      VesselAbbrev: cvt.VesselAbbrev,
      DepartingTerminalID: cvt.DepartingTerminalID,
      DepartingTerminalName: cvt.DepartingTerminalName,
      DepartingTerminalAbbrev: cvt.DepartingTerminalAbbrev,
      ArrivingTerminalID: cvt.ArrivingTerminalID ?? null,
      ArrivingTerminalName: cvt.ArrivingTerminalName ?? null,
      ArrivingTerminalAbbrev: cvt.ArrivingTerminalAbbrev ?? null,
      ScheduledDeparture: cvt.ScheduledDeparture
        ? new Date(cvt.ScheduledDeparture)
        : null,
      LeftDock: new Date(cvt.LeftDock),
      Eta: cvt.Eta ? new Date(cvt.Eta) : null,
      InService: cvt.InService,
      AtDock: cvt.AtDock,
      OpRouteAbbrev: cvt.OpRouteAbbrev ?? null,
      VesselPositionNum: cvt.VesselPositionNum ?? null,
      TimeStamp: new Date(cvt.TimeStamp),
      TripStart: new Date(cvt.TripStart),

      Key: cvt.Key,
      TripEnd: new Date(cvt.TripEnd),
      LeftDockDelay: cvt.LeftDockDelay,
      AtDockDuration: cvt.AtDockDuration,
      AtSeaDuration: cvt.AtSeaDuration,
      TotalDuration: cvt.TotalDuration,
    };
  } catch (error) {
    throw new Error(`Failed to convert completed vessel trip: ${error}`);
  }
};

/**
 * Converts raw WSF vessel location data to Convex format
 * Date → number, null → undefined
 *
 * @param trip - The domain format completed vessel trip to convert
 * @returns Convex format completed vessel trip
 * @throws Error if conversion fails
 */
export const toConvexCompletedVesselTrip = (
  trip: CompletedVesselTrip
): ConvexCompletedVesselTrip => {
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
      ScheduledDeparture: trip.ScheduledDeparture?.getTime() ?? undefined,
      LeftDock: trip.LeftDock.getTime(),
      Eta: trip.Eta?.getTime() ?? undefined,
      InService: trip.InService,
      AtDock: trip.AtDock,
      OpRouteAbbrev: trip.OpRouteAbbrev ?? undefined,
      VesselPositionNum: trip.VesselPositionNum ?? undefined,
      TimeStamp: trip.TimeStamp.getTime(),
      TripStart: trip.TripStart?.getTime() ?? undefined,
      Key: trip.Key,
      TripEnd: trip.TripEnd.getTime(),
      LeftDockDelay: trip.LeftDockDelay ?? 0,
      AtDockDuration: trip.AtDockDuration,
      AtSeaDuration: trip.AtSeaDuration,
      TotalDuration: trip.TotalDuration,
      ArvDockActual: undefined,
    };
  } catch (error) {
    throw new Error(
      `Failed to convert to Convex completed vessel trip: ${error}`
    );
  }
};

import { api } from "@convex/_generated/api";
import type { ActionCtx } from "@convex/_generated/server";

import type { ActiveVesselTrip } from "@/data/types/ActiveVesselTrip";
import type { CompletedVesselTrip } from "@/data/types/CompletedVesselTrip";
import type { VesselLocation } from "@/data/types/VesselLocation";

import { toConvexCompletedVesselTrip } from "../../functions/completedVesselTrips/schemas";
import { FIRST_TRIP_START } from "./tripOrchestrator";

const MILLISECONDS_PER_MINUTE = 1000 * 60;
const ROUNDING_PRECISION = 10;

/**
 * Saves a completed vessel trip to the completed trips table.
 * This function is called when a vessel has finished its journey and started a new one.
 * It transforms the active trip into a completed trip with calculated duration metrics.
 *
 * @param ctx - The Convex action context for running mutations
 * @param currTrip - The active trip that has been completed
 * @param currLocation - Current vessel location used for trip end timestamp
 */
export const saveCompletedTrip = async (
  ctx: ActionCtx,
  currTrip: ActiveVesselTrip,
  currLocation: VesselLocation
) => {
  const completedTrip = toCompletedVesselTrip(currTrip, currLocation.TimeStamp);
  if (!completedTrip) {
    return;
  }
  await ctx.runMutation(api.functions.completedVesselTrips.mutations.insert, {
    trip: toConvexCompletedVesselTrip(completedTrip),
  });
};

/**
 * Determines if a vessel has started a new trip by comparing departure terminals.
 * A new trip is detected when the departing terminal changes, indicating the vessel
 * has completed its current journey and started a new one.
 *
 * @param currTrip - The existing active trip from database
 * @param currLocation - Current vessel location from WSF API
 * @returns True if the vessel has started a new trip, false otherwise
 */
export const hasStartedNewTrip = (
  currTrip: ActiveVesselTrip,
  currLocation: VesselLocation
) => currTrip.DepartingTerminalID !== currLocation.DepartingTerminalID;

/**
 * Transforms a completed active vessel trip to the completed vessel trip schema.
 * This function calculates various duration metrics for the completed journey:
 * - LeftDockDelay: How late the vessel departed from scheduled time
 * - AtDockDuration: How long the vessel was docked
 * - TotalDuration: Total journey time from start to finish
 * - AtSeaDuration: How long the vessel was at sea
 *
 * @param trip - The active vessel trip to be completed
 * @param currTimeStamp - The timestamp when the trip ended (current time)
 * @returns Completed vessel trip with calculated metrics, or null if trip cannot be completed
 */
export const toCompletedVesselTrip = (
  trip: ActiveVesselTrip,
  currTimeStamp: Date
): CompletedVesselTrip | null => {
  if (trip.TripStart === FIRST_TRIP_START || !trip.LeftDockActual) {
    return null;
  }
  return {
    ...trip,
    // Generate unique key for the completed trip based on schedule or departure time
    Key: getKey(trip),
    // Override TripStart to be non-null since we've checked it above
    TripStart: trip.TripStart,
    // Preserve the left dock timestamp
    LeftDock: trip.LeftDock,
    // Ensure LeftDockActual is non-null since we've checked it above
    LeftDockActual: trip.LeftDockActual,
    // Calculate departure delay (negative if early, positive if late)
    LeftDockDelay: trip.ScheduledDeparture
      ? duration(trip.ScheduledDeparture, trip.LeftDockActual)
      : null,
    // Calculate time spent at dock before departure
    AtDockDuration: duration(trip.TripStart, trip.LeftDockActual),
    // Calculate time spent at sea
    AtSeaDuration: duration(trip.LeftDockActual, currTimeStamp),
    // Calculate total journey duration
    TotalDuration: duration(trip.TripStart, currTimeStamp),
    // Set trip end to current timestamp
    TripEnd: currTimeStamp,
    // Update vessel dock status based on current location
    AtDock: true,
  };
};

/**
 * Calculates the duration between two dates in minutes
 *
 * @param start - The start time
 * @param end - The end time
 * @returns Duration in minutes, rounded to the nearest 0.1 minutes
 */
const duration = (start: Date, end: Date) => {
  return roundMin(end.getTime() - start.getTime());
};

/**
 * Rounds a time duration in milliseconds to the nearest 0.1 minutes.
 * This function is used to standardize duration calculations for vessel trips.
 *
 * @param timeMs - Time duration in milliseconds
 * @returns Duration rounded to the nearest 0.1 minutes
 */
const roundMin = (timeMs: number) => {
  const durationMinutes = timeMs / MILLISECONDS_PER_MINUTE;
  return Math.round(durationMinutes * ROUNDING_PRECISION) / ROUNDING_PRECISION;
};

/**
 * Generates a unique key for a vessel trip based on vessel abbreviation and timestamp.
 * This key is used to identify and track specific trips in the system.
 * The key format is: "vesselabrv-YYYY-MM-DD-hh:mm" (e.g., "KEN_2025-08-19_17:30")
 *
 * @param currTrip - The vessel trip to generate a key for
 * @returns A unique string identifier for the trip
 */
const getKey = (currTrip: ActiveVesselTrip) => {
  const date = currTrip.ScheduledDeparture || currTrip.TimeStamp;
  console.log(date.toString());
  return `${currTrip.VesselAbbrev}_${date.toISOString().slice(0, 16).replace("T", "_")}`;
};

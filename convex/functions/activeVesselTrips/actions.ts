/* eslint-disable @typescript-eslint/no-explicit-any */
/** biome-ignore-all lint/suspicious/noExplicitAny: hardcoded fields */

import { api } from "@convex/_generated/api";
import { type ActionCtx, internalAction } from "@convex/_generated/server";
import { WsfVessels } from "ws-dottie";

import type { ActiveVesselTrip } from "@/data/types/ActiveVesselTrip";
import type { CompletedVesselTrip } from "@/data/types/CompletedVesselTrip";
import type { VesselLocation } from "@/data/types/VesselLocation";
import { toVesselLocation } from "@/data/types/VesselLocation";
import { getVesselAbbreviation } from "@/data/utils/vesselAbbreviations";

import { toConvexCompletedVesselTrip } from "../completedVesselTrips/schemas";
import { toConvexActiveVesselTrip } from "./schemas";

const MILLISECONDS_PER_MINUTE = 1000 * 60;
const ROUNDING_PRECISION = 10;

/**
 * Main action for updating vessel trips by fetching current data from WSF API and syncing with database.
 * This action runs on a cron job every 15 seconds to keep vessel trip data current.
 * It handles three main operations:
 * 1. Processing completed trips (moving them to completed table)
 * 2. Inserting new trips for vessels that have started new journeys
 * 3. Updating existing in-progress trips with any changes
 *
 * @param ctx - The Convex action context providing access to run queries and mutations
 */
export const updateVesselTrips = internalAction({
  args: {},
  handler: async (ctx) => {
    // Step 1: Get pairs of currTrip and currPosition
    const tripPairs = await getTripPairs(ctx);

    // Step 2: Process each trip pair sequentially
    for (const tripPair of tripPairs) {
      try {
        await processTripPair(ctx, tripPair);
      } catch (error) {
        // Log the error but continue processing other vessel trips
        // This prevents a single vessel failure from stopping the entire update
        console.error(
          `Failed to process vessel trip for vessel ${tripPair.currLocation.VesselID} (${tripPair.currLocation.VesselName}):`,
          error
        );
      }
    }
  },
});

/**
 * Processes a single vessel trip pair by determining the appropriate action based on current state.
 * This function implements the business logic for handling three scenarios:
 * 1. New vessel trip (no existing trip in database)
 * 2. Trip transition (vessel has started a new journey)
 * 3. Trip update (existing trip with new data)
 *
 * @param ctx - The Convex action context for database operations
 * @param tripPair - Object containing current trip data and vessel location
 * @param tripPair.currTrip - The existing active trip from database, undefined if no trip exists
 * @param tripPair.currLocation - Current vessel location from WSF API
 */
const processTripPair = async (
  ctx: ActionCtx,
  {
    currTrip,
    currLocation,
  }: { currTrip?: ActiveVesselTrip; currLocation: VesselLocation }
) => {
  // If prevTrip is undefined (i.e., first trip), insert new trip
  if (!currTrip) {
    return createAndInsertNewTrip(ctx, currLocation);
  }

  // If we have started a new trip, update prevTrip and insert new trip
  if (hasStartedNewTrip(currTrip, currLocation)) {
    await saveCompletedTrip(ctx, currTrip, currLocation);
    return createAndInsertNewTrip(ctx, currLocation);
  }

  // If the data has changed, update currTrip with new data
  if (hasNewData(currTrip, currLocation)) {
    return updateCurrentTrip(ctx, currTrip, currLocation);
  }
};

/**
 * Fetches current vessel locations from WSF API and pairs them with existing active trips.
 * This function retrieves real-time vessel data and matches it with database records
 * to determine which vessels need new trips, updates, or completion processing.
 *
 * @param ctx - The Convex action context for running queries
 * @returns Array of trip pairs containing current location and existing trip data
 */
const getTripPairs = async (ctx: ActionCtx) => {
  // Fetch current vessel locations from WSF API
  const currLocations = (await WsfVessels.getVesselLocations()).map(
    toVesselLocation
  );

  // Get existing active trips from database
  const currTrips = await ctx.runQuery(
    api.functions.activeVesselTrips.queries.getActiveTrips
  );

  // Match each vessel location with its corresponding active trip
  const tripPairs = currLocations.map((currLocation) => {
    const currTrip = currTrips.find(
      (trip) => trip.VesselID === currLocation.VesselID
    );
    return { currTrip, currLocation };
  });
  return tripPairs;
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
const hasStartedNewTrip = (
  currTrip: ActiveVesselTrip,
  currLocation: VesselLocation
) =>
  !currTrip ||
  currTrip.DepartingTerminalID !== currLocation.DepartingTerminalID;

/**
 * Creates and inserts a new active vessel trip into the database.
 * This function is called when a vessel starts a new journey or when
 * no existing trip is found for a vessel.
 *
 * @param ctx - The Convex action context for running mutations
 * @param currPosition - Current vessel location data from WSF API
 */
const createAndInsertNewTrip = async (
  ctx: ActionCtx,
  currPosition: VesselLocation
) => {
  const newTrip = toActiveVesselTrip(currPosition);
  await ctx.runMutation(api.functions.activeVesselTrips.mutations.insert, {
    trip: toConvexActiveVesselTrip(newTrip),
  });
};

/**
 * Saves a completed vessel trip to the completed trips table.
 * This function is called when a vessel has finished its journey and started a new one.
 * It transforms the active trip into a completed trip with calculated duration metrics.
 *
 * @param ctx - The Convex action context for running mutations
 * @param currTrip - The active trip that has been completed
 * @param currLocation - Current vessel location used for trip end timestamp
 */
const saveCompletedTrip = async (
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
 * Transforms a completed active vessel trip to the completed vessel trip schema.
 * This function calculates various duration metrics for the completed journey:
 * - LeftDockDelay: How late the vessel departed from scheduled time
 * - AtDockDuration: How long the vessel was docked
 * - TotalDuration: Total journey time from start to finish
 * - AtSeaDuration: How long the vessel was xat sea
 *
 * @param trip - The active vessel trip to be completed
 * @param currTimeStamp - The timestamp when the trip ended (current time)
 * @returns Completed vessel trip with calculated metrics, or null if trip cannot be completed
 */
const toCompletedVesselTrip = (
  trip: ActiveVesselTrip,
  currTimeStamp: Date
): CompletedVesselTrip | null => {
  if (!trip.LeftDock || !trip.TripStart) {
    return null;
  }
  return {
    ...trip,
    // Generate unique key for the completed trip based on schedule or departure time
    Key: getKey(trip),
    // Preserve the left dock timestamp
    LeftDock: trip.LeftDock,
    // Set trip end to current timestamp
    TripEnd: currTimeStamp,
    // Mark vessel as docked at completion
    AtDock: true,
    // Calculate departure delay (negative if early, positive if late)
    LeftDockDelay: !trip.ScheduledDeparture
      ? null
      : duration(trip.ScheduledDeparture, trip.LeftDock),
    // Calculate time spent at dock before departure
    AtDockDuration: duration(trip.TripStart, trip.LeftDock),
    // Calculate time spent at sea
    AtSeaDuration: duration(trip.LeftDock, currTimeStamp),
    // Calculate total journey duration
    TotalDuration: duration(trip.TripStart, currTimeStamp),
    // Override TripStart to be non-null since we've checked it above
    TripStart: trip.TripStart,
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
 * Updates an existing active vessel trip with new location data.
 * This function preserves the original trip start time and vessel abbreviation
 * while updating all other fields with current vessel location data.
 *
 * @param ctx - The Convex action context for running mutations
 * @param currTrip - The existing active trip to be updated
 * @param currLocation - Current vessel location data from WSF API
 */
const updateCurrentTrip = async (
  ctx: ActionCtx,
  currTrip: ActiveVesselTrip,
  currLocation: VesselLocation
): Promise<void> => {
  // Create the update trip data, preserving original trip metadata
  const updateTripData: ActiveVesselTrip = {
    ...toActiveVesselTrip(currLocation),
    VesselAbbrev: currTrip.VesselAbbrev,
    TripStart: currTrip.TripStart, // Preserve existing TripStart from database
  };

  // Update the trip in the database
  await ctx.runMutation(api.functions.activeVesselTrips.mutations.update, {
    trip: toConvexActiveVesselTrip(updateTripData),
  });
};

/**
 * Compares two objects for changes in specified fields to determine if an update is needed.
 * This function uses a functional approach to compare all fields except TimeStamp and TripStart.
 * Only fields that represent actual vessel state changes are compared.
 *
 * @param currTrip - The existing active trip from database
 * @param currLocation - Current vessel location from WSF API
 * @returns True if any relevant field has changed, false otherwise
 */
const FIELDS_TO_COMPARE = [
  "DepartingTerminalID",
  "ArrivingTerminalID",
  "ScheduledDeparture",
  "LeftDock",
  "Eta",
  "InService",
  "AtDock",
  "OpRouteAbbrev",
  "VesselPositionNum",
] as const;

const hasNewData = (
  currTrip: ActiveVesselTrip,
  currLocation: VesselLocation
): boolean =>
  FIELDS_TO_COMPARE.some((field) => currTrip[field] !== currLocation[field]);

/**
 * Generates a unique key for a vessel trip based on vessel abbreviation and timestamp.
 * This key is used to identify and track specific trips in the system.
 * The key format is: "vesselabrv-YYYY-MM-DD-hh:mm" (e.g., "KEN-2025-08-19-17:30")
 *
 * @param currTrip - The vessel trip to generate a key for
 * @returns A unique string identifier for the trip
 */
const getKey = (currTrip: ActiveVesselTrip) => {
  const date = currTrip.ScheduledDeparture || currTrip.TimeStamp;
  console.log(date.toString());
  return `${currTrip.VesselAbbrev}-${date.toISOString().slice(0, 16).replace("T", "-")}`;
};

/**
 * Converts a VesselLocation to an ActiveVesselTrip for new trip creation.
 * This function handles the business logic of transforming vessel location data
 * into trip data, including setting initial trip state and handling field mappings.
 * It uses the vessel abbreviation lookup table for consistent vessel identification.
 *
 * @param location - Current vessel location data from WSF API
 * @returns Active vessel trip object ready for database insertion
 */
const toActiveVesselTrip = (location: VesselLocation): ActiveVesselTrip => {
  // Extract the first route abbreviation from the array, or use null if empty
  const opRouteAbbrev = location.OpRouteAbbrev?.[0] ?? null;

  return {
    VesselID: location.VesselID,
    VesselName: location.VesselName,
    VesselAbbrev: getVesselAbbreviation(location.VesselName),
    DepartingTerminalID: location.DepartingTerminalID,
    DepartingTerminalName: location.DepartingTerminalName,
    DepartingTerminalAbbrev: location.DepartingTerminalAbbrev,
    ArrivingTerminalID: location.ArrivingTerminalID ?? null,
    ArrivingTerminalName: location.ArrivingTerminalName ?? null,
    ArrivingTerminalAbbrev: location.ArrivingTerminalAbbrev ?? null,
    ScheduledDeparture: location.ScheduledDeparture ?? null,
    LeftDock: location.LeftDock ?? null,
    Eta: location.Eta ?? null,
    InService: location.InService,
    AtDock: location.AtDock,
    OpRouteAbbrev: opRouteAbbrev,
    VesselPositionNum: location.VesselPositionNum ?? null,
    TimeStamp: location.TimeStamp,
    TripStart: location.TimeStamp, // Set trip start to current timestamp for new trips
  };
};

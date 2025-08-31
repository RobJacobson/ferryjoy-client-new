import { api } from "@convex/_generated/api";
import type { ActionCtx } from "@convex/_generated/server";
import { WsfVessels } from "ws-dottie";

import type { ActiveVesselTrip } from "@/data/types/ActiveVesselTrip";
import type { VesselLocation } from "@/data/types/VesselLocation";
import { toVesselLocation } from "@/data/types/VesselLocation";

import { toActiveVesselTrip } from "../../functions/activeVesselTrips/schemas";
import { hasStartedNewTrip, saveCompletedTrip } from "./completeTrip";
import { insertNewTrip } from "./createTrip";
import { updateCurrentTrip } from "./updateTrip";

// Start time is undefined for the very first trip for each vessel, since we have no
// data on the trip's actual start time.
export const FIRST_TRIP_START = new Date(0);

/**
 * Main orchestrator for updating vessel trips by fetching current data from WSF API and syncing with database.
 * This orchestrator handles three main operations:
 * 1. Processing completed trips (moving them to completed table)
 * 2. Inserting new trips for vessels that have started new journeys
 * 3. Updating existing in-progress trips with any changes
 *
 * @param ctx - The Convex action context providing access to run queries and mutations
 */
export const orchestrateVesselTripUpdates = async (ctx: ActionCtx) => {
  // Step 1: Get pairs of currTrip and currPosition
  const tripPairs = await getTripPairs(ctx);

  // Step 2: Process each trip pair sequentially
  for (const tripPair of tripPairs) {
    try {
      await processTripPair(ctx, tripPair);
    } catch (error) {
      // Log the error but continue processing other vessel trips
      console.error(
        `Failed to process vessel trip for vessel ${tripPair.currLocation.VesselID} (${tripPair.currLocation.VesselName}):`,
        error
      );
    }
  }
};

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
export const processTripPair = async (
  ctx: ActionCtx,
  {
    currTrip,
    currLocation,
  }: { currTrip?: ActiveVesselTrip; currLocation: VesselLocation }
) => {
  // If prevTrip is undefined (i.e., first trip), insert new trip
  if (!currTrip) {
    return insertNewTrip(ctx, currLocation, FIRST_TRIP_START);
  }

  // If we have started a new trip, save the completed trip and insert a new one
  if (hasStartedNewTrip(currTrip, currLocation)) {
    await saveCompletedTrip(ctx, currTrip, currLocation);
    return insertNewTrip(ctx, currLocation, currLocation.TimeStamp);
  }

  // If the data has changed, update the current trip with new data
  await updateCurrentTrip(ctx, currTrip, currLocation);
};

/**
 * Fetches current vessel locations from WSF API and pairs them with existing active trips.
 * This function retrieves real-time vessel data and matches it with database records
 * to determine which vessels need new trips, updates, or completion processing.
 *
 * @param ctx - The Convex action context for running queries
 * @returns Array of trip pairs containing current location and existing trip data
 */
export const getTripPairs = async (ctx: ActionCtx) => {
  // Fetch current vessel locations from WSF API
  const currLocations = (await WsfVessels.getVesselLocations()).map(
    toVesselLocation
  );

  // Get existing active trips from database
  const convexTrips = await ctx.runQuery(
    api.functions.activeVesselTrips.queries.getActiveTrips
  );
  // Convert Convex docs to domain format (Dates/null) locally
  const currTrips = convexTrips.map(toActiveVesselTrip);

  // Match each vessel location with its corresponding active trip
  const tripPairs = currLocations.map((currLocation) => {
    const currTrip = currTrips.find(
      (trip) => trip.VesselID === currLocation.VesselID
    );
    return { currTrip, currLocation };
  });
  return tripPairs;
};

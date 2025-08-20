/* eslint-disable @typescript-eslint/no-explicit-any */
/** biome-ignore-all lint/suspicious/noExplicitAny: hardcoded fields */

import { api } from "@convex/_generated/api";
import type { Doc, Id } from "@convex/_generated/dataModel";
import { type ActionCtx, internalAction } from "@convex/_generated/server";
import { WsfVessels } from "ws-dottie";

import type { ConvexVesselTripCompleted } from "../completedVesselTrips";
import { type ConvexVesselTrip, toConvexVesselTrip } from "./schemas";

type ActiveVesselTrip = Doc<"activeVesselTrips">;

/**
 * Represents a comparison between a current vessel trip and its previous state.
 * Used for categorizing trips as completed, in-progress, or new.
 */
type TripPair = {
  prev: ActiveVesselTrip;
  curr: ConvexVesselTrip;
};

/**
 * Categorized vessel trips for processing during the update cycle.
 * Separates trips into three categories: new trips that need to be created,
 * completed trips that need to be moved to the completed table, and
 * in-progress trips that may need updates.
 */
type CategorizedTrips = {
  newTrips: ConvexVesselTrip[];
  completedTrips: TripPair[];
  inProgressTrips: TripPair[];
};

/**
 * Main action for updating vessel trips by fetching current data from WSF API and syncing with database.
 * This action runs on a cron job every 15 seconds to keep vessel trip data current.
 * It handles three main operations:
 * 1. Processing completed trips (moving them to completed table)
 * 2. Inserting new trips for vessels that have started new journeys
 * 3. Updating existing in-progress trips with any changes
 */
export const updateVesselTrips = internalAction({
  args: {},
  handler: async (ctx) => {
    // Step 1: Fetch and categorize all current vessel trips
    const { completedTrips, newTrips, inProgressTrips } =
      await getCategorizedTripsCombined(ctx);

    // Step 2: Process completed trips
    await processCompletedTrips(ctx, completedTrips);

    // Step 3: Insert initial new trips
    await insertInitialNewTrips(ctx, newTrips);

    // Step 4: Insert post-completion new trips
    await insertPostCompletionNewTrips(ctx, completedTrips);

    // Step 5: Update in-progress trips
    await updateCurrentTrips(ctx, inProgressTrips);
  },
});

/**
 * Step 1: Fetch and categorize current vessel trips
 *
 * Fetches and categorizes current vessel trips from both the WSF API domain and Convex database.
 * This function is the core of the categorization logic, determining which trips are new,
 * which have completed, and which are still in progress by comparing current API data
 * with previously stored database records.
 */
const getCategorizedTripsCombined = async (
  ctx: ActionCtx
): Promise<CategorizedTrips> => {
  const [currentTrips, storedTrips] = await Promise.all([
    WsfVessels.getVesselLocations().then((locations) =>
      locations.map(toConvexVesselTrip)
    ),
    ctx.runQuery(api.functions.activeVesselTrips.queries.getActiveTrips),
  ]);

  const storedMap = new Map(storedTrips.map((trip) => [trip.VesselID, trip]));

  return currentTrips.reduce(
    (acc, curr) => {
      const prev = storedMap.get(curr.VesselID);

      if (!prev) {
        acc.newTrips.push(curr);
      } else if (curr.DepartingTerminalID !== prev.DepartingTerminalID) {
        acc.completedTrips.push({ prev, curr });
      } else {
        acc.inProgressTrips.push({ prev, curr });
      }

      return acc;
    },
    {
      newTrips: [],
      completedTrips: [],
      inProgressTrips: [],
    } as CategorizedTrips
  );
};

/**
 * Step 2: Process completed trips
 *
 * Processes completed trips by moving them to the completed table.
 * This function focuses solely on the lifecycle of a completed vessel journey:
 * 1. Determines which completed trips have a start time (i.e., not partial trips)
 * 2. Moves true completed trip data to the completed trips table
 * 3. Removes both partial and completed trips from the old active trip record
 */
const processCompletedTrips = async (
  ctx: ActionCtx,
  completedTrips: TripPair[]
): Promise<void> => {
  if (completedTrips.length === 0) {
    return;
  }

  // Transform completed trips to the completed vessel trip schema
  const tripsToInsert = completedTrips
    .filter((trip) => Boolean(trip.prev.TripStart))
    .map((trip) => toCompletedVesselTrip(trip as TripPair));

  // Insert completed trips into the completed trips table using bulk operation
  if (tripsToInsert.length > 0) {
    await ctx.runMutation(
      api.functions.completedVesselTrips.index
        .insertMultipleCompletedVesselTrips,
      { trips: tripsToInsert }
    );
  }

  // Delete old active trip records for all vessels using bulk operation
  const vesselIds = completedTrips.map(({ prev }) => prev.VesselID);
  if (vesselIds.length > 0) {
    await ctx.runMutation(
      api.functions.activeVesselTrips.mutations.deleteByVesselIds,
      { vesselIds }
    );
  }
};

/**
 * Transforms a completed active vessel trip to the completed vessel trip schema.
 * This function calculates various duration metrics for the completed journey:
 * - LeftDockDelay: How late the vessel departed from scheduled time
 * - AtDockDuration: How long the vessel was docked
 * - TotalDuration: Total journey time from start to finish
 * - AtSeaDuration: How long the vessel was at sea
 */
const toCompletedVesselTrip = ({
  prev,
  curr,
}: TripPair): ConvexVesselTripCompleted => {
  // Destructure to exclude Convex-specific fields
  const { _id, _creationTime, ...tripData } = prev;

  return {
    ...tripData,
    Key: getKey(curr),
    TripStart: prev.TripStart,
    TripEnd: curr.TimeStamp,
    AtDock: true,
    LeftDockDelay: calculateDurationMin(prev.ScheduledDeparture, prev.LeftDock),
    AtDockDuration: calculateDurationMin(prev.TripStart, prev.LeftDock),
    TotalDuration: calculateDurationMin(prev.TripStart, curr.TimeStamp),
    AtSeaDuration: calculateDurationMin(prev.LeftDock, curr.TimeStamp),
  };
};

/**
 * Calculates the duration between two timestamps in minutes
 * If either timestamp is undefined, returns 0.
 */
const calculateDurationMin = (start?: number, end?: number) => {
  if (!start || !end) return 0;

  const durationMs = end - start;
  const durationMinutes = durationMs / (1000 * 60); // Convert ms to minutes
  return Math.round(durationMinutes * 10) / 10; // Round to nearest 0.1 minute
};

/**
 * Step 3:
 * Inserts initial new trips (first run, partial trips without TripStart)
 */
const insertInitialNewTrips = async (
  ctx: ActionCtx,
  newTrips: ConvexVesselTrip[]
): Promise<void> => {
  if (newTrips.length > 0) {
    await ctx.runMutation(
      api.functions.activeVesselTrips.mutations.insertMultiple,
      { trips: newTrips }
    );
  }
};

/**
 * Step 4:
 * Inserts post-completion new trips (after vessels complete journeys, with TripStart)
 */
const insertPostCompletionNewTrips = async (
  ctx: ActionCtx,
  completedTrips: TripPair[]
): Promise<void> => {
  if (completedTrips.length > 0) {
    const newTrips = completedTrips.map(({ curr }) => ({
      ...curr,
      TripStart: curr.TimeStamp,
    }));

    await ctx.runMutation(
      api.functions.activeVesselTrips.mutations.insertMultiple,
      { trips: newTrips }
    );
  }
};

/**
 * Step 5: Update in-progress trips
 *
 * Updates in-progress trips with any changes from the domain data.
 * This function compares multiple fields between the current API data and
 * stored database records to identify and apply any updates to ongoing trips.
 */
const updateCurrentTrips = async (
  ctx: ActionCtx,
  inProgressTrips: TripPair[]
): Promise<void> => {
  if (inProgressTrips.length === 0) {
    return;
  }

  // Filter trips that have changes, then map to update objects
  const updates = inProgressTrips
    .filter(({ prev, curr }) => hasSignificantChanges(prev, curr))
    .map(({ prev, curr }) => ({
      id: prev._id,
      trip: {
        ...curr,
        TripStart: prev.TripStart, // Preserve existing TripStart from database
      } as ConvexVesselTrip,
    }));

  // Apply all updates in a single bulk operation
  if (updates.length > 0) {
    await ctx.runMutation(
      api.functions.activeVesselTrips.mutations.updateMultiple,
      { updates }
    );
  }
};

/**
 * Compares two objects for changes in specified fields to determine if an update is needed.
 * This function uses a functional approach to compare all fields except TimeStamp and TripStart.
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

const hasSignificantChanges = (
  prev: ConvexVesselTrip,
  curr: ConvexVesselTrip
): boolean => FIELDS_TO_COMPARE.some((field) => prev[field] !== curr[field]);

/**
 * Generates a unique key for a vessel trip based on vessel abbreviation and Pacific time.
 * This key is used to identify and track specific trips in the system.
 * Format: "vesselabrv-YYYY-MM-DD-hh:mm" (e.g., "KEN-2025-08-19-17:30")
 */
const getKey = (trip: ConvexVesselTrip) => {
  const date = new Date(trip.ScheduledDeparture || trip.TimeStamp);
  return `${trip.VesselAbbrev}-${date.toISOString().slice(0, 16).replace("T", "-")}`;
};

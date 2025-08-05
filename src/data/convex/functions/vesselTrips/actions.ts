import { WsfVessels } from "ws-dottie";

import { api } from "@/data/convex/_generated/api";
import type { Id } from "@/data/convex/_generated/dataModel";
import { internalAction } from "@/data/convex/_generated/server";
import { toConvex } from "@/data/types/converters";
import type { ConvexVesselTrip } from "@/data/types/convex/VesselTrip";
import { toVesselTrip } from "@/data/types/domain/VesselTrip";
import { log } from "@/shared/lib/logger";

import { withLogging } from "../shared/logging";

const vesselTripWatchFields = [
  "VesselID",
  "VesselName",
  "DepartingTerminalID",
  "DepartingTerminalName",
  "DepartingTerminalAbbrev",
  "ArrivingTerminalID",
  "ArrivingTerminalName",
  "ArrivingTerminalAbbrev",
  "InService",
  "AtDock",
  "LeftDock",
  "LeftDockActual",
  "Eta",
  "ScheduledDeparture",
  "ArvDockActual",
  "OpRouteAbbrev",
  "VesselPositionNum",
] as const;

type VesselTripWatchField = (typeof vesselTripWatchFields)[number];

type ConvexVesselTripWithIdAndCreationTime = ConvexVesselTrip & {
  _id: Id<"activeVesselTrips">;
  _creationTime: number;
};

/**
 * Internal action for updating vessel trips by comparing with existing data
 *
 * BUSINESS LOGIC RULES:
 * 1. New Vessel: If no existing trip exists for a vessel, create a new trip record
 * 2. ArvDock Logic: If vessel just arrived at dock, update existing trip with arrival time
 * 3. New Journey: If DepartingTerminalID changes, create a new trip (new journey/leg) and complete the old trip
 * 4. LeftDock Logic: If vessel just left dock, update existing trip with left dock time
 * 5. Same Journey Updates: If same departing terminal, update existing trip if fields changed
 * 6. No Changes: If no relevant fields changed, do nothing (preserve existing data)
 */
export const updateVesselTrips = internalAction({
  args: {},
  handler: withLogging(
    "Vessel Trips update",
    async (
      ctx
    ): Promise<{
      success: boolean;
      inserted: number;
      updated: number;
      unchanged: number;
      completed: number;
      message?: string;
    }> => {
      const convexTrips = await fetchVesselTrips();
      const vesselIds = convexTrips.map((trip) => trip.VesselID);

      // Fetch previous active trips for the current vessels
      const prevTrips = await ctx.runQuery(
        api.functions.vesselTrips.queries.getActiveTrips
      );
      const prevTripsMap = new Map<
        number,
        ConvexVesselTripWithIdAndCreationTime
      >(
        prevTrips.map((trip: ConvexVesselTripWithIdAndCreationTime) => [
          trip.VesselID,
          trip,
        ])
      );

      log.info(
        `Fetched ${prevTrips.length} active trips for ${convexTrips.length} current vessels`
      );

      const { tripsToInsert, tripsToUpdate, tripsToComplete } =
        processVesselTrips(convexTrips, prevTripsMap);

      // Validate that we have valid document IDs before proceeding
      const validTripsToComplete = tripsToComplete.filter((id) => {
        if (!id) {
          log.warn("Skipping invalid document ID in tripsToComplete");
          return false;
        }
        // Ensure the document still exists before trying to move it
        return true;
      });

      // Move completed trips to completed table FIRST (before inserting new trips)
      let completedCount = 0;
      if (validTripsToComplete.length > 0) {
        try {
          const result = await ctx.runMutation(
            api.functions.vesselTrips.mutations.bulkMoveToHistorical,
            {
              tripIds: validTripsToComplete,
            }
          );
          completedCount = result.movedIds.length;

          if (result.errors && result.errors.length > 0) {
            log.warn(
              `Bulk move completed with ${result.errors.length} errors:`,
              result.errors
            );
          }
        } catch (error) {
          log.error("Failed to move trips to historical:", error);
          // Don't fail the entire operation, just log the error
          completedCount = 0;
        }
      }

      // Use a single consolidated mutation to avoid write conflicts
      await ctx.runMutation(
        api.functions.vesselTrips.mutations.bulkInsertAndUpdateActive,
        {
          tripsToInsert,
          tripsToUpdate: tripsToUpdate.map((update) => ({
            id: update.id,
            ...update.data,
          })),
        }
      );

      const inserted = tripsToInsert.length;
      const updated = tripsToUpdate.length;
      const unchanged = convexTrips.length - inserted - updated;

      return {
        success: true,
        inserted,
        updated,
        unchanged,
        completed: completedCount,
        message: `Inserted: ${inserted}, Updated: ${updated}, Unchanged: ${unchanged}, Completed: ${completedCount}`,
      };
    }
  ),
});

/**
 * Fetches and transforms vessel data from WSF API
 */
const fetchVesselTrips = async (): Promise<ConvexVesselTrip[]> => {
  const rawVesselData = await WsfVessels.getVesselLocations();
  return rawVesselData
    .map(toVesselTrip)
    .map(toConvex) as unknown as ConvexVesselTrip[];
};

/**
 * Processes vessel trips according to business rules
 */
const processVesselTrips = (
  convexTrips: ConvexVesselTrip[],
  prevTripsMap: Map<number, ConvexVesselTripWithIdAndCreationTime>
): {
  tripsToInsert: ConvexVesselTrip[];
  tripsToUpdate: Array<{ id: Id<"activeVesselTrips">; data: ConvexVesselTrip }>;
  tripsToComplete: Id<"activeVesselTrips">[];
} => {
  const tripsToInsert: ConvexVesselTrip[] = [];
  const tripsToUpdate: Array<{
    id: Id<"activeVesselTrips">;
    data: ConvexVesselTrip;
  }> = [];
  const tripsToComplete: Id<"activeVesselTrips">[] = [];

  convexTrips.forEach((currTrip) => {
    const prevTripFull = prevTripsMap.get(currTrip.VesselID);

    // RULE 1: New Vessel - only insert if no existing trip exists
    if (!prevTripFull) {
      logInsert(currTrip);
      tripsToInsert.push(currTrip);
      return;
    }

    // RULE 2: Timestamp out of order (ignore)
    if (invalidTimestamp(prevTripFull, currTrip)) {
      return;
    }

    // Remove Convex-internal fields
    const { _id, _creationTime, ...prevTrip } = prevTripFull;

    // Validate that we have a valid _id
    if (!_id) {
      return;
    }

    // RULE 3: Vessel arrived at dock
    if (hasArrivedDock(prevTrip, currTrip)) {
      logUpdate(prevTrip, currTrip);
      const update = createArrivalDockUpdate(prevTrip, currTrip);
      tripsToUpdate.push({ id: _id, data: update });
      return;
    }

    // RULE 4: New Journey - Departure Terminal Changed
    if (hasJourneyStarted(prevTrip, currTrip)) {
      logInsert(currTrip);
      tripsToInsert.push(currTrip);

      // Only add to tripsToComplete if we have a valid _id
      if (_id) {
        tripsToComplete.push(_id);
        log.info(`Marking trip ${_id} for completion due to new journey`);
      } else {
        log.warn(`Skipping completion for trip with invalid _id`);
      }
      return;
    }

    // RULE 5: Vessel left dock
    if (hasLeftDock(prevTrip, currTrip)) {
      logUpdate(prevTrip, currTrip);
      const update = createLeftDockUpdate(prevTrip, currTrip);
      tripsToUpdate.push({ id: _id, data: update });
      return;
    }

    // RULE 6: Same Journey with Changes - always update if fields changed
    if (hasTripUpdate(prevTrip, currTrip)) {
      logUpdate(prevTrip, currTrip);
      const update = createTripUpdate(prevTrip, currTrip);
      tripsToUpdate.push({ id: _id, data: update });
    }
  });

  return { tripsToInsert, tripsToUpdate, tripsToComplete };
};

/**
 * Checks if the current timestamp is invalid (less than previous timestamp or creation time)
 */
const invalidTimestamp = (
  prevTrip: ConvexVesselTripWithIdAndCreationTime,
  currTrip: ConvexVesselTrip
): boolean =>
  currTrip.TimeStamp < prevTrip.TimeStamp ||
  currTrip.TimeStamp < prevTrip._creationTime;

/**
 * Determines if a new trip should be created (new departure terminal)
 */
const hasJourneyStarted = (
  prevTrip: ConvexVesselTrip,
  currTrip: ConvexVesselTrip
): boolean =>
  currTrip.AtDock === true &&
  prevTrip.DepartingTerminalID !== currTrip.DepartingTerminalID;

/**
 * Determines if vessel just left dock
 */
const hasLeftDock = (
  prevTrip: ConvexVesselTrip,
  currTrip: ConvexVesselTrip
): boolean => prevTrip.AtDock === true && currTrip.AtDock === false;

/**
 * Determines if vessel just arrived at dock
 */
const hasArrivedDock = (
  prevTrip: ConvexVesselTrip,
  currTrip: ConvexVesselTrip
): boolean => prevTrip.AtDock === false && currTrip.AtDock === true;

/**
 * Determines if a trip is complete and should be moved to completed table
 * A trip is complete if:
 * - Vessel has arrived at destination (has ArvDockActual)
 * - Has been at dock for more than 30 minutes
 * - Has a different departure terminal (new journey started)
 */
const isTripComplete = (
  prevTrip: ConvexVesselTrip,
  currTrip: ConvexVesselTrip
): boolean => {
  // If vessel has arrived at destination and been there for a while
  if (prevTrip.ArvDockActual && currTrip.AtDock) {
    const timeAtDock = currTrip.TimeStamp - prevTrip.ArvDockActual;
    const thirtyMinutes = 30 * 60 * 1000; // 30 minutes in milliseconds

    if (timeAtDock > thirtyMinutes) {
      return true;
    }
  }

  // If vessel has started a new journey (different departure terminal)
  if (prevTrip.DepartingTerminalID !== currTrip.DepartingTerminalID) {
    return true;
  }

  return false;
};

/**
 * Creates update data for left dock scenario
 */
const createLeftDockUpdate = (
  prevTrip: ConvexVesselTrip,
  currTrip: ConvexVesselTrip
): ConvexVesselTrip => {
  return {
    ...prevTrip,
    AtDock: currTrip.AtDock,
    LeftDockActual: currTrip.TimeStamp,
    TimeStamp: currTrip.TimeStamp,
  } as ConvexVesselTrip;
};

/**
 * Creates update data for arrival dock scenario
 */
const createArrivalDockUpdate = (
  prevTrip: ConvexVesselTrip,
  currTrip: ConvexVesselTrip
): ConvexVesselTrip => {
  // Ensure we don't include any Convex internal fields
  const { _id, _creationTime, ...cleanPrevTrip } = prevTrip as any;
  return {
    ...cleanPrevTrip,
    AtDock: currTrip.AtDock,
    ArvDockActual: currTrip.TimeStamp,
    TimeStamp: currTrip.TimeStamp,
  } as ConvexVesselTrip;
};

/**
 * Checks if there are any updates for the current trip in the relevant fields
 */
const hasTripUpdate = (
  prevTrip: ConvexVesselTrip,
  currTrip: ConvexVesselTrip
): boolean =>
  prevTrip.VesselID === currTrip.VesselID &&
  vesselTripWatchFields.some(
    (field) =>
      currTrip[field] !== undefined && prevTrip[field] !== currTrip[field]
  );

/**
 * Merges new trip data with existing data, preserving meaningful existing values
 */
const createTripUpdate = (
  prevTrip: ConvexVesselTrip,
  currTrip: ConvexVesselTrip
): ConvexVesselTrip => {
  return {
    ...prevTrip,
    ...currTrip,
  } as ConvexVesselTrip;
};

/**
 * Helper function to log vessel trip insertions with vessel name
 */
const logInsert = (currTrip: ConvexVesselTrip): void =>
  log.info(`🚢 [${currTrip.VesselName}] INSERT`);

/**
 * Helper function to log vessel trip updates with vessel name and delta of changes
 */
const logUpdate = (
  prevTrip: ConvexVesselTrip,
  currTrip: ConvexVesselTrip
): void => {
  const changedFields = vesselTripWatchFields.filter(
    (field) =>
      currTrip[field] !== undefined && prevTrip[field] !== currTrip[field]
  );

  if (changedFields.length > 0) {
    log.info(`🚢 [${currTrip.VesselName}] UPDATE: ${changedFields.join(", ")}`);
  }
};

import { WsfVessels } from "ws-dottie";

import { api } from "@/data/convex/_generated/api";
import type { Id } from "@/data/convex/_generated/dataModel";
import type { ActionCtx } from "@/data/convex/_generated/server";
import { internalAction } from "@/data/convex/_generated/server";
import {
  type ConvexVesselTrip,
  toConvexVesselTrip,
  toVesselTrip,
} from "@/data/types/VesselTrip";
import { log } from "@/shared/lib/logger";

const vesselTripWatchFields = [
  "VesselID",
  "VesselName",
  "DepartingTerminalID",
  "DepartingTerminalName",
  "DepartingTerminalAbbrev",
  "ArrivingTerminalID",
  "ArrivingTerminalName",
  "ArrivingTerminalAbbrev",
  // "Latitude",
  // "Longitude",
  "Speed",
  // "Heading",
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
  _id: Id<"vesselTrips">;
  _creationTime: number;
};

/**
 * Internal action for updating vessel trips by comparing with existing data
 *
 * BUSINESS LOGIC RULES:
 * 1. New Vessel: If no existing trip exists for a vessel, create a new trip record
 * 2. ArvDock Logic: If vessel just arrived at dock, update existing trip with arrival time
 * 3. New Journey: If DepartingTerminalID changes, create a new trip (new journey/leg)
 * 4. LeftDock Logic: If vessel just left dock, update existing trip with left dock time
 * 5. Same Journey Updates: If same departing terminal, update existing trip if fields changed
 * 6. No Changes: If no relevant fields changed, do nothing (preserve existing data)
 */
export const updateVesselTrips = internalAction({
  args: {},
  handler: async (
    ctx
  ): Promise<{
    success: boolean;
    inserted: number;
    updated: number;
    unchanged: number;
  }> => {
    try {
      const startTime = new Date();
      const convexTrips = await fetchVesselTrips();
      const prevTripsMap = await getprevTripsMap(ctx);

      const { tripsToInsert, tripsToUpdate } = processVesselTrips(
        convexTrips,
        prevTripsMap
      );

      await executeBatchOperations(ctx, tripsToInsert, tripsToUpdate);

      const endTime = new Date();
      const duration = endTime.getTime() - startTime.getTime();
      const inserted = tripsToInsert.length;
      const updated = tripsToUpdate.length;
      const unchanged = convexTrips.length - inserted - updated;

      log.info(
        `✅ Vessel Trips update completed at ${endTime.toISOString()} (duration: ${duration}ms) - Inserted: ${inserted}, Updated: ${updated}, Unchanged: ${unchanged}`
      );

      return { success: true, inserted, updated, unchanged };
    } catch (error) {
      log.error("Error in vessel trips update:", error);
      return { success: false, inserted: 0, updated: 0, unchanged: 0 };
    }
  },
});

/**
 * Fetches and transforms vessel data from WSF API
 */
const fetchVesselTrips = async (): Promise<ConvexVesselTrip[]> => {
  const rawVesselData = await WsfVessels.getVesselLocations();
  return rawVesselData.map(toVesselTrip).map(toConvexVesselTrip);
};

/**
 * Fetches existing trips and creates a Map for O(1) lookup
 */
const getprevTripsMap = async (
  ctx: ActionCtx
): Promise<Map<number, ConvexVesselTripWithIdAndCreationTime>> => {
  const prevTrips = await ctx.runQuery(
    api.functions.vesselTrips.queries.getMostRecentByVessel
  );
  return new Map(
    prevTrips.map((trip: ConvexVesselTripWithIdAndCreationTime) => [
      trip.VesselID,
      trip,
    ])
  );
};

/**
 * Processes vessel trips according to business rules
 */
const processVesselTrips = (
  convexTrips: ConvexVesselTrip[],
  prevTripsMap: Map<number, ConvexVesselTripWithIdAndCreationTime>
): {
  tripsToInsert: ConvexVesselTrip[];
  tripsToUpdate: Array<{ id: Id<"vesselTrips">; data: ConvexVesselTrip }>;
} => {
  const tripsToInsert: ConvexVesselTrip[] = [];
  const tripsToUpdate: Array<{
    id: Id<"vesselTrips">;
    data: ConvexVesselTrip;
  }> = [];

  convexTrips.forEach((currTrip) => {
    const prevTripFull = prevTripsMap.get(currTrip.VesselID);

    // RULE 1: New Vessel
    if (!prevTripFull) {
      tripsToInsert.push(currTrip);
      return;
    }

    // Remove Convex-internal fields
    const { _id, _creationTime, ...prevTrip } = prevTripFull;

    // RULE 2: Vessel arrived at dock
    if (hasArrivedDock(prevTrip, currTrip)) {
      const update = createArrivalDockUpdate(prevTrip, currTrip);
      log.info(
        `🚢 [${currTrip.VesselName}] Arrived at dock: ${JSON.stringify(update)}`
      );
      tripsToUpdate.push({ id: _id, data: update });
      return;
    }

    // RULE 3: New Journey
    if (hasJourneyStarted(prevTrip, currTrip)) {
      log.info(
        `🚢 [${currTrip.VesselName}] New journey: ${JSON.stringify(currTrip)}`
      );
      tripsToInsert.push(currTrip);
      return;
    }

    // RULE 4: Vessel left dock
    if (hasLeftDock(prevTrip, currTrip)) {
      const update = createLeftDockUpdate(prevTrip, currTrip);
      log.info(
        `🚢 [${currTrip.VesselName}] Left dock: ${JSON.stringify(update)}`
      );
      tripsToUpdate.push({ id: _id, data: update });
      return;
    }

    // RULE 5: Same Journey with Changes
    if (hasRelevantChanges(prevTrip, currTrip)) {
      const update = createRelevantChangesUpdate(prevTrip, currTrip);
      tripsToUpdate.push({ id: _id, data: update });
    }
  });

  return { tripsToInsert, tripsToUpdate };
};

/**
 * Determines if a new trip should be created (new departure terminal)
 */
const hasJourneyStarted = (
  prevTrip: ConvexVesselTrip,
  currTrip: ConvexVesselTrip
): boolean => prevTrip.DepartingTerminalID !== currTrip.DepartingTerminalID;

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
 * Creates update data for left dock scenario
 */
const createLeftDockUpdate = (
  prevTrip: ConvexVesselTrip,
  currTrip: ConvexVesselTrip
): ConvexVesselTrip =>
  ({
    ...prevTrip,
    Latitude: currTrip.Latitude,
    Longitude: currTrip.Longitude,
    Speed: currTrip.Speed,
    Heading: currTrip.Heading,
    AtDock: currTrip.AtDock,
    LeftDockActual: currTrip.TimeStamp,
    TimeStamp: currTrip.TimeStamp,
  }) as ConvexVesselTrip;

/**
 * Creates update data for arrival dock scenario
 */
const createArrivalDockUpdate = (
  prevTrip: ConvexVesselTrip,
  currTrip: ConvexVesselTrip
): ConvexVesselTrip =>
  ({
    ...prevTrip,
    Latitude: currTrip.Latitude,
    Longitude: currTrip.Longitude,
    Speed: currTrip.Speed,
    Heading: currTrip.Heading,
    AtDock: currTrip.AtDock,
    ArvDockActual: currTrip.TimeStamp,
    TimeStamp: currTrip.TimeStamp,
  }) as ConvexVesselTrip;

/**
 * Merges new trip data with existing data, preserving meaningful existing values
 */
const createRelevantChangesUpdate = (
  prevTrip: ConvexVesselTrip,
  currTrip: ConvexVesselTrip
): ConvexVesselTrip => ({
  ...prevTrip,
  ...currTrip,
  // LeftDock: currTrip.LeftDock ?? prevTrip.LeftDock,
  // LeftDockActual: currTrip.LeftDockActual ?? prevTrip.LeftDockActual,
  // ArvDockActual: currTrip.ArvDockActual ?? prevTrip.ArvDockActual,
});

/**
 * Checks if there are any relevant changes between trips
 */
const hasRelevantChanges = (
  prevTrip: ConvexVesselTrip,
  currTrip: ConvexVesselTrip
): boolean =>
  vesselTripWatchFields.some(
    (field) =>
      currTrip[field] !== undefined && prevTrip[field] !== currTrip[field]
  );

/**
 * Executes batch operations for optimal performance
 */
const executeBatchOperations = async (
  ctx: ActionCtx,
  tripsToInsert: ConvexVesselTrip[],
  tripsToUpdate: Array<{ id: Id<"vesselTrips">; data: ConvexVesselTrip }>
): Promise<void> => {
  if (tripsToInsert.length > 0) {
    await ctx.runMutation(api.functions.vesselTrips.mutations.bulkInsert, {
      trips: tripsToInsert,
    });
  }

  if (tripsToUpdate.length > 0) {
    const updateData = tripsToUpdate.map((update) => ({
      id: update.id,
      ...update.data,
    }));
    await ctx.runMutation(api.functions.vesselTrips.mutations.bulkUpdate, {
      updates: updateData,
    });
  }
};

/**
 * Helper function to log vessel trip insertions with vessel name
 */
const logInsert = (currTrip: ConvexVesselTrip): void =>
  log.info(`🚢 [${currTrip.VesselName}] INSERT: ${JSON.stringify(currTrip)}`);

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

  changedFields.forEach((field) => {
    log.info(
      `🚢 [${currTrip.VesselName}] ${field}: ${prevTrip[field]} -> ${currTrip[field]}`
    );
  });
};

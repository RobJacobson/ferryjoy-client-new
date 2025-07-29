import { WsfVessels } from "ws-dottie";

import { api } from "@/data/convex/_generated/api";
import type { Id } from "@/data/convex/_generated/dataModel";
import { internalAction } from "@/data/convex/_generated/server";
import {
  type ConvexVesselTrip,
  toConvexVesselTrip,
  toVesselTrip,
} from "@/data/types/VesselTrip";
import { log } from "@/shared/lib/logger";

/**
 * Internal action for updating vessel trips by comparing with existing data
 *
 * BUSINESS LOGIC RULES:
 * 1. New Vessel: If no existing trip exists for a vessel, create a new trip record
 * 2. New Journey: If DepartingTerminalID changes, create a new trip (new journey/leg)
 * 3. Same Journey Updates: If same departing terminal, update existing trip if fields changed
 * 4. ArvDock Logic: Update ArvDock timestamp only when vessel transitions from undocked to docked
 * 5. No Changes: If no relevant fields changed, do nothing (preserve existing data)
 *
 * ASSUMPTIONS:
 * - VesselID is the unique identifier for vessels
 * - getMostRecentByVessel returns the latest trip for each vessel
 * - TimeStamp and LastUpdated are excluded from change detection
 * - ArvDock should be preserved unless vessel just docked
 * - All trips from WSF API are current and should be processed
 *
 * PERFORMANCE OPTIMIZATIONS:
 * - Batches all inserts into single transaction
 * - Batches all updates into single transaction
 * - Uses Map for O(1) lookup of existing trips
 * - Early returns to avoid unnecessary processing
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
      const rawVesselData = await WsfVessels.getVesselLocations();
      const convexTrips = rawVesselData
        .map(toVesselTrip)
        .map(toConvexVesselTrip) as ConvexVesselTrip[];
      const existingTrips = await ctx.runQuery(
        api.functions.vesselTrips.queries.getMostRecentByVessel
      );
      const existingTripsMap = new Map(
        existingTrips.map((trip) => [trip.VesselID, trip])
      );

      let inserted = 0;
      let updated = 0;
      let unchanged = 0;
      const tripsToInsert: ConvexVesselTrip[] = [];
      const updatesToPerform: Array<{
        id: Id<"vesselTrips">;
        data: ConvexVesselTrip;
      }> = [];

      for (const newTrip of convexTrips) {
        const existingTrip = existingTripsMap.get(newTrip.VesselID);

        // RULE 1: New Vessel - No existing trip found
        if (!existingTrip) {
          tripsToInsert.push({ ...newTrip, LastUpdated: Date.now() });
          inserted++;
          continue;
        }

        // RULE 2: New Journey - Departing terminal changed
        if (existingTrip.DepartingTerminalID !== newTrip.DepartingTerminalID) {
          tripsToInsert.push({ ...newTrip, LastUpdated: Date.now() });
          inserted++;
          continue;
        }

        // RULE 3: Same Journey - Check for relevant changes
        const hasChanges = compareVesselTrips(existingTrip, newTrip);
        if (!hasChanges) {
          unchanged++;
          continue;
        }

        // RULE 4: Same Journey with Changes - Update existing trip
        const updateData = prepareTripUpdate(existingTrip, newTrip);
        updatesToPerform.push({ id: existingTrip._id, data: updateData });
        updated++;
      }

      // STEP 7: Execute batch operations for optimal performance
      if (tripsToInsert.length > 0) {
        await ctx.runMutation(api.functions.vesselTrips.mutations.bulkInsert, {
          trips: tripsToInsert,
        });
      }
      if (updatesToPerform.length > 0) {
        const updateData = updatesToPerform.map((update) => ({
          id: update.id,
          ...update.data,
        }));
        await ctx.runMutation(api.functions.vesselTrips.mutations.bulkUpdate, {
          updates: updateData,
        });
      }

      const endTime = new Date();
      const duration = endTime.getTime() - startTime.getTime();
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
 * Helper function to prepare trip update data with ArvDock logic
 *
 * BUSINESS RULE: ArvDock should only be updated when vessel transitions from undocked to docked
 * - If vessel was not docked (AtDock: false) and is now docked (AtDock: true) → Set ArvDock to current timestamp
 * - In all other cases → Preserve existing ArvDock value (whether undefined or non-undefined)
 *
 * This ensures we track when vessels actually arrive at dock while preserving
 * historical docking information for vessels that undock and redock.
 */
function prepareTripUpdate(
  existingTrip: ConvexVesselTrip & { _id: string },
  newTrip: ConvexVesselTrip
): ConvexVesselTrip {
  // Handle ArvDock logic: update when transitioning from not docked to docked
  let arvDockValue: number | undefined = newTrip.ArvDock;

  if (existingTrip.AtDock === false && newTrip.AtDock === true) {
    // Vessel just docked, set ArvDock to current timestamp
    arvDockValue = Date.now();
  } else {
    // Preserve existing ArvDock value in all other cases
    arvDockValue = existingTrip.ArvDock;
  }

  const updateData = {
    ...newTrip,
    ArvDock: arvDockValue,
    LastUpdated: Date.now(),
  };

  // Validate and clean undefined values
  return updateData;
}

/**
 * Helper function to compare two vessel trips, excluding TimeStamp and LastUpdated
 *
 * BUSINESS RULE: Only business-relevant fields should trigger updates
 * - TimeStamp: Excluded (changes with every API call, not business-relevant)
 * - LastUpdated: Excluded (internal tracking field, not business-relevant)
 * - All other fields: Included in comparison
 *
 * Returns true if any business field has changed (excluding TimeStamp and LastUpdated)
 */
function compareVesselTrips(
  existing: ConvexVesselTrip & { _id: string },
  newTrip: ConvexVesselTrip
): boolean {
  const fieldsToCompare: (keyof ConvexVesselTrip)[] = [
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
    "Eta",
    "ScheduledDeparture",
    "ArvDock",
    "OpRouteAbbrev",
    "VesselPositionNum",
  ];

  for (const field of fieldsToCompare) {
    const existingValue = existing[field];
    const newValue = newTrip[field];

    // Regular field comparison (OpRouteAbbrev is now a string, not an array)
    if (existingValue !== newValue) return true;
  }

  return false;
}

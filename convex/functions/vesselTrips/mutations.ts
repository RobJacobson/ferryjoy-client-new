import type { Doc, Id } from "@convex/_generated/dataModel";
import { mutation } from "@convex/_generated/server";
import { v } from "convex/values";

import { log } from "@/shared/lib/logger";

import { vesselTripValidationSchema } from "./schemas";

/**
 * Bulk insert and update for active vessel trips
 * Used by the vessel trips action for real-time updates
 */
export const bulkInsertAndUpdateActive = mutation({
  args: {
    tripsToInsert: v.array(vesselTripValidationSchema),
    tripsToUpdate: v.array(
      v.object({
        id: v.id("activeVesselTrips"),
        VesselID: v.number(),
        VesselName: v.string(),
        DepartingTerminalID: v.number(),
        DepartingTerminalName: v.string(),
        DepartingTerminalAbbrev: v.string(),
        ArrivingTerminalID: v.optional(v.number()),
        ArrivingTerminalName: v.optional(v.string()),
        ArrivingTerminalAbbrev: v.optional(v.string()),
        InService: v.boolean(),
        AtDock: v.boolean(),
        LeftDock: v.optional(v.number()),
        LeftDockActual: v.optional(v.number()),
        Eta: v.optional(v.number()),
        ScheduledDeparture: v.optional(v.number()),
        ArvDockActual: v.optional(v.number()),
        OpRouteAbbrev: v.optional(v.string()),
        VesselPositionNum: v.optional(v.number()),
        TimeStamp: v.number(),
      })
    ),
  },
  handler: async (ctx, args) => {
    // Handle inserts first
    const insertIds = [];
    for (const trip of args.tripsToInsert) {
      const id = await ctx.db.insert("activeVesselTrips", trip);
      insertIds.push(id);
    }

    // Handle updates
    for (const update of args.tripsToUpdate) {
      const { id, ...data } = update;
      // Remove any Convex internal fields that might be present
      const { _id, _creationTime, ...cleanData } =
        data as Doc<"activeVesselTrips">;
      // cleanData is now of type WithoutSystemFields<Doc<"activeVesselTrips">>

      // Check if the document still exists before patching
      const existingDoc = await ctx.db.get(id);
      if (!existingDoc) {
        // Document was deleted, skip this update
        log.warn(`Document ${id} was deleted, skipping update`);
        continue;
      }

      try {
        await ctx.db.patch(id, cleanData);
      } catch (error) {
        log.error(`Failed to patch document ${id}:`, error);
        throw error;
      }
    }

    return { insertIds };
  },
});

/**
 * Bulk move multiple completed trips to completed table
 * Used for batch cleanup operations
 */
export const bulkMoveToHistorical = mutation({
  args: {
    tripIds: v.array(v.id("activeVesselTrips")),
  },
  handler: async (ctx, args: { tripIds: Id<"activeVesselTrips">[] }) => {
    const movedIds = [];
    const errors = [];

    for (const tripId of args.tripIds) {
      try {
        const trip = await ctx.db.get(tripId);
        if (trip) {
          // Verify the document ID matches before proceeding
          if (trip._id !== tripId) {
            const errorMsg = `Error moving ${tripId}: Error: Provided document ID "${trip._id}" doesn't match '_id' field "${tripId}"`;
            log.error(errorMsg);
            continue;
          }

          // Remove Convex internal fields before inserting to completed table
          const { _id, _creationTime, ...tripData } = trip;

          const completedId = await ctx.db.insert(
            "completedVesselTrips",
            tripData
          );
          await ctx.db.delete(tripId);
          movedIds.push(completedId);
        } else {
          log.warn(`Trip ${tripId} not found, skipping move to historical`);
          errors.push(`Trip ${tripId} not found`);
        }
      } catch (error) {
        log.error(`Failed to move trip ${tripId} to historical:`, error);
        errors.push(`Error moving ${tripId}: ${error}`);
        // Continue processing other trips instead of throwing
      }
    }

    if (errors.length > 0) {
      log.warn(`Completed bulk move with ${errors.length} errors:`, errors);
    }

    return { movedIds, errors };
  },
});

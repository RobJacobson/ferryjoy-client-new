import { v } from "convex/values";

import { api } from "@/data/convex/_generated/api";
import type { Id } from "@/data/convex/_generated/dataModel";
import { internalMutation, mutation } from "@/data/convex/_generated/server";
import type { ConvexVesselTrip } from "@/data/types/convex/VesselTrip";
import { vesselTripValidationSchema } from "@/data/types/convex/VesselTrip";

/**
 * Bulk insert and update for active vessel trips
 * Used by the vessel trips action for real-time updates
 */
export const bulkInsertAndUpdateActive = mutation({
  args: {
    tripsToInsert: v.array(v.object(vesselTripValidationSchema)),
    tripsToUpdate: v.array(
      v.object({
        id: v.id("activeVesselTrips"),
        ...vesselTripValidationSchema,
      })
    ),
  },
  handler: async (
    ctx,
    args: {
      tripsToInsert: ConvexVesselTrip[];
      tripsToUpdate: Array<{ id: Id<"activeVesselTrips"> } & ConvexVesselTrip>;
    }
  ) => {
    // Handle inserts first
    const insertIds = [];
    for (const trip of args.tripsToInsert) {
      const id = await ctx.db.insert("activeVesselTrips", trip);
      insertIds.push(id);
    }

    // Handle updates
    for (const update of args.tripsToUpdate) {
      const { id, ...data } = update;
      await ctx.db.patch(id, data);
    }

    return { insertIds };
  },
});

/**
 * Move a completed trip from active to historical table
 * Called when a trip is determined to be complete
 */
export const moveTripToHistorical = mutation({
  args: {
    tripId: v.id("activeVesselTrips"),
  },
  handler: async (ctx, args: { tripId: Id<"activeVesselTrips"> }) => {
    // Get the trip data
    const trip = await ctx.db.get(args.tripId);
    if (!trip) {
      throw new Error(`Trip ${args.tripId} not found`);
    }

    // Insert into historical table
    const historicalId = await ctx.db.insert("historicalVesselTrips", trip);

    // Delete from active table
    await ctx.db.delete(args.tripId);

    return { historicalId };
  },
});

/**
 * Bulk move multiple completed trips to historical table
 * Used for batch cleanup operations
 */
export const bulkMoveToHistorical = mutation({
  args: {
    tripIds: v.array(v.id("activeVesselTrips")),
  },
  handler: async (ctx, args: { tripIds: Id<"activeVesselTrips">[] }) => {
    const movedIds = [];

    for (const tripId of args.tripIds) {
      const trip = await ctx.db.get(tripId);
      if (trip) {
        const historicalId = await ctx.db.insert("historicalVesselTrips", trip);
        await ctx.db.delete(tripId);
        movedIds.push(historicalId);
      }
    }

    return { movedIds };
  },
});

// Legacy function removed - use bulkInsertAndUpdateActive directly

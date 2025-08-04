import { v } from "convex/values";

import { internalMutation, mutation } from "@/data/convex/_generated/server";

import { vesselTripArgs } from "./types";

/**
 * Bulk insert and update for active vessel trips
 * Used by the vessel trips action for real-time updates
 */
export const bulkInsertAndUpdateActive = mutation({
  args: {
    tripsToInsert: v.array(v.object(vesselTripArgs)),
    tripsToUpdate: v.array(
      v.object({
        id: v.id("activeVesselTrips"),
        ...vesselTripArgs,
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
  handler: async (ctx, { tripId }) => {
    // Get the trip data
    const trip = await ctx.db.get(tripId);
    if (!trip) {
      throw new Error(`Trip ${tripId} not found`);
    }

    // Insert into historical table
    const historicalId = await ctx.db.insert("historicalVesselTrips", trip);

    // Delete from active table
    await ctx.db.delete(tripId);

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
  handler: async (ctx, { tripIds }) => {
    const movedIds = [];

    for (const tripId of tripIds) {
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

/**
 * Legacy function for backward compatibility
 * Routes to the appropriate table based on trip status
 */
export const bulkInsertAndUpdate = mutation({
  args: {
    tripsToInsert: v.array(v.object(vesselTripArgs)),
    tripsToUpdate: v.array(
      v.object({
        id: v.id("activeVesselTrips"), // Updated table reference
        ...vesselTripArgs,
      })
    ),
  },
  handler: async (ctx, args) => {
    // Route to active trips table
    return await ctx.runMutation("vesselTrips:bulkInsertAndUpdateActive", {
      tripsToInsert: args.tripsToInsert,
      tripsToUpdate: args.tripsToUpdate,
    });
  },
});

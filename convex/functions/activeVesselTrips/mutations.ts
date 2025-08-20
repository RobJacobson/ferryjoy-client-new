import { mutation } from "@convex/_generated/server";
import { v } from "convex/values";

import { activeVesselTripValidationSchema } from "./schemas";

/**
 * Insert a single active vessel trip
 */
export const insert = mutation({
  args: activeVesselTripValidationSchema,
  handler: async (ctx, args) => {
    await ctx.db.insert("activeVesselTrips", args);
  },
});

/**
 * Insert multiple active vessel trips in a single transaction
 */
export const insertMultiple = mutation({
  args: {
    trips: v.array(activeVesselTripValidationSchema),
  },
  handler: async (ctx, args) => {
    await Promise.all(
      args.trips.map((trip) => ctx.db.insert("activeVesselTrips", trip))
    );
  },
});

/**
 * Delete an active vessel trip by vessel ID
 */
export const deleteByVesselId = mutation({
  args: { vesselId: v.number() },
  handler: async (ctx, args) => {
    // Find and delete the active trip for this vessel
    const trips = await ctx.db
      .query("activeVesselTrips")
      .filter((q) => q.eq(q.field("VesselID"), args.vesselId))
      .collect();

    for (const trip of trips) {
      await ctx.db.delete(trip._id);
    }
  },
});

/**
 * Delete multiple active vessel trips by vessel IDs in a single transaction
 */
export const deleteByVesselIds = mutation({
  args: { vesselIds: v.array(v.number()) },
  handler: async (ctx, args) => {
    await Promise.all(
      args.vesselIds.map(async (vesselId) => {
        const trips = await ctx.db
          .query("activeVesselTrips")
          .filter((q) => q.eq(q.field("VesselID"), vesselId))
          .collect();

        await Promise.all(trips.map((trip) => ctx.db.delete(trip._id)));
      })
    );
  },
});

/**
 * Update an existing active vessel trip
 */
export const update = mutation({
  args: {
    id: v.id("activeVesselTrips"),
    trip: activeVesselTripValidationSchema,
  },
  handler: async (ctx, args) => {
    await ctx.db.replace(args.id, args.trip);
  },
});

/**
 * Update multiple active vessel trips in a single transaction
 */
export const updateMultiple = mutation({
  args: {
    updates: v.array(
      v.object({
        id: v.id("activeVesselTrips"),
        trip: activeVesselTripValidationSchema,
      })
    ),
  },
  handler: async (ctx, args) => {
    await Promise.all(
      args.updates.map(({ id, trip }) => ctx.db.replace(id, trip))
    );
  },
});

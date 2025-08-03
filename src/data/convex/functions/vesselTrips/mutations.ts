import { v } from "convex/values";

import { internalMutation, mutation } from "@/data/convex/_generated/server";

import { vesselTripArgs } from "./types";

export const bulkInsertAndUpdate = mutation({
  args: {
    tripsToInsert: v.array(v.object(vesselTripArgs)),
    tripsToUpdate: v.array(
      v.object({
        id: v.id("vesselTrips"),
        ...vesselTripArgs,
      })
    ),
  },
  handler: async (ctx, args) => {
    // Handle inserts first
    const insertIds = [];
    for (const trip of args.tripsToInsert) {
      const id = await ctx.db.insert("vesselTrips", trip);
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

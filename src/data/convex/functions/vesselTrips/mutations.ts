import { v } from "convex/values";

import { internalMutation, mutation } from "@/data/convex/_generated/server";

import { vesselTripArgs } from "./types";

export const insert = mutation({
  args: vesselTripArgs,
  handler: async (ctx, args) => {
    return await ctx.db.insert("vesselTrips", args);
  },
});

export const bulkInsert = mutation({
  args: {
    trips: v.array(v.object(vesselTripArgs)),
  },
  handler: async (ctx, args) => {
    const ids = [];
    for (const trip of args.trips) {
      const id = await ctx.db.insert("vesselTrips", trip);
      ids.push(id);
    }
    return ids;
  },
});

export const update = mutation({
  args: {
    id: v.id("vesselTrips"),
    ...vesselTripArgs,
  },
  handler: async (ctx, args) => {
    const { id, ...data } = args;
    return await ctx.db.patch(id, data);
  },
});

export const bulkUpdate = mutation({
  args: {
    updates: v.array(
      v.object({
        id: v.id("vesselTrips"),
        ...vesselTripArgs,
      })
    ),
  },
  handler: async (ctx, args) => {
    for (const update of args.updates) {
      const { id, ...data } = update;
      await ctx.db.patch(id, data);
    }
  },
});

export const remove = mutation({
  args: { id: v.id("vesselTrips") },
  handler: async (ctx, args) => {
    return await ctx.db.delete(args.id);
  },
});

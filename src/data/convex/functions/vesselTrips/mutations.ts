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
        VesselID: v.number(),
        VesselName: v.string(),
        DepartingTerminalID: v.number(),
        DepartingTerminalName: v.string(),
        DepartingTerminalAbbrev: v.string(),
        ArrivingTerminalID: v.optional(v.union(v.number(), v.null())),
        ArrivingTerminalName: v.optional(v.union(v.string(), v.null())),
        ArrivingTerminalAbbrev: v.optional(v.union(v.string(), v.null())),
        InService: v.boolean(),
        AtDock: v.boolean(),
        LeftDock: v.optional(v.union(v.string(), v.null())),
        Eta: v.optional(v.union(v.string(), v.null())),
        ScheduledDeparture: v.optional(v.union(v.string(), v.null())),
        ArvDock: v.optional(v.union(v.number(), v.null())),
        OpRouteAbbrev: v.optional(v.union(v.string(), v.null())),
        VesselPositionNum: v.optional(v.union(v.number(), v.null())),
        TimeStamp: v.number(),
        LastUpdated: v.number(),
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

/**
 * Internal mutation for storing vessel trips in database
 * This is called by the action after fetching data
 */
export const storeVesselTrips = internalMutation({
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

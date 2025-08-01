import { v } from "convex/values";

import { internalMutation, mutation } from "@/data/convex/_generated/server";

import { vesselPingArgs } from "./types";

// export const insert = mutation({
//   args: vesselPingArgs,
//   handler: async (ctx, args) => {
//     return await ctx.db.insert("vesselPings", args);
//   },
// });

export const bulkInsert = mutation({
  args: {
    locations: v.array(v.object(vesselPingArgs)),
  },
  handler: async (ctx, args) => {
    const ids = [];
    for (const location of args.locations) {
      const id = await ctx.db.insert("vesselPings", location);
      ids.push(id);
    }
    return ids;
  },
});

// export const update = mutation({
//   args: {
//     id: v.id("vesselPings"),
//     ...vesselPingArgs,
//   },
//   handler: async (ctx, args) => {
//     const { id, ...data } = args;
//     return await ctx.db.patch(id, data);
//   },
// });

export const remove = mutation({
  args: { id: v.id("vesselPings") },
  handler: async (ctx, args) => {
    return await ctx.db.delete(args.id);
  },
});

/**
 * Internal mutation for storing vessel locations in database
 * This is called by the action after fetching data
 */
export const storeVesselLocations = internalMutation({
  args: {
    locations: v.array(v.object(vesselPingArgs)),
  },
  handler: async (ctx, args) => {
    const ids = [];
    for (const location of args.locations) {
      const id = await ctx.db.insert("vesselPings", location);
      ids.push(id);
    }
    return ids;
  },
});

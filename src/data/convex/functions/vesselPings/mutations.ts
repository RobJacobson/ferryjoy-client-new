import { v } from "convex/values";

import { internalMutation, mutation } from "@/data/convex/_generated/server";

import { vesselPingArgs } from "./types";

/**
 * Bulk insert multiple vessel ping records
 * Used by actions to store vessel location data
 */
export const bulkInsert = mutation({
  args: {
    locations: v.array(v.object(vesselPingArgs)),
  },
  handler: async (ctx, args) => {
    for (const location of args.locations) {
      await ctx.db.insert("vesselPings", location);
    }
  },
});

/**
 * Bulk delete multiple vessel ping records
 * Used for cleanup operations to remove old records
 */
export const bulkDelete = mutation({
  args: {
    ids: v.array(v.id("vesselPings")),
  },
  handler: async (ctx, args) => {
    for (const id of args.ids) {
      await ctx.db.delete(id);
    }
    return { deletedCount: args.ids.length };
  },
});

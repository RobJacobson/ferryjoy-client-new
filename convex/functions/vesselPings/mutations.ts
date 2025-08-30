import type { Id } from "@convex/_generated/dataModel";
import { internalMutation, mutation } from "@convex/_generated/server";
import { v } from "convex/values";

import type { ConvexVesselPing } from "./schemas";
import { vesselPingValidationSchema } from "./schemas";

/**
 * Bulk insert multiple vessel ping records
 * Used by actions to store vessel location data
 */
export const bulkInsert = mutation({
  args: {
    locations: v.array(vesselPingValidationSchema),
  },
  handler: async (ctx, args: { locations: ConvexVesselPing[] }) => {
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
  handler: async (ctx, args: { ids: Id<"vesselPings">[] }) => {
    for (const id of args.ids) {
      await ctx.db.delete(id);
    }
    return { deletedCount: args.ids.length };
  },
});

/**
 * Internal mutation for cleaning up old vessel ping records
 * Consolidates querying and deletion into a single transaction
 * Used by the cleanup cron job for better performance and data consistency
 */
export const cleanupOldPingsMutation = internalMutation({
  args: {},
  handler: async (ctx) => {
    const CONFIG = { CLEANUP_HOURS: 24 }; // 24 hours
    const cutoffTime = Date.now() - CONFIG.CLEANUP_HOURS * 60 * 60 * 1000;

    // Query and delete in a single transaction
    const oldPings = await ctx.db
      .query("vesselPings")
      .filter((q) => q.lt(q.field("TimeStamp"), cutoffTime))
      .collect();

    // Delete in batches if needed
    for (const ping of oldPings) {
      await ctx.db.delete(ping._id);
    }

    return oldPings.length;
  },
});

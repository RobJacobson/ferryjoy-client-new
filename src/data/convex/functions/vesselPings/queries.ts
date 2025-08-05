import { v } from "convex/values";

import type { Doc } from "@/data/convex/_generated/dataModel";
import { query } from "@/data/convex/_generated/server";

/**
 * Get all VesselPings from the past 20 minutes
 * Returns all pings for grouping by vessel on the client
 * Sorted by timestamp in descending order (most recent first)
 */
export const getRecentPings = query({
  args: {
    minutesAgo: v.optional(v.number()),
  },
  handler: async (ctx, { minutesAgo = 20 }) => {
    const cutoffTime = Date.now() - minutesAgo * 60 * 1000;

    return await ctx.db
      .query("vesselPings")
      .withIndex("by_timestamp", (q) => q.gte("TimeStamp", cutoffTime))
      .order("desc") // Sort by timestamp in descending order (most recent first)
      .take(1000); // Limit to prevent excessive data transfer
  },
});

/**
 * Get VesselPings older than the specified timestamp
 * Used for cleanup operations to delete old records
 */
export const getOlderThan = query({
  args: {
    cutoffTime: v.number(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { cutoffTime, limit = 1000 }) => {
    return await ctx.db
      .query("vesselPings")
      .withIndex("by_timestamp", (q) => q.lt("TimeStamp", cutoffTime))
      .order("asc") // Get oldest first for deletion
      .take(limit);
  },
});

/**
 * Get the most recent VesselPing for all vessels
 * Uses vessel IDs for efficient per-vessel lookup with compound index
 */
export const getLatestPingsByVesselIDs = query({
  args: {
    vesselIds: v.array(v.number()),
  },
  handler: async (ctx, args) => {
    const mostRecentPings = await Promise.all(
      args.vesselIds.map(
        async (vesselId) =>
          await ctx.db
            .query("vesselPings")
            .withIndex("by_vessel_id_and_timestamp", (q) =>
              q.eq("VesselID", vesselId)
            )
            .order("desc")
            .first()
      )
    );

    return mostRecentPings.filter((ping) => ping !== null);
  },
});

import { v } from "convex/values";

import { query } from "@/data/convex/_generated/server";

/**
 * Get VesselPings for a specific vessel within a time range
 */
export const getByVesselIdAndTimeRange = query({
  args: {
    vesselId: v.number(),
    startTime: v.number(),
    endTime: v.optional(v.number()),
  },
  handler: async (ctx, { vesselId, startTime, endTime }) => {
    let q = ctx.db
      .query("vesselPings")
      .withIndex("by_vessel_id_and_timestamp", (q) =>
        q.eq("VesselID", vesselId).gte("TimeStamp", startTime)
      );

    if (endTime !== undefined) {
      q = q.filter((q) => q.lte(q.field("TimeStamp"), endTime));
    }

    return await q.collect();
  },
});

/**
 * Get all VesselPings (for debugging)
 */
export const getAll = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("vesselPings").collect();
  },
});

/**
 * Get VesselPings for multiple vessels with their respective time ranges
 */
export const getByVesselsAndTimeRanges = query({
  args: {
    vesselRanges: v.array(
      v.object({
        vesselId: v.number(),
        startTime: v.number(),
        endTime: v.optional(v.number()),
      })
    ),
  },
  handler: async (ctx, { vesselRanges }) => {
    const results = await Promise.all(
      vesselRanges.map(async ({ vesselId, startTime, endTime }) => {
        let q = ctx.db
          .query("vesselPings")
          .withIndex("by_vessel_id_and_timestamp", (q) =>
            q.eq("VesselID", vesselId).gte("TimeStamp", startTime)
          );

        if (endTime !== undefined) {
          q = q.filter((q) => q.lte(q.field("TimeStamp"), endTime));
        }

        const pings = await q.collect();
        return { vesselId, pings };
      })
    );

    return results;
  },
});
/**
 * Get all VesselPings from the past 20 minutes
 * Returns all pings for grouping by vessel on the client
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
      .order("desc") // Get most recent first
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
 * Get the most recent VesselPing for specific vessels
 * Used for smart filtering to compare against current positions
 */
export const getMostRecentByVesselIds = query({
  args: {
    vesselIds: v.array(v.number()),
  },
  handler: async (ctx, args) => {
    // Parallel queries using compound index for optimal performance
    const mostRecentPings = await Promise.all(
      args.vesselIds.map((vesselId) =>
        ctx.db
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

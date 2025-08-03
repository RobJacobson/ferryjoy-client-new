import { v } from "convex/values";

import { query } from "@/data/convex/_generated/server";

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
 * Get the most recent VesselPing for all vessels
 * Used for smart filtering to compare against current positions
 */
export const getMostRecentPingsForAllVessels = query({
  args: {},
  handler: async (ctx) => {
    // Get all unique vessel IDs first
    const allPings = await ctx.db
      .query("vesselPings")
      .order("desc")
      .take(10000); // Reasonable limit to get recent pings

    // Group by vessel ID and get the most recent for each
    const vesselPingsMap = new Map<number, any>();

    for (const ping of allPings) {
      if (!vesselPingsMap.has(ping.VesselID)) {
        vesselPingsMap.set(ping.VesselID, ping);
      }
    }

    return Array.from(vesselPingsMap.values());
  },
});

import { v } from "convex/values";

import type { Doc } from "@/data/convex/_generated/dataModel";
import { query } from "@/data/convex/_generated/server";

/**
 * Get ALL VesselPings from the past N minutes for vessel tracking and lines
 * Returns all pings within the time window, sorted by timestamp (oldest first)
 * Used for creating vessel trajectory lines with historical ping data
 */
export const getRecentPings = query({
  args: {
    minutesAgo: v.optional(v.number()),
  },
  handler: async (ctx, { minutesAgo = 20 }) => {
    const cutoffTime = Date.now() - minutesAgo * 60 * 1000;

    // Get all pings within the time window, sorted by timestamp (oldest first)
    // This uses the by_timestamp index for efficient time-based filtering
    return await ctx.db
      .query("vesselPings")
      .withIndex("by_timestamp", (q) => q.gte("TimeStamp", cutoffTime))
      .order("asc") // Oldest first for chronological vessel lines
      .collect();
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
 * Get VesselPings strictly newer than the provided timestamp
 * Used for incremental fetches after initial hydration
 */
export const getPingsSince = query({
  args: {
    sinceMs: v.number(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { sinceMs, limit = 1000 }) => {
    return await ctx.db
      .query("vesselPings")
      .withIndex("by_timestamp", (q) => q.gt("TimeStamp", sinceMs))
      .order("asc")
      .take(limit);
  },
});

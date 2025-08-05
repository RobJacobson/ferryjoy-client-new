import { v } from "convex/values";

import { query } from "@/data/convex/_generated/server";

/**
 * API function for fetching active vessel trips (currently in progress)
 * Small dataset, frequently updated, perfect for real-time subscriptions
 */
export const getActiveTrips = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("activeVesselTrips").order("desc").collect(); // No limit needed - active trips are few
  },
});

/**
 * API function for fetching completed vessel trips from 3:00 AM today through now,
 * or 3:00 AM yesterday if current time is between midnight and 3:00 AM
 * Large dataset, static, optimized for infrequent queries
 */
export const getCompletedTripsSince3AM = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { limit = 200 }) => {
    const now = new Date();
    const currentHour = now.getHours();

    // If it's between midnight and 3:00 AM, use yesterday's 3:00 AM
    // Otherwise, use today's 3:00 AM
    const startTime = new Date();
    if (currentHour < 3) {
      // Use yesterday's 3:00 AM
      startTime.setDate(startTime.getDate() - 1);
    }
    startTime.setHours(3, 0, 0, 0); // Set to 3:00:00.000 AM

    const startTimestamp = startTime.getTime();

    return await ctx.db
      .query("completedVesselTrips")
      .withIndex("by_timestamp", (q) => q.gte("TimeStamp", startTimestamp))
      .order("desc") // Most recent first
      .take(limit); // Prevent unbounded results
  },
});

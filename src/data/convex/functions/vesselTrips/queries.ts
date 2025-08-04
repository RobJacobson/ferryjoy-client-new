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
 * API function for fetching historical vessel trips from 3:00 AM today through now,
 * or 3:00 AM yesterday if current time is between midnight and 3:00 AM
 * Large dataset, static, optimized for infrequent queries
 */
export const getHistoricalTripsSince3AM = query({
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
      .query("historicalVesselTrips")
      .withIndex("by_timestamp", (q) => q.gte("TimeStamp", startTimestamp))
      .order("desc") // Most recent first
      .take(limit); // Prevent unbounded results
  },
});

/**
 * API function for fetching combined active and historical trips since 3:00 AM
 * Returns active trips first, then historical trips
 */
export const getTripsSince3AM = query({
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

    // Get active trips (no time filter needed - they're all recent)
    const activeTrips = await ctx.db
      .query("activeVesselTrips")
      .order("desc")
      .collect();

    // Get historical trips since 3:00 AM
    const historicalTrips = await ctx.db
      .query("historicalVesselTrips")
      .withIndex("by_timestamp", (q) => q.gte("TimeStamp", startTimestamp))
      .order("desc")
      .take(limit - activeTrips.length); // Reserve space for active trips

    // Combine and sort by timestamp
    const allTrips = [...activeTrips, ...historicalTrips];
    return allTrips.sort((a, b) => b.TimeStamp - a.TimeStamp).slice(0, limit);
  },
});

/**
 * API function for fetching the most recent VesselTrip for specific vessels
 * Checks active trips first, then historical trips
 */
export const getLatestTripsByVesselIds = query({
  args: {
    vesselIds: v.array(v.number()),
  },
  handler: async (ctx, args) => {
    const mostRecentTrips = await Promise.all(
      args.vesselIds.map(async (vesselId) => {
        // Check active trips first
        const activeTrip = await ctx.db
          .query("activeVesselTrips")
          .withIndex("by_vessel_id", (q) => q.eq("VesselID", vesselId))
          .order("desc")
          .first();

        if (activeTrip) return activeTrip;

        // Fall back to historical trips
        return await ctx.db
          .query("historicalVesselTrips")
          .withIndex("by_vessel_id_and_timestamp", (q) =>
            q.eq("VesselID", vesselId)
          )
          .order("desc")
          .first();
      })
    );

    // Filter out any null results (in case a vessel has no trips)
    return mostRecentTrips.filter((trip) => trip !== null);
  },
});

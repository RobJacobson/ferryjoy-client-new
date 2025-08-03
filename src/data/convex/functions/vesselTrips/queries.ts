import { v } from "convex/values";

import { query } from "@/data/convex/_generated/server";

/**
 * API function for fetching VesselTrips from 3:00 AM today through now,
 * or 3:00 AM yesterday if current time is between midnight and 3:00 AM
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

    return await ctx.db
      .query("vesselTrips")
      .withIndex("by_timestamp", (q) => q.gte("TimeStamp", startTimestamp))
      .order("desc") // Most recent first
      .take(limit); // Prevent unbounded results
  },
});

/**
 * API function for fetching the most recent VesselTrip for specific vessels
 * Uses the by_vessel_id_and_timestamp compound index for optimal performance
 * Eliminates the need for vesselBasics table scan by accepting vessel IDs directly
 */
export const getLatestTripsByVesselIds = query({
  args: {
    vesselIds: v.array(v.number()),
  },
  handler: async (ctx, args) => {
    // Get the most recent trip for each specified vessel
    const mostRecentTrips = await Promise.all(
      args.vesselIds.map(
        async (vesselId) =>
          await ctx.db
            .query("vesselTrips")
            .withIndex("by_vessel_id_and_timestamp", (q) =>
              q.eq("VesselID", vesselId)
            )
            .order("desc")
            .first()
      )
    );

    // Filter out any null results (in case a vessel has no trips)
    return mostRecentTrips.filter((trip) => trip !== null);
  },
});

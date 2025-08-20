import { query } from "@convex/_generated/server";

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

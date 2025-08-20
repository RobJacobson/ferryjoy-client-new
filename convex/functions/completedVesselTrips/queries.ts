import { query } from "@convex/_generated/server";

/**
 * API function for fetching completed vessel trips for ML training
 * Historical data used to train prediction models
 */
export const getCompletedTrips = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("completedVesselTrips").order("desc").collect(); // ~4,000 historical records
  },
});

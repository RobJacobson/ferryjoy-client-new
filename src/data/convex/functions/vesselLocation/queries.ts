import { v } from "convex/values";

import { query } from "@/data/convex/_generated/server";

/**
 * Get vessel locations older than a given timestamp
 */
export const getOlderThan = query({
  args: {
    cutoffTime: v.number(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { cutoffTime, limit = 1000 }) => {
    return await ctx.db
      .query("vesselLocations")
      .withIndex("by_timestamp", (q) => q.lt("TimeStamp", cutoffTime))
      .take(limit);
  },
});

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

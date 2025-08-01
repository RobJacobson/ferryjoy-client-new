import { query } from "@/data/convex/_generated/server";

import { vesselBasicsQueryArgs } from "./types";

/**
 * API function for fetching all vessel basics
 */
export const getAllVesselBasics = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("vesselBasics").collect();
  },
});

/**
 * API function for fetching vessel basics by vessel ID
 */
export const getVesselBasicsByVesselId = query({
  args: vesselBasicsQueryArgs,
  handler: async (ctx, args) => {
    return await ctx.db
      .query("vesselBasics")
      .withIndex("by_vessel_id", (q) => q.eq("VesselID", args.VesselID))
      .first();
  },
});

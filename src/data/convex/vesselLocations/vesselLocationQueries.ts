import { v } from "convex/values";

import { query } from "../_generated/server";
import { getLatestVesselLocationsByVessel } from "./vesselLocationHelpers";

/**
 * Get all vessel locations from the database
 */
export const getAllVesselLocations = query({
  handler: async (ctx) => {
    return await ctx.db.query("vesselLocations").collect();
  },
});

/**
 * Get vessel locations filtered by vessel ID
 */
export const getVesselLocationsByVesselId = query({
  args: { vesselID: v.number() },
  handler: async (ctx, { vesselID }) => {
    return await ctx.db
      .query("vesselLocations")
      .withIndex("by_vessel_id", (q) => q.eq("vesselID", vesselID))
      .collect();
  },
});

/**
 * Get the latest vessel location for each vessel (optimized)
 */
export const getLatestVesselLocations = query({
  handler: async (ctx) => {
    return await getLatestVesselLocationsByVessel(ctx.db);
  },
});

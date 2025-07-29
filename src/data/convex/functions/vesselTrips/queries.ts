import { v } from "convex/values";

import { query } from "@/data/convex/_generated/server";

import { vesselQueryArgs } from "./types";

export const getByVesselId = query({
  args: vesselQueryArgs,
  handler: async (ctx, args) => {
    return await ctx.db
      .query("vesselTrips")
      .withIndex("by_vessel_id", (q) => q.eq("VesselID", args.VesselID))
      .first();
  },
});

export const getAll = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("vesselTrips").collect();
  },
});

export const getInService = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("vesselTrips")
      .withIndex("by_service_status", (q) =>
        q.eq("InService", true).eq("AtDock", false)
      )
      .collect();
  },
});

export const getAtDock = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("vesselTrips")
      .withIndex("by_service_status", (q) =>
        q.eq("InService", true).eq("AtDock", true)
      )
      .collect();
  },
});

/**
 * API function for fetching the most recent VesselTrip for each vessel
 * Uses the by_vessel_id_and_timestamp compound index for optimal performance
 */
export const getMostRecentByVessel = query({
  args: {},
  handler: async (ctx) => {
    // Get vessel IDs from vesselBasics table (efficient)
    const vesselBasics = await ctx.db.query("vesselBasics").collect();
    const vesselIds = vesselBasics.map((vessel) => vessel.VesselID);

    // Get the most recent trip for each vessel
    const mostRecentTrips = await Promise.all(
      vesselIds.map(async (vesselId) => {
        return await ctx.db
          .query("vesselTrips")
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

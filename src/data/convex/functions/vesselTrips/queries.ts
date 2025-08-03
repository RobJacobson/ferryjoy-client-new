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

/**
 * API function for fetching VesselTrips from 3:00 AM today through now,
 * or 3:00 AM yesterday if current time is between midnight and 3:00 AM
 */
export const getTripsSince3AM = query({
  args: {},
  handler: async (ctx) => {
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

/**
 * API function for fetching the most recent VesselTrip for specific vessels
 * Uses the by_vessel_id_and_timestamp compound index for optimal performance
 * Eliminates the need for vesselBasics table scan by accepting vessel IDs directly
 */
export const getMostRecentByVesselIds = query({
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

/**
 * Get the most recent sailing (completed or in progress) for each vessel
 * Returns trip info needed to determine VesselPing time ranges
 */
export const getMostRecentSailingByVessel = query({
  args: {},
  handler: async (ctx) => {
    // Get vessel IDs from vesselBasics table
    const vesselBasics = await ctx.db.query("vesselBasics").collect();
    const vesselIds = vesselBasics.map((vessel) => vessel.VesselID);

    // Get the most recent trip with LeftDockActual for each vessel
    const mostRecentSailings = await Promise.all(
      vesselIds.map(async (vesselId) => {
        return await ctx.db
          .query("vesselTrips")
          .withIndex("by_vessel_id_and_timestamp", (q) =>
            q.eq("VesselID", vesselId)
          )
          .filter((q) => q.neq(q.field("LeftDockActual"), undefined))
          .order("desc")
          .first();
      })
    );

    // Filter out null results and return sailing info
    return mostRecentSailings
      .filter((trip) => trip !== null)
      .map((trip) => ({
        VesselID: trip.VesselID,
        LeftDockActual: trip.LeftDockActual,
        ArvDockActual: trip.ArvDockActual,
      }));
  },
});

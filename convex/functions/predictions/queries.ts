import { query } from "@convex/_generated/server";
import { v } from "convex/values";

import type { ConvexVesselTrip } from "@/data/types/convex/VesselTrip";

/**
 * Gets all model parameters
 */
export const getAllModelParameters = query({
  args: {},
  handler: async (ctx) => ctx.db.query("modelParameters").collect(),
});

/**
 * Gets all current predictions
 */
export const getAllCurrentPredictions = query({
  args: {},
  handler: async (ctx) => ctx.db.query("currentPredictions").collect(),
});

/**
 * Gets current predictions by type
 */
export const getCurrentPredictionsByType = query({
  args: {
    predictionType: v.union(v.literal("departure"), v.literal("arrival")),
  },
  handler: async (ctx, args) =>
    ctx.db
      .query("currentPredictions")
      .filter((q) => q.eq(q.field("predictionType"), args.predictionType))
      .collect(),
});

/**
 * Gets current predictions by route
 */
export const getCurrentPredictionsByRoute = query({
  args: { routeId: v.string() },
  handler: async (ctx, args) =>
    ctx.db
      .query("currentPredictions")
      .withIndex("by_route", (q) => q.eq("opRouteAbrv", args.routeId))
      .collect(),
});

/**
 * Gets all historical predictions
 */
export const getAllHistoricalPredictions = query({
  args: {},
  handler: async (ctx) => ctx.db.query("historicalPredictions").collect(),
});

/**
 * Gets historical predictions by type
 */
export const getHistoricalPredictionsByType = query({
  args: {
    predictionType: v.union(v.literal("departure"), v.literal("arrival")),
  },
  handler: async (ctx, args) =>
    ctx.db
      .query("historicalPredictions")
      .filter((q) => q.eq(q.field("predictionType"), args.predictionType))
      .collect(),
});

/**
 * Query to investigate data quality issues with significant negative delays
 * Returns trips where actual departure time is significantly earlier than scheduled
 */
export const getTripsWithNegativeDelays = query({
  args: {
    maxNegativeDelayMinutes: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const maxNegativeDelay = args.maxNegativeDelayMinutes ?? -5; // Default to -5 minutes

    // Fetch all completed trips with actual departure times
    const trips = await ctx.db
      .query("completedVesselTrips")
      .filter((q) =>
        q.and(
          q.neq(q.field("LeftDockActual"), null), // Has actual departure time
          q.neq(q.field("LeftDockActual"), 0), // Not zero timestamp
          q.neq(q.field("ScheduledDeparture"), null), // Has scheduled time
          q.neq(q.field("ScheduledDeparture"), 0) // Not zero timestamp
        )
      )
      .collect();

    // Calculate delays and filter for significant negative delays
    const tripsWithDelays = trips
      .map((trip) => {
        const actualTime = trip.LeftDockActual!;
        const scheduledTime = trip.ScheduledDeparture!;
        const delayMinutes = (actualTime - scheduledTime) / (60 * 1000);

        // Validate timestamps before creating Date objects
        const scheduledDate =
          scheduledTime > 0
            ? new Date(scheduledTime).toISOString()
            : "Invalid timestamp";
        const actualDate =
          actualTime > 0
            ? new Date(actualTime).toISOString()
            : "Invalid timestamp";

        return {
          // Include ALL fields from the original table
          _id: trip._id,
          _creationTime: trip._creationTime,
          VesselID: trip.VesselID,
          VesselName: trip.VesselName,
          DepartingTerminalID: trip.DepartingTerminalID,
          DepartingTerminalName: trip.DepartingTerminalName,
          DepartingTerminalAbbrev: trip.DepartingTerminalAbbrev,
          ArrivingTerminalID: trip.ArrivingTerminalID,
          ArrivingTerminalName: trip.ArrivingTerminalName,
          ArrivingTerminalAbbrev: trip.ArrivingTerminalAbbrev,
          InService: trip.InService,
          AtDock: trip.AtDock,
          LeftDock: trip.LeftDock,
          LeftDockActual: trip.LeftDockActual,
          Eta: trip.Eta,
          ScheduledDeparture: trip.ScheduledDeparture,
          ArvDockActual: trip.ArvDockActual,
          OpRouteAbbrev: trip.OpRouteAbbrev,
          VesselPositionNum: trip.VesselPositionNum,
          TimeStamp: trip.TimeStamp,
          // Converted fields for CSV
          scheduledDateISO: scheduledDate,
          actualDateISO: actualDate,
          delayMinutes: Math.round(delayMinutes * 100) / 100, // Round to 2 decimal places
        };
      })
      .filter((trip) => trip.delayMinutes < maxNegativeDelay)
      .sort((a, b) => a.delayMinutes - b.delayMinutes); // Sort by most negative first

    return {
      maxNegativeDelayMinutes: maxNegativeDelay,
      totalTripsAnalyzed: trips.length,
      tripsWithNegativeDelays: tripsWithDelays.length,
      trips: tripsWithDelays,
    };
  },
});

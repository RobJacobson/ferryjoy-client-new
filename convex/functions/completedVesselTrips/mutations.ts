import { mutation } from "@convex/_generated/server";
import { v } from "convex/values";

import type { ConvexVesselTripCompleted } from "./schemas";
import { vesselTripCompletedValidationSchema } from "./schemas";

/**
 * Insert a single completed vessel trip into the database
 */
export const insertCompletedVesselTrip = mutation({
  args: {
    trip: vesselTripCompletedValidationSchema,
  },
  handler: async (ctx, args: { trip: ConvexVesselTripCompleted }) => {
    await ctx.db.insert("completedVesselTrips", args.trip);
  },
});

/**
 * Insert multiple completed vessel trips in a single transaction
 */
export const insertMultipleCompletedVesselTrips = mutation({
  args: {
    trips: v.array(vesselTripCompletedValidationSchema),
  },
  handler: async (ctx, args: { trips: ConvexVesselTripCompleted[] }) => {
    await Promise.all(
      args.trips.map((trip) => ctx.db.insert("completedVesselTrips", trip))
    );
  },
});

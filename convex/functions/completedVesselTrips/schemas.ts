import type { Infer } from "convex/values";
import { v } from "convex/values";

import { baseVesselTripSchema } from "../activeVesselTrips/schemas";

const completedVesselTripSchema = {
  ...baseVesselTripSchema,
  // Extended fields
  Key: v.string(),
  TripEnd: v.number(),
  LeftDockDelay: v.number(),
  AtDockDuration: v.number(),
  AtSeaDuration: v.number(),
  TotalDuration: v.number(),
};

export const vesselTripCompletedValidationSchema = v.object({
  ...baseVesselTripSchema,
  ...completedVesselTripSchema,
});

export type ConvexVesselTripCompleted = Infer<
  typeof vesselTripCompletedValidationSchema
>;

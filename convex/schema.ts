import { defineSchema, defineTable } from "convex/server";

import {
  currentPredictionDataSchema,
  historicalPredictionDataSchema,
  modelParametersMutationSchema,
} from "@/data/types/convex/Prediction";
import { vesselLocationValidationSchema } from "@/data/types/convex/VesselLocation";
import { vesselPingValidationSchema } from "@/data/types/convex/VesselPing";

import {
  vesselTripCompletedValidationSchema,
  vesselTripValidationSchema,
} from "./functions/vesselTrips/schemas";

export default defineSchema({
  // Active vessel trips - frequently updated, small dataset
  activeVesselTrips: defineTable(vesselTripValidationSchema),

  // Completed vessel trips - static, large dataset, infrequent updates
  completedVesselTrips: defineTable(vesselTripCompletedValidationSchema)
    .index("by_timestamp", ["TimeStamp"])
    .index("by_scheduled_departure", ["ScheduledDeparture"])
    .index("by_vessel_id_and_scheduled_departure", [
      "VesselID",
      "ScheduledDeparture",
    ]),

  // Vessel pings for tracking movement (using shared validation schema)
  vesselPings: defineTable(vesselPingValidationSchema).index("by_timestamp", [
    "TimeStamp",
  ]),

  // Vessel locations combining vessel location data
  vesselLocations: defineTable(vesselLocationValidationSchema)
    .index("by_timestamp", ["TimeStamp"])
    .index("by_vessel_id_and_timestamp", ["VesselID", "TimeStamp"]),

  // Prediction model parameters
  modelParameters: defineTable(modelParametersMutationSchema).index(
    "by_route_and_type",
    ["routeId", "modelType"]
  ),

  // Historical predictions for analysis (single table with type discriminator)
  historicalPredictions: defineTable(historicalPredictionDataSchema)
    .index("by_timestamp", ["predictionTimestamp"])
    .index("by_vessel_and_type", ["vesselId", "predictionType"])
    .index("by_route", ["opRouteAbrv"]),

  // Current predictions for caching (single table with type discriminator)
  currentPredictions: defineTable(currentPredictionDataSchema)
    .index("by_vessel_and_type", ["vesselId", "predictionType"])
    .index("by_route", ["opRouteAbrv"]),
});

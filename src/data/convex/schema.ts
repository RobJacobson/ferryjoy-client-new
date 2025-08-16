import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

import { vesselLocationValidationSchema } from "../types/convex/VesselLocation";
import { vesselPingValidationSchema } from "../types/convex/VesselPing";
import { vesselTripValidationSchema } from "../types/convex/VesselTrip";

// ============================================================================
// FUNCTION VALIDATION SCHEMAS
// ============================================================================

/**
 * Schema for current prediction data - single table with type discriminator
 * routeId can be derived from opRouteAbrv for filtering
 */
export const currentPredictionDataSchema = {
  vesselId: v.number(),
  predictionType: v.union(v.literal("departure"), v.literal("arrival")),
  vesselName: v.string(),
  opRouteAbrv: v.string(),
  depTermAbrv: v.string(),
  arvTermAbrv: v.string(),
  createdAt: v.number(),
  schedDep: v.number(),
  predictedTime: v.number(),
  confidence: v.number(),
  modelVersion: v.string(),
} as const;

/**
 * Schema for model parameters mutation argument
 */
export const modelParametersMutationSchema = {
  routeId: v.string(),
  modelType: v.union(v.literal("departure"), v.literal("arrival")),
  coefficients: v.array(v.number()),
  intercept: v.number(),
  featureNames: v.array(v.string()),
  trainingMetrics: v.object({
    mae: v.number(),
    rmse: v.number(),
    r2: v.number(),
  }),
  modelVersion: v.string(),
  createdAt: v.number(),
} as const;

/**
 * Schema for prediction input arguments - used in prediction functions
 */
export const predictionFunctionInputSchema = {
  vesselId: v.number(),
  vesselName: v.string(),
  opRouteAbrv: v.string(),
  depTermAbrv: v.string(),
  arvTermAbrv: v.string(),
  schedDep: v.number(),
  priorTime: v.number(),
  hourOfDay: v.number(),
  dayType: v.union(v.literal("weekday"), v.literal("weekend")),
  previousDelay: v.number(),
} as const;

// ============================================================================
// DATABASE SCHEMAS
// ============================================================================

export default defineSchema({
  // Active vessel trips - frequently updated, small dataset
  activeVesselTrips: defineTable(vesselTripValidationSchema),

  // Completed vessel trips - static, large dataset, infrequent updates
  completedVesselTrips: defineTable(vesselTripValidationSchema)
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
  historicalPredictions: defineTable({
    vesselId: v.number(),
    predictionType: v.union(v.literal("departure"), v.literal("arrival")),
    vesselName: v.string(),
    opRouteAbrv: v.string(),
    depTermAbrv: v.string(),
    arvTermAbrv: v.string(),
    modelVersion: v.string(),
    createdAt: v.number(),
    schedDep: v.number(),
    predictedTime: v.number(),
    confidence: v.number(),
    predictionId: v.string(),
    predictionTimestamp: v.number(),
    hourOfDay: v.number(),
    dayType: v.union(v.literal("weekday"), v.literal("weekend")),
    previousDelay: v.number(),
    priorTime: v.number(),
    actual: v.optional(v.number()),
    error: v.optional(v.number()),
  })
    .index("by_timestamp", ["predictionTimestamp"])
    .index("by_vessel_and_type", ["vesselId", "predictionType"])
    .index("by_route", ["opRouteAbrv"]),

  // Current predictions for caching (single table with type discriminator)
  currentPredictions: defineTable(currentPredictionDataSchema)
    .index("by_vessel_and_type", ["vesselId", "predictionType"])
    .index("by_route", ["opRouteAbrv"]),
});

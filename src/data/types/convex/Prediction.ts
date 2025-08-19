import type { Infer } from "convex/values";
import { v } from "convex/values";

// ============================================================================
// DATABASE PREDICTION TYPES (for storing predictions, not ML features)
// ============================================================================

/**
 * Schema for current prediction data - single table with type discriminator
 * This is what gets stored in the database for client caching
 */
export const currentPredictionDataSchema = v.object({
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
});

/**
 * Schema for historical predictions analysis
 */
export const historicalPredictionDataSchema = v.object({
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
});

/**
 * Schema for model parameters mutation argument
 */
export const modelParametersMutationSchema = v.object({
  routeId: v.string(),
  modelType: v.union(v.literal("departure"), v.literal("arrival")),
  modelAlgorithm: v.optional(v.string()), // e.g., "vessel_departures", "random_forest", "neural_network"
  coefficients: v.array(v.number()),
  intercept: v.number(),
  featureNames: v.array(v.string()),
  trainingMetrics: v.object({
    mae: v.number(),
    rmse: v.number(),
    r2: v.number(),
    stdDev: v.optional(v.number()),
  }),
  modelVersion: v.string(),
  createdAt: v.number(),
});

// ============================================================================
// TYPE EXPORTS
// ============================================================================

/**
 * Current prediction data type inferred from validation schema
 * Used for caching current predictions in the database
 */
export type CurrentPredictionData = Infer<typeof currentPredictionDataSchema>;

/**
 * Historical prediction data type inferred from validation schema
 * Used for storing historical predictions for analysis
 */
export type HistoricalPredictionData = Infer<
  typeof historicalPredictionDataSchema
>;

/**
 * Model parameters type inferred from validation schema
 * Used for storing trained model parameters
 */
export type ModelParameters = Infer<typeof modelParametersMutationSchema>;

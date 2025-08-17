import { v } from "convex/values";

// ============================================================================
// DATABASE PREDICTION TYPES (for storing predictions, not ML features)
// ============================================================================

/**
 * Schema for current prediction data - single table with type discriminator
 * This is what gets stored in the database for client caching
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
 * Schema for historical predictions analysis
 */
export const historicalPredictionDataSchema = {
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
} as const;

/**
 * Schema for model parameters mutation argument
 */
export const modelParametersMutationSchema = {
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
} as const;

// ============================================================================
// TYPE EXPORTS
// ============================================================================

// Extract types from schemas for TypeScript usage
export type CurrentPredictionData = {
  vesselId: number;
  predictionType: "departure" | "arrival";
  vesselName: string;
  opRouteAbrv: string;
  depTermAbrv: string;
  arvTermAbrv: string;
  createdAt: number;
  schedDep: number;
  predictedTime: number;
  confidence: number;
  modelVersion: string;
};

export type HistoricalPredictionData = {
  vesselId: number;
  predictionType: "departure" | "arrival";
  vesselName: string;
  opRouteAbrv: string;
  depTermAbrv: string;
  arvTermAbrv: string;
  modelVersion: string;
  createdAt: number;
  schedDep: number;
  predictedTime: number;
  confidence: number;
  predictionId: string;
  predictionTimestamp: number;
  hourOfDay: number;
  dayType: "weekday" | "weekend";
  previousDelay: number;
  priorTime: number;
  actual?: number;
  error?: number;
};

export type ModelParameters = {
  routeId: string;
  modelType: "departure" | "arrival";
  modelAlgorithm: string; // e.g., "vessel_departures", "random_forest", "neural_network"
  coefficients: number[];
  intercept: number;
  featureNames: string[];
  trainingMetrics: {
    mae: number;
    rmse: number;
    r2: number;
    stdDev: number;
  };
  modelVersion: string;
  createdAt: number;
};

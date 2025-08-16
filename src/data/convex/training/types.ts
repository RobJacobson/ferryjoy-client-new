import type { Infer } from "convex/values";

import type { ConvexVesselTrip } from "@/data/types/convex/VesselTrip";

import {
  currentPredictionDataSchema,
  modelParametersMutationSchema,
  predictionFunctionInputSchema,
} from "../schema";

// ============================================================================
// SCHEMA-DERIVED TYPES (Manually defined but aligned with schemas)
// ============================================================================

/**
 * Types aligned with schemas for type safety
 */
export type PredictionInput = {
  prevTrip: {
    ArvDockActual?: number;
    ScheduledDeparture?: number;
    LeftDockActual?: number;
  };
  currTrip: {
    ScheduledDeparture: number;
    ArvDockActual?: number;
  };
};

export type PredictionOutput = {
  success: boolean;
  message: string;
  predictedTime?: number;
  confidence?: number;
  modelVersion?: string;
};

export type PredictionResult = PredictionHelper & {
  vesselId: number;
  predictionType: "departure" | "arrival";
  vesselName: string;
  opRouteAbrv: string;
  depTermAbrv: string;
  arvTermAbrv: string;
  createdAt: number;
  schedDep: number;
};

export type ModelParameters = {
  routeId: string;
  modelType: "departure" | "arrival";
  coefficients: number[];
  intercept: number;
  featureNames: string[];
  trainingMetrics: {
    mae: number;
    rmse: number;
    r2: number;
  };
  modelVersion: string;
  createdAt: number;
};

/**
 * Prediction result from the shared helper
 */
export type PredictionHelper = {
  predictedTime: number;
  confidence: number;
  modelVersion: string;
};

// ============================================================================
// CONSOLIDATED FEATURE ENGINEERING TYPES
// ============================================================================

/**
 * Single consolidated type for training examples
 * 8 features + 1 target for departure prediction
 */
export type TrainingExample = {
  // Route identification
  routeId: string;

  // Temporal features (24 binary hour features)
  hourFeatures: readonly number[] & { length: 24 };
  isWeekday: number;
  isWeekend: number;

  // PrevTrip features
  prevArvTimeActual: number;
  prevDepTermAbrv: string;
  prevDepTimeSched: number;
  prevDepTimeActual: number;

  // CurrTrip features
  currArvTimeActual: number;
  currArvTermAbrv: string;
  currDepTermAbrv: string;
  currDepTimeSched: number;

  // Target variable for training (departure time)
  targetDepTimeActual: number;
};

/**
 * Training data structure for mljs (simplified)
 */
export type TrainingData = {
  x: number[][];
  y: number[];
};

// ============================================================================
// ML MODEL TYPES (Strong typing for mljs)
// ============================================================================

/**
 * Strongly typed linear regression model
 */
export type LinearRegressionModel = {
  coefficients: number[];
  intercept: number;
  predict: (features: number[]) => number;
};

/**
 * Training metrics with strong typing
 */
export type TrainingMetrics = {
  mae: number;
  rmse: number;
  r2: number;
};

/**
 * Training result with model and metrics
 */
export type TrainingResult = {
  model: LinearRegressionModel;
  metrics: TrainingMetrics;
  featureNames: string[];
};

/**
 * Route-specific training result
 */
export type RouteTrainingResult = {
  routeId: string;
  model: LinearRegressionModel;
  metrics: TrainingMetrics;
  featureNames: string[];
};

// ============================================================================
// RESPONSE TYPES
// ============================================================================

/**
 * Training response with models and statistics
 */
export type TrainingResponse = {
  success: boolean;
  message: string;
  models: ModelParameters[];
  routeStatistics: RouteStatistics[];
};

// ============================================================================
// ROUTE STATISTICS TYPES
// ============================================================================

/**
 * Group of training examples for a specific route
 */
export type RouteGroup = {
  routeId: string;
  examples: TrainingExample[];
};

/**
 * Statistics for a route group
 */
export type RouteStatistics = {
  routeId: string;
  exampleCount: number;
  hasValidData: boolean;
  averageDelay: number;
  dataQuality: "excellent" | "good" | "poor";
  debug?: {
    validExamplesCount: number;
    sampleDelay: number;
    maxDelay: number;
    minDelay: number;
    delayVariance: number;
  };
};

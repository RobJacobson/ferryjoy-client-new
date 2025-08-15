import type { Infer } from "convex/values";

import {
  currentPredictionDataSchema,
  modelParametersMutationSchema,
  predictionFunctionInputSchema,
} from "../schema";

// ============================================================================
// TYPESCRIPT TYPES (Aligned with schemas)
// ============================================================================

/**
 * Types aligned with schemas
 */
export type PredictionInput = {
  vesselId: number;
  vesselName: string;
  opRouteAbrv: string;
  depTermAbrv: string;
  arvTermAbrv: string;
  schedDep: number;
  priorTime: number;
  hourOfDay: number;
  dayType: "weekday" | "weekend";
  previousDelay: number;
};

export type PredictionOutput = {
  modelVersion: string;
  predictedTime: number;
  confidence: number;
};

/**
 * Current prediction data for storage (matches currentPredictionDataSchema)
 */
export type CurrentPredictionData = {
  vesselId: number;
  routeId: string;
  predictionType: "departure" | "arrival";
  modelVersion: string;
  createdAt: number;
  vesselName: string;
  opRouteAbrv: string;
  depTermAbrv: string;
  arvTermAbrv: string;
  schedDep: number;
  predictedTime: number;
  confidence: number;
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

// ============================================================================
// CUSTOM TYPES (Cannot be inferred from schemas)
// ============================================================================

/**
 * Training data structure for mljs
 */
export type TrainingData = {
  x: number[][];
  y: number[];
};

/**
 * Encoded features for machine learning
 */
export type EncodedFeatures = {
  routeId: string; // Add routeId for proper route grouping
  hourFeatures: readonly number[] & { length: 24 }; // 24 binary hour features
  isWeekday: number;
  isWeekend: number;
  previousDelay: number;
  priorStartMinutes?: number; // minutes since midnight of prior leg start time
  departureTime?: number;
  schedDep?: number;
  actualArrival?: number; // Actual arrival time (ArvDockActual) for training
};

/**
 * Prediction result from the shared helper
 */
export type PredictionResult = {
  predictedTime: number;
  confidence: number;
  modelVersion: string;
};

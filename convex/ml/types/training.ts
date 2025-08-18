// ============================================================================
// TRAINING TYPES (Training pipeline specific)
// ============================================================================

import type { FeatureNames, FeatureVector, VesselTripFeatures } from "./shared";

/**
 * Training example with structured input features and target value
 * This is the output of the loading stage and input to the encoding stage
 */
export type TrainingExample = {
  input: VesselTripFeatures;
  target: { delayMinutes: number }; // Delay in minutes (can be negative for early departures)
};

/**
 * Encoded training data ready for ML model training
 * Contains feature matrices, target vectors, and feature names for debugging
 */
export type EncodedTrainingData = {
  x: FeatureVector[]; // Feature matrix (n_samples × n_features)
  y: number[]; // Target vector (n_samples)
  featureNames: FeatureNames; // Feature names for debugging and interpretation
};

/**
 * Linear regression model parameters
 * Contains coefficients, intercept, and training metrics
 */
export type ModelParameters = {
  routeId: string;
  modelType: "departure" | "arrival";
  coefficients: number[];
  intercept: number;
  featureNames: FeatureNames;
  trainingMetrics: {
    mae: number; // Mean Absolute Error
    rmse: number; // Root Mean Square Error
    r2: number; // R-squared score
  };
  modelVersion: string;
  createdAt: number;
};

/**
 * Response from training pipeline execution
 * Contains trained models and route statistics
 */
export type TrainingResponse = {
  models: ModelParameters[];
  routeStatistics: RouteStatistics[];
};

/**
 * Route statistics for training quality assessment
 * Provides metrics on data quality and model performance per route
 */
export type RouteStatistics = {
  routeId: string;
  trainingExamples: number;
  validationExamples: number;
  modelPerformance: {
    mae: number;
    rmse: number;
    r2: number;
  };
};

/**
 * Route grouping for training organization
 * Groups training examples by route for model training
 */
export type RouteGroup = {
  routeId: string;
  examples: TrainingExample[];
};

/**
 * Training/validation split result
 * Contains separate arrays for training and validation sets
 */
export type TrainTestSplit = {
  training: TrainingExample[];
  validation: TrainingExample[];
};

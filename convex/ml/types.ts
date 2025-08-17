import type { ConvexVesselTrip } from "../../src/data/types/convex/VesselTrip";

// ============================================================================
// SCHEMA-DERIVED TYPES (Manually defined but aligned with schemas)
// ============================================================================

/**
 * Core input structure for ML prediction models
 * Defines the exact fields extracted from vessel trips for feature engineering
 * Aligned with database schemas for type safety and consistency
 */
export type TrainingInput = {
  // Route identification
  routeId: string;

  // Terminal abbreviations
  fromTerminalAbrv: string;
  toTerminalAbrv: string;
  nextTerminalAbrv: string;

  // Previous trip data
  prevArvTimeActual: Date;
  prevDepTimeSched: Date;
  prevDepTime: Date;

  // Current trip data
  currArvTimeActual: Date;
  currDepTimeSched: Date;

  // For hourFeatures calculation (derived from currDepTimeSched)
  scheduledDeparture: number;

  // Derived day-of-week features
  isWeekday: boolean;
  isWeekend: boolean;
};

export type TrainingOutput = {
  expectedDelay: number;
};

export type TrainingExample = {
  trainingInput: TrainingInput;
  trainingOutput: TrainingOutput;
};

/**
 * Standardized output structure for ML prediction results
 * Provides predicted time, confidence score, and model version for client consumption
 */
export type PredictionOutput = TrainingOutput & {
  expectedDelay: number;
  confidence: number;
  modelVersion: string;
};

/**
 * Complete ML model representation including coefficients, metrics, and metadata
 * Stores all necessary information for making predictions and model evaluation
 */
export type ModelParameters = {
  routeId: string;
  modelType: "departure" | "arrival";
  modelAlgorithm?: string; // e.g., "vessel_departures", "random_forest", "neural_network"
  coefficients: number[];
  intercept: number;
  featureNames: string[];
  trainingMetrics: {
    mae: number;
    rmse: number;
    r2: number;
    stdDev?: number;
  };
  modelVersion: string;
  createdAt: number;
};

/**
 * Internal prediction result structure for helper functions
 * Provides intermediate prediction data during the prediction pipeline
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
 * Strongly-typed feature vector for ML models
 * Ensures compile-time validation of feature count and structure
 * 91 features total: 24 hour + 2 day + 5 timestamp + 60 terminal (3×20)
 */
export type FeatureVector = readonly number[] & { readonly length: 91 };

/**
 * ML-ready training data structure optimized for mljs library consumption
 * Provides feature matrices (x) and target vectors (y) for model training
 */
export type TrainingData = {
  x: number[][];
  y: number[];
};

// ============================================================================
// RESPONSE TYPES
// ============================================================================

/**
 * Comprehensive response structure for model training operations
 * Returns trained models and route statistics for monitoring and validation
 */
export type TrainingResponse = {
  models: ModelParameters[];
  routeStatistics: RouteStatistics[];
};

// ============================================================================
// ROUTE STATISTICS TYPES
// ============================================================================

/**
 * Route-specific grouping of training examples for targeted model training
 * Organizes examples by route ID to enable route-specific ML model development
 */
export type RouteGroup = {
  routeId: string;
  examples: TrainingExample[];
};

/**
 * Comprehensive statistics for route-specific training data quality assessment
 * Provides metrics for evaluating training data suitability and model performance
 */
export type RouteStatistics = {
  routeId: string;
  exampleCount: number;
  hasValidData: boolean;
  averageDelay: number;
  delayStdDev: number; // Standard deviation of delays (more intuitive than variance)
  delayRange: {
    min: number;
    max: number;
  };
  dataQuality: "excellent" | "good" | "poor";
  // Additional quality metrics
  dataCompleteness: number; // Percentage of examples with complete data
  outlierPercentage: number; // Percentage of examples marked as outliers
  seasonalCoverage: {
    weekdays: number; // Number of weekday examples
    weekends: number; // Number of weekend examples
    hours: number; // Number of unique hours covered
  };
};

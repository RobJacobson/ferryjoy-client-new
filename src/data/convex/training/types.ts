// ============================================================================
// SCHEMA-DERIVED TYPES (Manually defined but aligned with schemas)
// ============================================================================

/**
 * Types aligned with schemas for type safety
 */
export type PredictionInput = {
  // Route identification
  routeId: string;

  // Terminal abbreviations
  fromTerminalAbrv: string;
  toTerminalAbrv: string;
  nextTerminalAbrv: string;

  // Previous trip data
  prevArvTimeActual: number;
  prevDepTimeSched: number;
  prevDepTimeActual: number;

  // Current trip data
  currArvTimeActual: number;
  currDepTimeSched: number;

  // For hourFeatures calculation (derived from currDepTimeSched)
  scheduledDeparture: number;
};

export type PredictionOutput = {
  success: boolean;
  message: string;
  predictedTime?: number;
  confidence?: number;
  modelVersion?: string;
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
 * Complete prediction data: input features + target output
 * Can be used for both training examples and prediction results
 */
export type ExampleData = {
  input: PredictionInput;
  target: {
    departureTime: number;
  };
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

/**
 * Training metrics with strong typing
 */

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
  examples: ExampleData[];
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

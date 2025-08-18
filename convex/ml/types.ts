// ============================================================================
// DOMAIN TYPES (Loading Stage)
// ============================================================================

/**
 * Vessel trip with all required fields guaranteed to be present
 * This type eliminates the need for null checks in subsequent pipeline functions
 */
export type ValidatedVesselTrip = {
  _id: string;
  _creationTime: number;
  InService: boolean;
  OpRouteAbbrev: string;
  ArrivingTerminalID: number;
  ArrivingTerminalName: string;
  ArrivingTerminalAbbrev: string;
  DepartingTerminalID: number;
  DepartingTerminalName: string;
  DepartingTerminalAbbrev: string;
  ScheduledDeparture: Date;
  ScheduledArrival: Date;
  ArvDockActual: Date;
  LeftDock: Date;
  VesselName: string;
  TimeStamp: number;
};

/**
 * Structured features extracted from vessel trips before flattening
 * These features are organized logically and will be flattened in the encoding stage
 */
export type VesselTripFeatures = {
  // Hour of day features (binary array for one-hot encoding)
  hourOfDay: number[]; // [0, 0, 1, 0, ...] for hour 2

  // Day type features (binary classification)
  dayType: {
    isWeekday: number; // 1 for Monday-Friday, 0 for weekend
    isWeekend: number; // 1 for Saturday-Sunday, 0 for weekday
  };

  // Timestamp features (normalized to minutes since reference)
  timestamps: {
    prevArvTimeActual: number; // Previous trip actual arrival time
    prevDepTimeSched: number; // Previous trip scheduled departure
    prevDepTime: number; // Previous trip actual departure
    currArvTimeActual: number; // Current trip actual arrival time
    currDepTimeSched: number; // Current trip scheduled departure
  };

  // Terminal features (string identifiers for one-hot encoding)
  terminals: {
    from: string; // Departing terminal abbreviation
    to: string; // Arriving terminal abbreviation
    next: string; // Next terminal abbreviation
  };
};

/**
 * Training example with structured input features and target value
 * This is the output of the loading stage and input to the encoding stage
 */
export type TrainingExample = {
  input: VesselTripFeatures;
  target: { delayMinutes: number }; // Delay in minutes (can be negative for early departures)
};

// ============================================================================
// ML TYPES (Encoding Stage)
// ============================================================================

/**
 * Feature vector as name-value pairs for self-documenting ML features
 * Uses dot notation for feature naming: hourOfDay.02, terminal.SEA, etc.
 */
export type FeatureVector = Record<string, number>;

/**
 * Encoded training data ready for ML model training
 * Contains feature matrices, target vectors, and feature names for debugging
 */
export type EncodedTrainingData = {
  x: FeatureVector[]; // Feature matrix (n_samples × n_features)
  y: number[]; // Target vector (n_samples)
  featureNames: string[]; // Feature names for debugging and interpretation
};

/**
 * Feature names array derived from FeatureVector keys
 * Ensures consistency across all feature vectors
 */
export type FeatureNames = string[];

// ============================================================================
// MODEL TYPES (Training Stage)
// ============================================================================

/**
 * Linear regression model parameters
 * Contains coefficients, intercept, and training metrics
 */
export type ModelParameters = {
  routeId: string;
  modelType: "departure" | "arrival";
  coefficients: number[];
  intercept: number;
  featureNames: string[];
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
 * Feature vector for prediction input
 * Must match the structure used during training
 */
export type PredictionInput = {
  routeId: string;
  prevArvTimeActual: number;
  fromTerminalAbrv: string;
  prevDepTimeSched: number;
  prevDepTime: number;
  currArvTimeActual: number;
  toTerminalAbrv: string;
  nextTerminalAbrv: string;
  currDepTimeSched: number;
  scheduledDeparture: number;
  isWeekday: boolean;
  isWeekend: boolean;
};

/**
 * Prediction output with predicted time and confidence
 */
export type PredictionOutput = {
  predictedTime: number; // Predicted departure time as timestamp
  confidence: number; // Prediction confidence (0.1 to 0.9)
  modelVersion: string; // Model version used for prediction
};

// ============================================================================
// UTILITY TYPES
// ============================================================================

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

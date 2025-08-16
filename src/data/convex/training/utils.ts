import type { TrainingExample } from "./types";

// ============================================================================
// SHARED UTILITY FUNCTIONS
// ============================================================================

/**
 * Converts a timestamp to normalized minutes since a fixed reference point
 * Used for training to keep coefficients manageable
 */
export const toNormalizedTimestamp = (timestamp: number): number => {
  const fixedYear = 2025;
  const yearStart = new Date(fixedYear, 0, 1);
  return (timestamp - yearStart.getTime()) / (60 * 1000);
};

/**
 * Converts normalized minutes back to absolute timestamp
 * Used for prediction output to convert back to real time
 */
export const fromNormalizedTimestamp = (normalizedMinutes: number): number => {
  const fixedYear = 2025;
  const yearStart = new Date(fixedYear, 0, 1);
  return yearStart.getTime() + normalizedMinutes * 60 * 1000;
};

/**
 * Creates 24 binary hour features (one-hot encoding)
 */
export const createHourFeatures = (
  timestamp: number
): readonly number[] & { length: 24 } => {
  const hour = new Date(timestamp).getHours();
  return Array.from({ length: 24 }, (_, i) =>
    hour === i ? 1 : 0
  ) as readonly number[] & { length: 24 };
};

/**
 * Determines if a timestamp is a weekday
 */
export const isWeekday = (timestamp: number): boolean =>
  new Date(timestamp).getDay() < 6;

// ============================================================================
// LIGHTWEIGHT PREDICTION FUNCTIONS
// ============================================================================

/**
 * Lightweight prediction function that replicates mljs math exactly
 * Can be used anywhere (client, server) without library overhead
 * Uses the same formula: prediction = intercept + Σ(coefficients[i] * features[i])
 */
export const predictWithCoefficients = (
  features: number[],
  coefficients: number[],
  intercept: number
): number => {
  // Validate feature count matches coefficients
  if (features.length !== coefficients.length) {
    throw new Error(
      `Feature count mismatch: expected ${coefficients.length}, got ${features.length}`
    );
  }

  // Use the exact same math as mljs: intercept + Σ(coefficients[i] * features[i])
  let prediction = intercept;
  for (let i = 0; i < features.length; i++) {
    prediction += coefficients[i] * features[i];
  }

  return prediction;
};

/**
 * Generates the standardized 8-feature vector used in both training and prediction
 */
export const generateFeatureVector = (
  hourFeatures: readonly number[] & { length: 24 },
  isWeekday: number,
  isWeekend: number,
  prevArvTimeActual: number,
  prevDepTimeSched: number,
  prevDepTimeActual: number,
  currArvTimeActual: number,
  currDepTimeSched: number
): number[] => [
  ...hourFeatures, // 24 binary hour features
  isWeekday, // 1 binary weekday feature
  isWeekend, // 1 binary weekend feature
  toNormalizedTimestamp(prevArvTimeActual), // Previous arrival time (normalized)
  toNormalizedTimestamp(prevDepTimeSched), // Previous scheduled departure (normalized)
  toNormalizedTimestamp(prevDepTimeActual), // Previous actual departure (normalized)
  toNormalizedTimestamp(currArvTimeActual), // Current arrival time (normalized)
  toNormalizedTimestamp(currDepTimeSched), // Current scheduled departure (normalized)
];

/**
 * Generates feature vector directly from a TrainingExample object
 * Delegates to generateFeatureVector with pre-calculated day-of-week features
 */
export const generateFeatureVectorFromExample = (
  example: TrainingExample
): number[] => {
  return generateFeatureVector(
    example.hourFeatures,
    example.isWeekday,
    example.isWeekend,
    example.prevArvTimeActual,
    example.prevDepTimeSched,
    example.prevDepTimeActual,
    example.currArvTimeActual,
    example.currDepTimeSched
  );
};

/**
 * Filters out outliers (trips with more than 2 hours delay)
 */
export const isNotOutlier = (example: {
  targetDepTimeActual: number;
  currDepTimeSched: number;
}): boolean => {
  const delay =
    Math.abs(example.targetDepTimeActual - example.currDepTimeSched) /
    (60 * 1000);
  return delay <= 120; // 2 hours in minutes
};

// ============================================================================
// STANDARDIZED RESPONSE HELPERS
// ============================================================================

/**
 * Creates a standardized error response
 */
export const createErrorResponse = <
  T extends { success: boolean; message: string },
>(
  message: string,
  additionalFields?: Partial<T>
): T =>
  ({
    success: false,
    message,
    ...additionalFields,
  }) as T;

/**
 * Creates a standardized success response
 */
export const createSuccessResponse = <
  T extends { success: boolean; message: string },
>(
  message: string,
  additionalFields?: Partial<T>
): T =>
  ({
    success: true,
    message,
    ...additionalFields,
  }) as T;

/**
 * Wraps async operations with standardized error handling
 */
export const withErrorHandling = async <T>(
  operation: () => Promise<T>,
  errorMessage: string,
  logError: (error: unknown) => void
): Promise<T | { success: false; message: string }> => {
  try {
    return await operation();
  } catch (error) {
    logError(error);
    return { success: false, message: `${errorMessage}: ${error}` };
  }
};

// ============================================================================
// PREDICTION INPUT SANITIZATION
// ============================================================================

/**
 * Sanitizes prediction input and returns features in the same shape as TrainingExample
 * Throws error if any required data is missing
 */
export const sanitizePredictionInput = (input: {
  prevTrip: {
    ArvDockActual?: number;
    ScheduledDeparture?: number;
    LeftDockActual?: number;
  };
  currTrip: {
    ScheduledDeparture: number;
    ArvDockActual?: number;
  };
}): Omit<TrainingExample, "targetDepTimeActual" | "routeId"> => {
  const { prevTrip, currTrip } = input;

  // Validate required fields
  if (!prevTrip.ArvDockActual) {
    throw new Error("Previous trip arrival time is required");
  }
  if (!prevTrip.ScheduledDeparture) {
    throw new Error("Previous trip scheduled departure is required");
  }
  if (!prevTrip.LeftDockActual) {
    throw new Error("Previous trip actual departure is required");
  }
  if (!currTrip.ArvDockActual) {
    throw new Error("Current trip arrival time is required");
  }
  if (!currTrip.ScheduledDeparture) {
    throw new Error("Current trip scheduled departure is required");
  }

  return {
    hourFeatures: createHourFeatures(currTrip.ScheduledDeparture),
    isWeekday: isWeekday(currTrip.ScheduledDeparture) ? 1 : 0,
    isWeekend: !isWeekday(currTrip.ScheduledDeparture) ? 1 : 0,
    prevArvTimeActual: prevTrip.ArvDockActual,
    prevDepTermAbrv: "", // Not used in feature generation
    prevDepTimeSched: prevTrip.ScheduledDeparture,
    prevDepTimeActual: prevTrip.LeftDockActual,
    currArvTimeActual: currTrip.ArvDockActual,
    currArvTermAbrv: "", // Not used in feature generation
    currDepTermAbrv: "", // Not used in feature generation
    currDepTimeSched: currTrip.ScheduledDeparture,
  };
};

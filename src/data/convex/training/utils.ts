import type { ConvexVesselTrip } from "@/data/types/convex/VesselTrip";
import { log } from "@/shared/lib/logger";

import type { ExampleData, PredictionInput } from "./types";

// ============================================================================
// SHARED UTILITY FUNCTIONS
// ============================================================================

/**
 * Converts a timestamp to normalized minutes since a fixed reference point
 * Used for training to keep coefficients manageable
 * Throws error if timestamp is zero or invalid
 */
export const toNormalizedTimestamp = (timestamp: number): number => {
  if (!timestamp || timestamp === 0) {
    throw new Error("Timestamp cannot be zero or falsy");
  }

  const fixedYear = 2025;
  const yearStart = new Date(fixedYear, 0, 1);
  return (timestamp - yearStart.getTime()) / (60 * 1000);
};

/**
 * Creates 24 binary hour features (one-hot encoding)
 * Throws error if timestamp is zero or invalid
 */
export const createHourFeatures = (
  timestamp: number
): readonly number[] & { length: 24 } => {
  if (!timestamp || timestamp === 0) {
    throw new Error("Timestamp cannot be zero or falsy");
  }

  const hour = new Date(timestamp).getHours();
  return Array.from({ length: 24 }, (_, i) =>
    hour === i ? 1 : 0
  ) as readonly number[] & { length: 24 };
};

/**
 * Determines if a timestamp is a weekday
 * Throws error if timestamp is zero or invalid
 */
export const isWeekday = (timestamp: number): boolean => {
  if (!timestamp || timestamp === 0) {
    throw new Error("Timestamp cannot be zero or falsy");
  }

  return new Date(timestamp).getDay() < 6;
};

// ============================================================================
// LIGHTWEIGHT PREDICTION FUNCTIONS
// ============================================================================

/**
 * Converts normalized minutes back to absolute timestamp
 * Used for prediction output to convert back to real time
 * Throws error if normalized minutes is zero or invalid
 */
export const fromNormalizedTimestamp = (normalizedMinutes: number): number => {
  if (!normalizedMinutes || normalizedMinutes === 0) {
    throw new Error("Normalized minutes cannot be zero or falsy");
  }

  const fixedYear = 2025;
  const yearStart = new Date(fixedYear, 0, 1);
  return yearStart.getTime() + normalizedMinutes * 60 * 1000;
};

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

// ============================================================================
// TERMINAL MAPPING
// ============================================================================

/**
 * All possible terminal abbreviations in alphabetical order
 * Used for consistent feature indexing across all routes
 */
const ALL_TERMINALS = [
  "ANA", // Anacortes
  "BBI", // Bainbridge Island
  "BRE", // Bremerton
  "CLI", // Clinton
  "COU", // Coupeville
  "EDM", // Edmonds
  "FAU", // Fauntleroy
  "FRH", // Friday Harbor
  "KIN", // Kingston
  "LOP", // Lopez Island
  "MUK", // Mukilteo
  "ORI", // Orcas Island
  "P52", // Seattle
  "POT", // Port Townsend
  "PTD", // Point Defiance
  "SHI", // Shaw Island
  "SID", // Sidney B.C.
  "SOU", // Southworth
  "TAH", // Tahlequah
  "VAI", // Vashon Island
] as const;

/**
 * Converts terminal abbreviation to one-hot encoded feature array
 * Throws error for invalid terminal abbreviations to ensure data quality
 */
const terminalToFeatures = (terminalAbbr: string): number[] => {
  const index = ALL_TERMINALS.indexOf(
    terminalAbbr as (typeof ALL_TERMINALS)[number]
  );
  if (index === -1) {
    throw new Error(`Invalid terminal abbreviation: ${terminalAbbr}`);
  }
  const features = new Array(ALL_TERMINALS.length).fill(0);
  features[index] = 1;
  return features;
};

// ============================================================================
// SHARED TRIP PROCESSING UTILITIES
// ============================================================================

/**
 * Creates a PredictionInput from a pair of consecutive trips
 * This is the shared logic used by both preprocessing and prediction
 */
export const createPredictionInput = ([prevTrip, currTrip]: [
  prevTrip: ConvexVesselTrip,
  currTrip: ConvexVesselTrip,
]): PredictionInput | null => {
  // Validate and extract required props
  const prevProps = extractPrevTripProps(prevTrip);
  const currProps = extractCurrTripProps(currTrip);
  const routeId = extractRouteId(currTrip);

  if (!prevProps || !currProps || !routeId || !currTrip.ScheduledDeparture)
    return null;

  return {
    // Route identification
    routeId,

    // Spread validated props (features computed on-demand in generateFeatureVector)
    ...prevProps,
    ...currProps,

    // For hourFeatures calculation (derived from currDepTimeSched)
    scheduledDeparture: currTrip.ScheduledDeparture,
  };
};

/**
 * Extracts and validates previous trip properties
 */
const extractPrevTripProps = (trip: ConvexVesselTrip) => {
  if (
    !trip.DepartingTerminalAbbrev ||
    !trip.ScheduledDeparture ||
    !trip.LeftDockActual ||
    !trip.ArvDockActual
  ) {
    return null;
  }

  // At this point TypeScript knows all properties exist
  return {
    prevArvTimeActual: trip.ArvDockActual,
    fromTerminalAbrv: trip.DepartingTerminalAbbrev,
    prevDepTimeSched: trip.ScheduledDeparture,
    prevDepTimeActual: trip.LeftDockActual,
  };
};

/**
 * Extracts and validates current trip properties
 */
const extractCurrTripProps = (trip: ConvexVesselTrip) => {
  if (
    !trip.ArvDockActual ||
    !trip.ArrivingTerminalAbbrev ||
    !trip.DepartingTerminalAbbrev ||
    !trip.ScheduledDeparture
  ) {
    return null;
  }

  // At this point TypeScript knows all properties exist
  return {
    currArvTimeActual: trip.ArvDockActual,
    toTerminalAbrv: trip.ArrivingTerminalAbbrev,
    nextTerminalAbrv: trip.DepartingTerminalAbbrev,
    currDepTimeSched: trip.ScheduledDeparture,
  };
};

/**
 * Extracts route ID if available
 */
const extractRouteId = (trip: ConvexVesselTrip): string | null =>
  trip.OpRouteAbbrev || null;

// ============================================================================
// FEATURE GENERATION
// ============================================================================

/**
 * Generates complete feature vector for departure prediction
 * 91 features total: 24 hour + 2 day + 5 timestamp + 60 terminal (3×20)
 * Throws error if required data is missing or invalid
 */
export const generateFeatureVector = (input: PredictionInput): number[] => {
  // Validate scheduledDeparture exists
  if (!input.scheduledDeparture) {
    throw new Error("Scheduled departure time is required");
  }

  // Terminal validation happens automatically in terminalToFeatures
  // If any terminal is invalid, it will throw an error

  return [
    ...createHourFeatures(input.scheduledDeparture), // 24 binary hour features
    isWeekday(input.scheduledDeparture) ? 1 : 0, // 1 binary weekday feature
    !isWeekday(input.scheduledDeparture) ? 1 : 0, // 1 binary weekend feature
    toNormalizedTimestamp(input.prevArvTimeActual), // Previous arrival time (normalized)
    toNormalizedTimestamp(input.prevDepTimeSched), // Previous scheduled departure (normalized)
    toNormalizedTimestamp(input.prevDepTimeActual), // Previous actual departure (normalized)
    toNormalizedTimestamp(input.currArvTimeActual), // Current arrival time (normalized)
    toNormalizedTimestamp(input.currDepTimeSched), // Current scheduled departure (normalized)
    ...terminalToFeatures(input.fromTerminalAbrv), // From terminal (one-hot encoded)
    ...terminalToFeatures(input.toTerminalAbrv), // To terminal (one-hot encoded)
    ...terminalToFeatures(input.nextTerminalAbrv), // Next terminal (one-hot encoded)
  ];
};

/**
 * Filters out outliers (trips with more than 2 hours delay)
 */
export const isNotOutlier = (example: ExampleData): boolean => {
  const delay =
    Math.abs(example.target.departureTime - example.input.currDepTimeSched) /
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

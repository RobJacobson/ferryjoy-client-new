import type { ConvexVesselTrip } from "@/data/types/convex/VesselTrip";
import { log } from "@/shared/lib/logger";

import type { ExampleData, FeatureVector, PredictionInput } from "./types";

// ============================================================================
// SHARED UTILITY FUNCTIONS
// ============================================================================

/**
 * Converts absolute timestamps to normalized minutes since a fixed reference point
 * Essential for ML training to keep coefficient values manageable and prevent overflow
 * Throws error if timestamp is zero or invalid for data integrity
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
 * Converts normalized minutes back to absolute timestamp for practical use
 * Reverses the normalization process to provide human-readable prediction times
 * Throws error if normalized minutes is zero or invalid for data integrity
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
 * Creates 24 binary hour features using one-hot encoding for ML models
 * Converts timestamp to hour-of-day representation for time-based pattern learning
 * Throws error if timestamp is zero or invalid for data integrity
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
 * Determines if a timestamp falls on a weekday (Monday-Friday)
 * Provides binary classification for day-of-week pattern recognition in ML models
 * Throws error if timestamp is zero or invalid for data integrity
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
 * Lightweight prediction function that replicates mljs mathematical operations exactly
 * Can be used anywhere (client, server) without external library overhead
 * Implements the standard linear regression formula: prediction = intercept + Σ(coefficients[i] * features[i])
 */
export const predictWithCoefficients = (
  features: FeatureVector,
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

// ============================================================================
// SHARED TRIP PROCESSING UTILITIES
// ============================================================================

/**
 * Creates a PredictionInput from a pair of consecutive trips
 * Implements fail-fast validation strategy - throws descriptive errors for any invalid data
 * This is the shared logic used by both preprocessing and prediction
 *
 * For active trips (current trip), uses current timestamp as proxy for arrival time
 */
export const toPredictionInput = ([prevTrip, currTrip]: [
  prevTrip: ConvexVesselTrip,
  currTrip: ConvexVesselTrip,
]): PredictionInput | null => {
  if (
    !currTrip.OpRouteAbbrev ||
    !prevTrip.ArvDockActual ||
    !prevTrip.DepartingTerminalAbbrev ||
    !prevTrip.ScheduledDeparture ||
    !prevTrip.LeftDockActual ||
    !currTrip.DepartingTerminalAbbrev ||
    !currTrip.ScheduledDeparture
  ) {
    return null; // Will be filtered out
  }

  // For active trips, use current timestamp as proxy for arrival time
  const currArvTimeActual = currTrip.ArvDockActual || currTrip.TimeStamp;

  return {
    // Route identification
    routeId: currTrip.OpRouteAbbrev,

    // PrevTrip
    prevArvTimeActual: prevTrip.ArvDockActual,
    fromTerminalAbrv: prevTrip.DepartingTerminalAbbrev,
    prevDepTimeSched: prevTrip.ScheduledDeparture,
    prevDepTimeActual: prevTrip.LeftDockActual,

    // CurrTrip
    currArvTimeActual,
    toTerminalAbrv: currTrip.ArrivingTerminalAbbrev || "",
    nextTerminalAbrv: currTrip.DepartingTerminalAbbrev,
    currDepTimeSched: currTrip.ScheduledDeparture,

    // For hourFeatures calculation (derived from currDepTimeSched)
    scheduledDeparture: currTrip.ScheduledDeparture,
  };
};

// ============================================================================
// FEATURE GENERATION
// ============================================================================

/**
 * Converts a validated PredictionInput to a strongly-typed feature vector for ML models
 * Assumes input is valid (validation handled in toPredictionInput)
 * Returns FeatureVector type that ensures 91 features with correct structure
 */
export const toPredictionVector = (input: PredictionInput): FeatureVector => {
  // No validation needed - input is guaranteed valid from toPredictionInput
  const features = [
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

  // TypeScript will ensure this array has exactly 91 elements
  return features as FeatureVector;
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

/**
 * Converts terminal abbreviation to one-hot encoded feature array
 * Throws error for invalid terminal abbreviations to ensure data quality
 */
const terminalToFeatures = (terminalAbbr: string | undefined): number[] => {
  if (!terminalAbbr) {
    throw new Error("Missing terminal abbreviation");
  }

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

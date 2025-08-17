import type { VesselTrip } from "@/data/types/domain/VesselTrip";

import type { FeatureInput, FeatureVector, TrainingExample } from "./types";

// ============================================================================
// HIGH-LEVEL ML FUNCTIONS (Primary API)
// ============================================================================

/**
 * Converts a validated PredictionInput to a strongly-typed feature vector for ML models
 *
 * This function creates the complete 91-feature vector used by all ML models.
 * The feature structure is:
 * - 24 hour features (one-hot encoded)
 * - 2 day features (weekday/weekend)
 * - 5 timestamp features (normalized to minutes since 2025)
 * - 60 terminal features (3 terminals × 20 possible terminals each)
 *
 * Feature Order:
 * 1. Hour features (0-23): createHourFeatures()
 * 2. Day features (24-25): isWeekday, isWeekend
 * 3. Timestamp features (26-30): normalized arrival/departure times
 * 4. Terminal features (31-90): one-hot encoded terminal sequences
 *
 * @param input - Validated prediction input (guaranteed valid from toPredictionInput)
 * @returns FeatureVector with exactly 91 features in correct order
 */
export const toPredictionVector = (input: FeatureInput): FeatureVector => {
  // No validation needed - input is guaranteed valid from toPredictionInput
  const features = [
    // Hour features (24): one-hot encoding of scheduled departure hour
    ...createHourFeatures(input.scheduledDeparture),

    // Day features (2): binary weekday/weekend classification
    input.isWeekday ? 1 : 0,
    input.isWeekend ? 1 : 0,

    // Timestamp features (5): normalized timing information (minutes since 2025)
    toNormalizedMinutes(input.prevArvTimeActual), // Previous arrival time
    toNormalizedMinutes(input.prevDepTimeSched), // Previous scheduled departure
    toNormalizedMinutes(input.prevDepTime), // Previous actual departure
    toNormalizedMinutes(input.currArvTimeActual), // Current arrival time
    toNormalizedMinutes(input.currDepTimeSched), // Current scheduled departure

    // Terminal features (60): one-hot encoding of terminal sequences
    ...terminalToFeatures(input.fromTerminalAbrv), // From terminal (20 features)
    ...terminalToFeatures(input.toTerminalAbrv), // To terminal (20 features)
    ...terminalToFeatures(input.nextTerminalAbrv), // Next terminal (20 features)
  ];

  // TypeScript will ensure this array has exactly 91 elements
  return features as FeatureVector;
};

/**
 * Lightweight prediction function that replicates mljs mathematical operations exactly
 *
 * This function implements the standard linear regression formula:
 * prediction = intercept + Σ(coefficients[i] * features[i])
 *
 * Benefits of this implementation:
 * - No external library dependencies
 * - Can be used on client or server
 * - Guaranteed to match mljs training results
 * - Lightweight and fast
 *
 * @param features - Feature vector (must match coefficient count)
 * @param coefficients - Model coefficients from training
 * @param intercept - Model intercept from training
 * @returns Predicted value
 * @throws Error if feature count doesn't match coefficient count
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
// FEATURE ENGINEERING FUNCTIONS
// ============================================================================

/**
 * Creates 24 binary hour features using one-hot encoding for ML models
 *
 * One-hot encoding represents the hour of day as a binary vector where:
 * - Each position represents an hour (0-23)
 * - Only the current hour position is set to 1
 * - All other positions are set to 0
 *
 * This enables the ML model to learn time-of-day patterns without
 * assuming linear relationships between hours.
 *
 * @param timestamp - Unix timestamp in milliseconds
 * @returns Array of 24 binary values representing the hour of day
 * @throws Error if timestamp is zero or invalid
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

// ============================================================================
// TIMESTAMP NORMALIZATION FUNCTIONS
// ============================================================================

const TIMESTAMP_REFERENCE_DATE = new Date(2025, 0, 1);

/**
 * Converts absolute timestamps to normalized minutes since a fixed reference point
 *
 * Normalization is essential for ML training to:
 * - Keep coefficient values manageable (prevent overflow)
 * - Improve numerical stability during training
 * - Enable consistent feature scaling across different time periods
 *
 * @param timestamp - Date object to normalize
 * @returns Minutes since January 1, 2025 (normalized to prevent negative values)
 * @throws Error if timestamp is zero or null
 */
export const toNormalizedMinutes = (timestamp: Date | null): number => {
  if (!timestamp || timestamp.getTime() === 0) {
    throw new Error("Timestamp cannot be zero or null");
  }

  return (
    (TIMESTAMP_REFERENCE_DATE.getTime() - timestamp.getTime()) / (60 * 1000)
  );
};

/**
 * Converts normalized minutes back to absolute timestamp for practical use
 *
 * This is the inverse operation of toNormalizedTimestampMinutes, used to:
 * - Convert ML predictions back to human-readable times
 * - Display results in the user interface
 * - Validate predictions against actual timestamps
 *
 * @param normalizedMinutes - Minutes since January 1, 2025
 * @returns Date object representing the denormalized timestamp
 * @throws Error if normalized minutes is zero
 */
export const fromNormalizedMInutes = (normalizedMinutes: number): Date => {
  if (normalizedMinutes === 0) {
    throw new Error("Normalized minutes cannot be zero");
  }

  return new Date(
    TIMESTAMP_REFERENCE_DATE.getTime() + normalizedMinutes * 60 * 1000
  );
};

// ============================================================================
// TERMINAL FEATURE ENCODING FUNCTIONS
// ============================================================================

/**
 * All possible terminal abbreviations in alphabetical order
 *
 * This array serves as the canonical mapping for terminal features:
 * - Used for consistent feature indexing across all routes
 * - Enables one-hot encoding of terminal information
 * - Must be kept in sync with actual WSF terminal abbreviations
 *
 * Terminal codes follow WSF naming conventions:
 * - 3-letter codes for most terminals
 * - Special codes like "P52" for Seattle Pier 52
 * - "SID" for international terminal (Sidney, B.C.)
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
  "P52", // Seattle Pier 52
  "POT", // Port Townsend
  "PTD", // Point Defiance
  "SHI", // Shaw Island
  "SID", // Sidney B.C. (International)
  "SOU", // Southworth
  "TAH", // Tahlequah
  "VAI", // Vashon Island
] as const;

/**
 * Converts terminal abbreviation to one-hot encoded feature array
 *
 * One-hot encoding represents terminal selection as a binary vector:
 * - Array length matches ALL_TERMINALS (20 terminals)
 * - Only the selected terminal position is set to 1
 * - All other positions are set to 0
 *
 * This enables the ML model to learn terminal-specific patterns
 * without assuming ordinal relationships between terminals.
 *
 * @param terminalAbbr - Terminal abbreviation to encode
 * @returns Array of 20 binary values (one-hot encoded terminal)
 * @throws Error if terminal abbreviation is missing or invalid
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

  // Create one-hot encoded array: all zeros except selected terminal
  const features = new Array(ALL_TERMINALS.length).fill(0);
  features[index] = 1;
  return features;
};

// ============================================================================
// GENERIC UTILITY FUNCTIONS
// ============================================================================

/**
 * Generic type for grouping items by string keys
 */
type Group<T> = Record<string, T[]>;

/**
 * Function type for extracting grouping keys from items
 */
type KeyExtractor<T> = (item: T) => string;

/**
 * Creates a grouping function for any collection of items
 *
 * This is a higher-order function that returns a reducer function
 * for grouping items by extracted keys. It's used throughout the
 * codebase for route-based grouping and other categorization needs.
 *
 * @param keyExtractor - Function that extracts the grouping key from an item
 * @returns Reducer function that groups items by extracted keys
 *
 * @example
 * ```typescript
 * const groupByRoute = groupListItem((trip) => trip.OpRouteAbbrev);
 * const routeGroups = trips.reduce(groupByRoute, {});
 * ```
 */
export const groupListItem =
  <T>(keyExtractor: KeyExtractor<T>) =>
  (acc: Group<T>, item: T): Group<T> => {
    const key = keyExtractor(item);
    if (!key) {
      return acc; // Skip items without valid keys
    }

    // Initialize group array if it doesn't exist
    const group = acc[key] || [];
    group.push(item);
    acc[key] = group;
    return acc;
  };

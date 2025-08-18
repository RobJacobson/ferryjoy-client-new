// ============================================================================
// SHARED UTILITIES (Used across multiple ML pipelines)
// ============================================================================

import type { FeatureVector } from "./types";

// ============================================================================
// TIMESTAMP UTILITIES
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
 * This is the inverse operation of toNormalizedMinutes, used to:
 * - Convert ML predictions back to human-readable times
 * - Display results in the user interface
 * - Validate predictions against actual timestamps
 *
 * @param normalizedMinutes - Minutes since January 1, 2025
 * @returns Date object representing the denormalized timestamp
 * @throws Error if normalized minutes is zero
 */
export const fromNormalizedMinutes = (normalizedMinutes: number): Date => {
  if (normalizedMinutes === 0) {
    throw new Error("Normalized minutes cannot be zero");
  }

  return new Date(
    TIMESTAMP_REFERENCE_DATE.getTime() + normalizedMinutes * 60 * 1000
  );
};

// ============================================================================
// GENERIC UTILITIES
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

// ============================================================================
// FEATURE VECTOR ANALYSIS UTILITIES
// ============================================================================

/**
 * Gets the total number of features in a feature vector
 *
 * @param features - Feature vector to analyze
 * @returns Number of features
 */
export const getFeatureCount = (features: FeatureVector): number =>
  Object.keys(features).length;

/**
 * Gets all feature names from a feature vector
 *
 * @param features - Feature vector to analyze
 * @returns Array of feature names
 */
export const getFeatureNames = (features: FeatureVector): string[] =>
  Object.keys(features);

/**
 * Checks if a feature vector contains a specific feature
 *
 * @param features - Feature vector to check
 * @param featureName - Name of the feature to look for
 * @returns True if the feature exists, false otherwise
 */
export const hasFeature = (
  features: FeatureVector,
  featureName: string
): boolean => featureName in features;

/**
 * Gets the value of a specific feature
 *
 * @param features - Feature vector to extract from
 * @param featureName - Name of the feature to extract
 * @returns Feature value or undefined if not found
 */
export const getFeatureValue = (
  features: FeatureVector,
  featureName: string
): number | undefined => features[featureName];

// ============================================================================
// VESSEL TRIP VALIDATION UTILITIES
// ============================================================================

/**
 * Validates that a vessel trip has all required fields for ML processing
 * Checks that optional fields are provided and have valid values
 *
 * @param trip - Vessel trip to validate
 * @returns True if the trip is valid for ML processing
 */
export const isValidVesselTrip = (trip: {
  OpRouteAbbrev: string | null;
  ArrivingTerminalAbbrev: string | null;
  DepartingTerminalAbbrev: string | null;
  ScheduledDeparture: Date | null;
  ArvDockActual: Date | null;
  LeftDock: Date | null;
}): boolean => {
  return !!(
    trip.OpRouteAbbrev &&
    trip.ArrivingTerminalAbbrev &&
    trip.DepartingTerminalAbbrev &&
    trip.ScheduledDeparture &&
    trip.ArvDockActual &&
    trip.LeftDock
  );
};

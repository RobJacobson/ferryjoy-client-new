// ============================================================================
// SHARED TYPES (Used across multiple pipelines)
// ============================================================================

import type { VesselTrip } from "@/data/types/domain/VesselTrip";

/**
 * Feature vector as name-value pairs for self-documenting ML features
 * Uses dot notation for feature naming: hourOfDay.02, terminal.SEA, etc.
 */
export type FeatureVector = Record<string, number>;

/**
 * Feature names array derived from FeatureVector keys
 * Ensures consistency across all feature vectors
 */
export type FeatureNames = string[];

/**
 * Vessel trip with all required fields guaranteed to be present
 * This type eliminates the need for null checks in subsequent pipeline functions
 */
export type ValidatedVesselTrip = VesselTrip & {
  OpRouteAbbrev: string;
  ArrivingTerminalID: number;
  ArrivingTerminalName: string;
  ArrivingTerminalAbbrev: string;
  ScheduledDeparture: Date;
  ArvDockActual: Date;
  LeftDock: Date;
};

/**
 * Pair of consecutive vessel trips used for feature extraction
 * This is the output of the loading stage and input to the encoding stage
 */
export type VesselTripPair = {
  prevTrip: ValidatedVesselTrip;
  currTrip: ValidatedVesselTrip;
  routeId: string;
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

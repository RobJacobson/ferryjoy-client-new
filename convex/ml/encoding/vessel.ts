// ============================================================================
// VESSEL-SPECIFIC FEATURE ENCODING
// ============================================================================

import { toNormalizedMinutes } from "../shared";
import type {
  FeatureVector,
  ValidatedVesselTrip,
  VesselTripFeatures,
} from "../types";
import { encodeFeatures } from "./core";

/**
 * All possible terminal abbreviations in alphabetical order
 *
 * This array serves as the canonical mapping for terminal features:
 * - Used for consistent feature indexing across all routes
 * - Enables one-hot encoding of terminal information
 * - Must be kept in sync with actual WSF terminal abbreviations
 * - Order is fixed for ML algorithm consistency
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

/**
 * Extracts structured features from a pair of consecutive vessel trips
 * Creates the VesselTripFeatures structure that will be flattened in the encoding stage
 *
 * This function handles the vessel-specific logic for:
 * - Hour of day features (one-hot encoded as 24 binary features)
 * - Day type features (weekday/weekend binary classification)
 * - Timestamp features (normalized to minutes since reference)
 * - Terminal features (string identifiers for one-hot encoding)
 *
 * @param prevTrip - Previous vessel trip in the sequence
 * @param currTrip - Current vessel trip to extract features from
 * @returns VesselTripFeatures with structured features before flattening
 */
export const extractVesselTripFeatures = (
  prevTrip: ValidatedVesselTrip,
  currTrip: ValidatedVesselTrip
): VesselTripFeatures => {
  // Extract hour of day (0-23) and create binary array
  const hour = currTrip.ScheduledDeparture.getHours();
  const hourOfDay = Array.from({ length: 24 }, (_, i) => (i === hour ? 1 : 0));

  // Extract day type features
  const dayOfWeek = currTrip.ScheduledDeparture.getDay();
  const dayType = {
    isWeekday: dayOfWeek < 6 ? 1 : 0,
    isWeekend: dayOfWeek >= 6 ? 1 : 0,
  };

  // Extract timestamp features (normalized to minutes since reference)
  const timestamps = {
    prevArvTimeActual: toNormalizedMinutes(prevTrip.ArvDockActual),
    prevDepTimeSched: toNormalizedMinutes(prevTrip.ScheduledDeparture),
    prevDepTime: toNormalizedMinutes(prevTrip.LeftDock),
    currArvTimeActual: toNormalizedMinutes(currTrip.ArvDockActual),
    currDepTimeSched: toNormalizedMinutes(currTrip.ScheduledDeparture),
  };

  // Extract terminal features
  const terminals = {
    from: prevTrip.DepartingTerminalAbbrev,
    to: currTrip.ArrivingTerminalAbbrev,
    next: currTrip.DepartingTerminalAbbrev,
  };

  return {
    hourOfDay,
    dayType,
    timestamps,
    terminals,
  };
};

/**
 * Extracts features directly from vessel trip pairs for prediction
 * This is a convenience function that combines feature extraction and encoding
 *
 * @param prevTrip - Previous vessel trip in the sequence
 * @param currTrip - Current vessel trip to extract features from
 * @returns FeatureVector ready for prediction
 */
export const extractPredictionFeatures = (
  prevTrip: ValidatedVesselTrip,
  currTrip: ValidatedVesselTrip
): FeatureVector => {
  const features = extractVesselTripFeatures(prevTrip, currTrip);
  return extractVesselFeatures(features);
};

/**
 * Extracts vessel-specific features from VesselTripFeatures and converts to FeatureVector
 *
 * This function handles the vessel-specific logic for:
 * - Hour of day features (one-hot encoded as 24 binary features)
 * - Day type features (weekday/weekend binary classification)
 * - Timestamp features (normalized to minutes since reference)
 * - Terminal features (one-hot encoded for 3 terminals × 20 possible terminals)
 *
 * @param features - Structured vessel trip features
 * @returns FeatureVector with dot-notation naming (e.g., hourOfDay.02, terminal.SEA)
 */
export const extractVesselFeatures = (
  features: VesselTripFeatures
): FeatureVector => {
  // Convert structured features to flat format for encoding
  const flatFeatures = {
    // Hour features: convert array to individual features
    hourOfDay: features.hourOfDay,

    // Day type features: already flat
    dayType: features.dayType,

    // Timestamp features: already flat
    timestamps: features.timestamps,

    // Terminal features: convert to one-hot encoded arrays
    terminals: {
      from: terminalToFeatures(features.terminals.from),
      to: terminalToFeatures(features.terminals.to),
      next: terminalToFeatures(features.terminals.next),
    },
  };

  // Use generic encoding to flatten with dot notation
  return encodeFeatures(flatFeatures);
};

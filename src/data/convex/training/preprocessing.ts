import { api } from "@/data/convex/_generated/api";
import { internalAction } from "@/data/convex/_generated/server";
import type { ConvexVesselTrip } from "@/data/types/convex/VesselTrip";
import { log } from "@/shared/lib/logger";

import type { TrainingExample } from "./types";
import {
  createHourFeatures,
  generateFeatureVectorFromExample,
  isWeekday,
  toNormalizedTimestamp,
} from "./utils";

// ============================================================================
// MAIN FUNCTION
// ============================================================================

/**
 * Extracts training examples from completed vessel trips
 * Single functional pipeline: load → process → filter → encode
 */
export const extractPredictionFeatures = internalAction({
  args: {},
  handler: async (ctx) => {
    log.info("Starting feature extraction for prediction models");

    try {
      // Functional pipeline: trips → training examples → split examples
      const trips: ConvexVesselTrip[] = await ctx.runQuery(
        api.functions.vesselTrips.queries.getCompletedTrips
      );

      const examples: {
        training: TrainingExample[];
        validation: TrainingExample[];
      } = trips
        .map(toExamplePairs)
        .filter((x) => x !== null)
        .map(createTrainingExample)
        .filter((x): x is TrainingExample => x !== null)
        .reduce(toSplitExamples, { training: [], validation: [] } as {
          training: TrainingExample[];
          validation: TrainingExample[];
        });

      log.info(
        `Extracted and split data: ${examples.training.length} training, ${examples.validation.length} validation`
      );

      return {
        success: true,
        trainingExamples: examples.training,
        validationExamples: examples.validation,
        message: `Successfully extracted features from ${examples.training.length + examples.validation.length} trips`,
      };
    } catch (error) {
      log.error("Feature extraction failed:", error);
      return {
        success: false,
        message: `Feature extraction failed: ${error}`,
      };
    }
  },
});

// ============================================================================
// TRAINING DATA PREPARATION
// ============================================================================

/**
 * Prepares training data with normalized timestamps for manageable coefficients
 */
export const prepareTrainingData = (
  examples: TrainingExample[]
): { x: number[][]; y: number[] } => {
  // Map examples to feature vectors
  const features = examples.map(generateFeatureVectorFromExample);

  // Map examples to normalized target values
  const targets = examples.map((example) =>
    toNormalizedTimestamp(example.targetDepTimeActual)
  );

  // Combine into final structure
  return {
    x: features,
    y: targets,
  };
};

// ============================================================================
// HELPER FUNCTIONS (in order of use)
// ============================================================================

/**
 * Creates training examples from trip pairs
 */
const createTrainingExample = ([prevTrip, currTrip]: [
  prevTrip: ConvexVesselTrip,
  currTrip: ConvexVesselTrip,
]): TrainingExample | null => {
  // Validate and extract required props
  const prevProps = extractPrevTripProps(prevTrip);
  const currProps = extractCurrTripProps(currTrip);
  const routeId = extractRouteId(currTrip);

  if (
    !prevProps ||
    !currProps ||
    !routeId ||
    !currTrip.ScheduledDeparture ||
    !currTrip.LeftDockActual
  )
    return null;

  return {
    // Route identification
    routeId,

    // Temporal features (24 binary hour features)
    hourFeatures: createHourFeatures(currTrip.ScheduledDeparture),
    isWeekday: isWeekday(currTrip.ScheduledDeparture) ? 1 : 0,
    isWeekend: !isWeekday(currTrip.ScheduledDeparture) ? 1 : 0,

    // Spread validated props
    ...prevProps,
    ...currProps,

    // Target variable for training (departure time)
    targetDepTimeActual: currTrip.LeftDockActual,
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
    prevDepTermAbrv: trip.DepartingTerminalAbbrev,
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
    currArvTermAbrv: trip.ArrivingTerminalAbbrev,
    currDepTermAbrv: trip.DepartingTerminalAbbrev,
    currDepTimeSched: trip.ScheduledDeparture,
  };
};

/**
 * Extracts route ID if available
 */
const extractRouteId = (trip: ConvexVesselTrip): string | null =>
  trip.OpRouteAbbrev || null;

/**
 * Creates pairs of consecutive trips for training
 */
const toExamplePairs = (
  trip: ConvexVesselTrip,
  idx: number,
  trips: ConvexVesselTrip[]
): [ConvexVesselTrip, ConvexVesselTrip] | null =>
  idx === 0 ? null : [trips[idx - 1], trip];

/**
 * Splits examples into training and validation sets using timestamp-based randomization
 */
const toSplitExamples = (
  acc: { training: TrainingExample[]; validation: TrainingExample[] },
  example: TrainingExample
) =>
  example.currDepTimeSched % 5 !== 0
    ? { ...acc, training: [...acc.training, example] }
    : { ...acc, validation: [...acc.validation, example] };

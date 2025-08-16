import { api } from "@/data/convex/_generated/api";
import { internalAction } from "@/data/convex/_generated/server";
import type { ConvexVesselTrip } from "@/data/types/convex/VesselTrip";
import { log } from "@/shared/lib/logger";

import type { ExampleData, PredictionInput } from "./types";
import {
  createPredictionInput,
  generateFeatureVector,
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
      // Functional pipeline: trips → training examples → filter invalid terminals → split examples
      const trips: ConvexVesselTrip[] = await ctx.runQuery(
        api.functions.vesselTrips.queries.getCompletedTrips
      );

      const examples: {
        training: ExampleData[];
        validation: ExampleData[];
      } = trips
        .map(toExamplePairs)
        .filter((x) => x !== null)
        .map(createTrainingExample)
        .filter((x): x is ExampleData => x !== null)
        .reduce(toSplitExamples, { training: [], validation: [] } as {
          training: ExampleData[];
          validation: ExampleData[];
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
  examples: ExampleData[]
): { x: number[][]; y: number[] } => {
  // Map examples to feature vectors with validation
  const features: number[][] = [];
  const targets: number[] = [];

  examples.forEach((example) => {
    try {
      // Validate and generate features - if this throws, skip the example
      const featureVector = generateFeatureVector(example.input);
      features.push(featureVector);

      // If we get here, validation passed, so add the target
      targets.push(toNormalizedTimestamp(example.target.departureTime));
    } catch (error) {
      // Skip examples with invalid data
      log.warn(`Skipping example with invalid data: ${error}`);
    }
  });

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
]): ExampleData | null => {
  // Use shared utility to create PredictionInput
  const input = createPredictionInput([prevTrip, currTrip]);

  if (!input || !currTrip.LeftDockActual) return null;

  return {
    input,
    target: {
      departureTime: currTrip.LeftDockActual,
    },
  };
};

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
 * Splits examples into training and validation sets using index-based randomization
 */
const toSplitExamples = (
  acc: { training: ExampleData[]; validation: ExampleData[] },
  example: ExampleData,
  index: number
) =>
  index % 5 !== 0
    ? { ...acc, training: [...acc.training, example] }
    : { ...acc, validation: [...acc.validation, example] };

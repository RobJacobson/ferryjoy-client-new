import { api } from "@convex/_generated/api";
import type { ActionCtx } from "@convex/_generated/server";
import { internalAction } from "@convex/_generated/server";

import type { ConvexVesselTrip } from "@/data/types/convex/VesselTrip";
import { log } from "@/shared/lib/logger";

import type { ExampleData } from "./types";
import {
  toNormalizedTimestamp,
  toPredictionInput,
  toPredictionVector,
} from "./utils";

/**
 * Main preprocessing pipeline for ML training data preparation
 * Orchestrates the extraction of prediction features from vessel trip data
 * Creates training examples by pairing consecutive trips and splitting into training/validation sets
 */
export const loadPredictionInputs = internalAction({
  args: {},
  handler: async (
    ctx
  ): Promise<{
    trainingExamples: ExampleData[];
    validationExamples: ExampleData[];
  }> => {
    // Step 1: Load and validate completed vessel trip data from database
    const trainingItems = await loadTrainingData(ctx);

    // Step 2: Transform vessel trips into training examples using sliding window pairs
    const examples = createTrainingExamples(trainingItems);

    // Step 3: Split examples into training (80%) and validation (20%) sets for ML pipeline
    const result = splitData(examples);

    // Log important info locally instead of passing up
    log.info(
      `Successfully extracted features from ${result.training.length + result.validation.length} trips`
    );

    return {
      trainingExamples: result.training,
      validationExamples: result.validation,
    };
  },
});

// ============================================================================
// HELPER FUNCTIONS (in numerical order of execution)
// ============================================================================

/**
 * Step 1: Loads and validates training data from completed vessel trips
 * Queries database for completed trips and ensures sufficient data availability
 */
const loadTrainingData = async (
  ctx: ActionCtx
): Promise<ConvexVesselTrip[]> => {
  const trainingItems = await ctx.runQuery(
    api.functions.vesselTrips.queries.getCompletedTrips
  );

  if (!trainingItems?.length) {
    throw new Error("No training data available");
  }

  return trainingItems;
};

/**
 * Step 2: Transforms vessel trip data into training examples using sliding window pairs
 * Creates consecutive trip pairs and converts them to ML-ready training examples
 */
const createTrainingExamples = (
  trainingItems: ConvexVesselTrip[]
): ExampleData[] => {
  const examples = createPairs(trainingItems)
    .map((pair) => toTrainingExample(pair))
    .filter((example): example is ExampleData => example !== null);

  if (!examples.length) {
    throw new Error("No valid training examples could be created");
  }

  return examples;
};

/**
 * Step 3: Splits training examples into training (80%) and validation (20%) sets
 * Ensures proper data distribution for ML model training and evaluation
 */
const splitData = (examples: ExampleData[]) => {
  return examples.reduce(toSplitExamples, {
    training: [],
    validation: [],
  });
};

// ============================================================================
// TRAINING DATA PREPARATION
// ============================================================================

/**
 * Converts training examples into ML-ready feature matrices and target vectors
 * Normalizes timestamps and validates feature vectors for optimal model training
 */
export const prepareTrainingData = (
  examples: ExampleData[]
): { x: number[][]; y: number[] } => {
  const validExamples = examples.filter((example) => {
    try {
      toPredictionVector(example.input);
      return true;
    } catch {
      return false;
    }
  });

  return {
    x: validExamples.map((example) => [...toPredictionVector(example.input)]),
    y: validExamples.map((example) =>
      toNormalizedTimestamp(example.target.departureTime)
    ),
  };
};

/**
 * Creates sliding window pairs from sequential data: [(a,b), (b,c), (c,d)]
 * Generates consecutive pairs for time-series analysis and training example creation
 */
const createPairs = <T>(data: T[]): [T, T][] =>
  data.slice(0, -1).map((item, i) => [item, data[i + 1]]);

/**
 * Converts vessel trip pairs into ML training examples
 * Extracts target values and creates structured input-target pairs for model training
 */
const toTrainingExample = ([prevData, currData]: [
  prevData: ConvexVesselTrip,
  currData: ConvexVesselTrip,
]): ExampleData | null => {
  const targetValue = getTargetValue(currData);
  if (targetValue === null) return null;

  const input = toPredictionInput([prevData, currData]);
  if (input === null) return null;

  return {
    input,
    target: { departureTime: targetValue },
  };
};

/**
 * Extracts the target departure time from vessel trip data for ML training
 * Currently vessel-specific but designed for future abstraction to generic data types
 */
const getTargetValue = (data: ConvexVesselTrip): number | null => {
  return data.LeftDockActual || null;
};

/**
 * Splits training examples into training (80%) and validation (20%) sets
 * Uses modulo-based distribution for consistent and reproducible data splitting
 */
const toSplitExamples = (
  acc: { training: ExampleData[]; validation: ExampleData[] },
  example: ExampleData,
  index: number
) =>
  index % 5 !== 0
    ? { ...acc, training: [...acc.training, example] }
    : { ...acc, validation: [...acc.validation, example] };

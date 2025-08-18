// ============================================================================
// ML PIPELINE ORCHESTRATION
// ============================================================================

import { internal } from "@convex/_generated/api";
import type { ActionCtx } from "@convex/_generated/server";

import {
  extractVesselFeatures,
  extractVesselTripFeatures,
  validateFeatureVectors,
} from "../encoding";
import type {
  EncodedTrainingData,
  FeatureNames,
  FeatureVector,
  TrainingExample,
  ValidatedVesselTrip,
  VesselTripFeatures,
  VesselTripPair,
} from "../types";

/**
 * Orchestrates the refactored loading and encoding stages of the ML pipeline
 * 1. Loading: Vessel trip data → Vessel trip pairs
 * 2. Encoding: Vessel trip pairs → Feature vectors + targets
 *
 * This provides a clean separation of concerns and enables
 * model-agnostic input processing for future extensibility.
 */
export const extractAndEncodeFeatures = async (
  ctx: ActionCtx
): Promise<EncodedTrainingData> => {
  // Stage 1: Loading - Extract vessel trip pairs
  const { trainingPairs, validationPairs } = await ctx.runAction(
    internal.ml.training.loadPredictionInputs,
    {}
  );

  // Stage 2: Encoding - Convert pairs to feature vectors and targets
  const { trainingExamples, validationExamples } = encodeTrainingExamples(
    trainingPairs,
    validationPairs
  );

  // Stage 3: Feature validation and encoding
  const allExamples = [...trainingExamples, ...validationExamples];
  const featureVectors = allExamples.map((example) =>
    extractVesselFeatures(example.input)
  );
  const featureNames = validateFeatureVectors(featureVectors);

  // Stage 4: Prepare final encoded data
  const x = featureVectors;
  const y = allExamples.map((example) => example.target.delayMinutes);

  return {
    x,
    y,
    featureNames,
  };
};

/**
 * Converts vessel trip pairs to training examples with features and targets
 * This is the encoding stage that transforms raw data into ML-ready format
 */
const encodeTrainingExamples = (
  trainingPairs: VesselTripPair[],
  validationPairs: VesselTripPair[]
): {
  trainingExamples: TrainingExample[];
  validationExamples: TrainingExample[];
} => {
  // Convert pairs to training examples using feature extraction
  const trainingExamples = trainingPairs.map((pair) => ({
    input: extractVesselTripFeatures(pair.prevTrip, pair.currTrip),
    target: { delayMinutes: calculateDelayMinutes(pair.currTrip) },
  }));

  const validationExamples = validationPairs.map((pair) => ({
    input: extractVesselTripFeatures(pair.prevTrip, pair.currTrip),
    target: { delayMinutes: calculateDelayMinutes(pair.currTrip) },
  }));

  return { trainingExamples, validationExamples };
};

/**
 * Calculates delay in minutes for a vessel trip
 * Positive values indicate late departure, negative values indicate early departure
 */
const calculateDelayMinutes = (trip: ValidatedVesselTrip): number => {
  const scheduledTime = trip.ScheduledDeparture.getTime();
  const actualTime = trip.LeftDock.getTime();
  return (actualTime - scheduledTime) / (1000 * 60);
};

/**
 * Pipeline stage for feature validation
 * Exported for direct access when only validation is needed
 */
/**
 * Pipeline stage for encoding features
 * Exported for direct access when only encoding is needed
 */
export { extractVesselFeatures, validateFeatureVectors } from "../encoding";
/**
 * Pipeline stage for loading vessel trip data
 * Exported for direct access when only loading is needed
 */
export { loadPredictionInputs } from "./loading";

// ============================================================================
// ML PIPELINE ORCHESTRATION
// ============================================================================

import { internal } from "@convex/_generated/api";
import type { ActionCtx } from "@convex/_generated/server";

import { validateFeatureVectors } from "./encoding";
import type {
  EncodedTrainingData,
  FeatureNames,
  FeatureVector,
  TrainingExample,
} from "./types";
import { extractVesselFeatures } from "./vesselEncoding";

/**
 * Orchestrates the refactored loading and encoding stages of the ML pipeline
 * 1. Loading: Vessel trip data → Training examples
 * 2. Encoding: Training examples → Feature vectors
 *
 * This provides a clean separation of concerns and enables
 * model-agnostic input processing for future extensibility.
 */
export const runMLPipeline = async (
  ctx: ActionCtx
): Promise<EncodedTrainingData> => {
  // Stage 1: Loading - Extract vessel trip features and create training examples
  const { trainingExamples, validationExamples } = await ctx.runAction(
    internal.ml.loading.loadPredictionInputs,
    {}
  );

  // Stage 2: Encoding - Convert structured features to flat feature vectors
  const encodedTraining = encodeTrainingExamples(trainingExamples);
  const encodedValidation = encodeTrainingExamples(validationExamples);

  // Stage 3: Validation - Ensure feature consistency across all examples
  const allFeatureVectors = [...encodedTraining.x, ...encodedValidation.x];
  const featureNames = validateFeatureVectors(allFeatureVectors);

  // Return encoded training data ready for ML model training
  return {
    x: encodedTraining.x,
    y: encodedTraining.y,
    featureNames,
  };
};

/**
 * Encodes training examples by converting structured features to flat feature vectors
 *
 * @param examples - Array of training examples with structured input features
 * @returns Encoded training data with feature vectors and target values
 */
const encodeTrainingExamples = (
  examples: TrainingExample[]
): {
  x: FeatureVector[];
  y: number[];
} => {
  const x: FeatureVector[] = [];
  const y: number[] = [];

  for (const example of examples) {
    // Extract features using vessel-specific encoding
    const featureVector = extractVesselFeatures(example.input);
    x.push(featureVector);

    // Extract target value (delay in minutes)
    y.push(example.target.delayMinutes);
  }

  return { x, y };
};

/**
 * Pipeline stage for feature validation
 * Exported for direct access when only validation is needed
 */
export { validateFeatureVectors } from "./encoding";
/**
 * Pipeline stage for loading vessel trip data
 * Exported for direct access when only loading is needed
 */
export { loadPredictionInputs } from "./loading";
/**
 * Pipeline stage for encoding features
 * Exported for direct access when only encoding is needed
 */
export { extractVesselFeatures } from "./vesselEncoding";

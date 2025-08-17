import { api } from "@convex/_generated/api";
import type { ActionCtx } from "@convex/_generated/server";
import { v } from "convex/values";

import type { ConvexVesselTrip } from "@/data/types/convex/VesselTrip";
import { log } from "@/shared/lib/logger";

import type { FeatureVector, ModelParameters, PredictionOutput } from "./types";
import {
  fromNormalizedTimestamp,
  predictWithCoefficients,
  toPredictionVector as toFeatureVector,
  toPredictionInput,
} from "./utils";

/**
 * Main prediction pipeline for generating departure time predictions
 * Orchestrates the complete prediction flow from input validation to result generation
 */
export const generatePrediction = async (
  ctx: ActionCtx,
  args: { prevTrip: ConvexVesselTrip; currTrip: ConvexVesselTrip }
): Promise<PredictionOutput> => {
  const { prevTrip, currTrip } = args;

  // Step 1: Create and validate prediction input using fail-fast validation
  const input = toPredictionInput([prevTrip, currTrip]);
  if (!input) {
    throw new Error("Invalid trip data for prediction");
  }
  log.info(`Generating prediction for route ${input.routeId}`);

  // Step 2: Retrieve and validate trained model parameters for the route
  const model = await findModelByIdentifier(ctx, input.routeId);

  // Step 3: Transform validated input into ML feature vector
  const features = toFeatureVector(input);

  // Step 4: Generate prediction using trained model and calculate confidence
  const prediction = predictWithModel(features, model, input.routeId);

  // Step 5: Build and return prediction response with metadata
  log.info(
    `Prediction successful: ${new Date(prediction.predictedTime).toISOString()}`
  );

  return {
    predictedTime: prediction.predictedTime,
    confidence: prediction.confidence,
    modelVersion: model.modelVersion,
  };
};

/**
 * Step 2: Retrieves and validates trained model parameters for a specific route
 * Ensures model completeness and availability before proceeding with prediction
 */
const findModelByIdentifier = async (
  ctx: ActionCtx,
  identifier: string
): Promise<ModelParameters> => {
  const allModelParams = await ctx.runQuery(
    api.functions.predictions.queries.getAllModelParameters
  );
  const model = allModelParams.find((m) => m.routeId === identifier);

  if (!model) {
    throw new Error(`No trained model available for ${identifier}`);
  }

  // Validate model parameters are complete (this should be rare)
  if (!model.coefficients.length) {
    throw new Error(`Model has no coefficients for ${identifier}`);
  }

  if (!model.trainingMetrics?.mae) {
    throw new Error(`Model missing training metrics for ${identifier}`);
  }

  return model;
};

/**
 * Step 4: Generates prediction using trained model parameters with comprehensive validation
 * Combines feature prediction with confidence calculation for reliable results
 */
const predictWithModel = (
  features: FeatureVector,
  modelParams: ModelParameters,
  identifier: string
): { predictedTime: number; confidence: number } => {
  // Generate prediction (utils.ts handles feature validation)
  const prediction = generatePredictionResult(features, modelParams);

  // Calculate confidence and return result
  const confidence = calculatePredictionConfidence(
    prediction.normalizedValue,
    modelParams.trainingMetrics,
    identifier
  );

  return {
    predictedTime: prediction.absoluteTime,
    confidence,
  };
};

/**
 * Step 4a: Generates the core prediction using trained model coefficients
 * Converts normalized predictions back to absolute timestamps for practical use
 */
const generatePredictionResult = (
  features: FeatureVector,
  modelParams: ModelParameters
): { normalizedValue: number; absoluteTime: number } => {
  // Use the lightweight prediction function (utils.ts handles validation)
  const normalizedPrediction = predictWithCoefficients(
    features,
    modelParams.coefficients,
    modelParams.intercept
  );

  // Convert normalized prediction back to absolute timestamp (utils.ts handles validation)
  const predictedTime = fromNormalizedTimestamp(normalizedPrediction);

  return {
    normalizedValue: normalizedPrediction,
    absoluteTime: predictedTime,
  };
};

/**
 * Step 4b: Calculates prediction confidence based on model performance metrics
 */
const calculatePredictionConfidence = (
  normalizedPrediction: number,
  trainingMetrics: ModelParameters["trainingMetrics"],
  identifier: string
): number => {
  const { mae, r2 } = trainingMetrics;

  // Base confidence on R² score (how well the model fits the data)
  const baseConfidence = Math.max(0.1, Math.min(0.9, r2));

  // Adjust confidence based on prediction magnitude vs. training error
  const predictionMagnitude = Math.abs(normalizedPrediction);
  const errorRatio = predictionMagnitude / Math.max(mae, 1); // Avoid division by zero

  // Lower confidence for predictions that are much larger than training errors
  const magnitudePenalty = Math.max(
    0.1,
    Math.min(1.0, 1.0 / (1.0 + errorRatio / 10))
  );

  const confidence = Math.max(
    0.1,
    Math.min(0.9, baseConfidence * magnitudePenalty)
  );

  log.info(
    `Prediction confidence calculation for ${identifier}: ` +
      `R²=${r2.toFixed(3)}, MAE=${mae.toFixed(3)}, ` +
      `magnitude=${predictionMagnitude.toFixed(3)}, confidence=${confidence.toFixed(3)}`
  );

  return confidence;
};

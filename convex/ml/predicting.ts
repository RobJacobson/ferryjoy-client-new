import { api } from "@convex/_generated/api";
import type { ActionCtx } from "@convex/_generated/server";

import type { FeatureVector, ModelParameters, PredictionOutput } from "./types";
import { extractVesselFeatures } from "./vesselEncoding";

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
  if (Object.keys(features).length !== coefficients.length) {
    throw new Error(
      `Feature count mismatch: expected ${coefficients.length}, got ${Object.keys(features).length}`
    );
  }

  // Use the exact same math as mljs: intercept + Σ(coefficients[i] * features[i])
  let prediction = intercept;
  const featureValues = Object.values(features);

  for (let i = 0; i < featureValues.length; i++) {
    prediction += coefficients[i] * featureValues[i];
  }

  return prediction;
};

/**
 * Main prediction function for generating departure time predictions
 * This is a simplified version that works with the new architecture
 *
 * @param features - Vessel trip features to predict from
 * @param routeId - Route identifier for model lookup
 * @returns Prediction output with predicted time and confidence
 */
export const generatePrediction = async (
  ctx: ActionCtx,
  features: FeatureVector,
  routeId: string
): Promise<PredictionOutput> => {
  // Retrieve trained model parameters for the route
  const model = await findModelByIdentifier(ctx, routeId);

  // Generate prediction using trained model
  const predictedDelay = predictWithCoefficients(
    features,
    model.coefficients,
    model.intercept
  );

  // For now, return a simple prediction structure
  // TODO: Implement proper confidence calculation and timestamp conversion
  return {
    predictedTime: Date.now() + predictedDelay * 60 * 1000, // Convert minutes to milliseconds
    confidence: 0.8, // Placeholder confidence
    modelVersion: model.modelVersion,
  };
};

/**
 * Retrieves and validates trained model parameters for a specific route
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

  // Validate model parameters are complete
  if (!model.coefficients.length) {
    throw new Error(`Model has no coefficients for ${identifier}`);
  }

  if (!model.trainingMetrics?.mae) {
    throw new Error(`Model missing training metrics for ${identifier}`);
  }

  return model;
};

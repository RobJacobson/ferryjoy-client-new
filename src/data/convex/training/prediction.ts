import { v } from "convex/values";

import { api } from "@/data/convex/_generated/api";
import {
  type ActionCtx,
  internalAction,
} from "@/data/convex/_generated/server";
import { vesselTripValidationSchema } from "@/data/types/convex/VesselTrip";
import { log } from "@/shared/lib/logger";

import type {
  ExampleData,
  ModelParameters,
  PredictionInput,
  PredictionOutput,
} from "./types";
import {
  createPredictionInput,
  fromNormalizedTimestamp,
  generateFeatureVector,
  predictWithCoefficients,
} from "./utils";

// ============================================================================
// MAIN FUNCTION
// ============================================================================

/**
 * Unified prediction function for departure times only
 */
export const predictTimeAction = internalAction({
  args: {
    prevTrip: v.object(vesselTripValidationSchema),
    currTrip: v.object(vesselTripValidationSchema),
  },
  handler: async (ctx, args): Promise<PredictionOutput> => {
    const { prevTrip, currTrip } = args;

    // Use shared utility to create PredictionInput from trip pairs
    const predictionInput = createPredictionInput([prevTrip, currTrip]);
    if (!predictionInput) {
      return createErrorResponse("Invalid trip data for prediction");
    }

    const routeId = predictionInput.routeId;
    log.info(`Generating departure prediction for route ${routeId}`);

    try {
      const modelParams = await findModelForRoute(ctx, routeId);
      if (!modelParams) {
        return createErrorResponse(
          `No trained model available for route ${routeId}`
        );
      }

      // Create features using the same logic as training
      const features = generateFeatureVector(predictionInput);

      const prediction = predictWithModel(
        features,
        modelParams,
        predictionInput
      );

      if (!prediction) {
        return createErrorResponse("Prediction calculation failed");
      }

      log.info(
        `Prediction successful: ${new Date(prediction.predictedTime).toISOString()}`
      );
      return createSuccessResponse(prediction, modelParams.modelVersion);
    } catch (error) {
      log.error(`Departure prediction failed:`, error);
      return createErrorResponse(`Departure prediction failed: ${error}`);
    }
  },
});

// ============================================================================
// HELPER FUNCTIONS (in order of use)
// ============================================================================

/**
 * Finds model parameters for a specific route
 */
const findModelForRoute = async (
  ctx: ActionCtx,
  routeId: string
): Promise<ModelParameters | null> => {
  const allModelParams = await ctx.runQuery(
    api.functions.predictions.queries.getAllModelParameters
  );
  return (
    allModelParams.find(
      (model: ModelParameters) => model.routeId === routeId
    ) || null
  );
};

/**
 * Makes prediction using model parameters
 */
const predictWithModel = (
  features: number[],
  modelParams: ModelParameters,
  _input: PredictionInput
): { predictedTime: number; confidence: number } | null => {
  try {
    // Use the lightweight prediction function
    const normalizedPrediction = predictWithCoefficients(
      features,
      modelParams.coefficients,
      modelParams.intercept
    );

    // Convert normalized prediction back to absolute timestamp
    const predictedTime = fromNormalizedTimestamp(normalizedPrediction);

    // Calculate confidence based on model performance
    const confidence = Math.max(
      0.1,
      Math.min(0.9, 1 - Math.abs(normalizedPrediction) / 1000)
    );

    return { predictedTime, confidence };
  } catch (error) {
    log.error("Prediction calculation failed:", error);
    return null;
  }
};

/**
 * Creates error response
 */
const createErrorResponse = (message: string): PredictionOutput => ({
  success: false,
  message,
});

/**
 * Creates success response
 */
const createSuccessResponse = (
  prediction: { predictedTime: number; confidence: number },
  modelVersion: string
): PredictionOutput => ({
  success: true,
  predictedTime: prediction.predictedTime,
  confidence: prediction.confidence,
  modelVersion,
  message: "Prediction successful",
});

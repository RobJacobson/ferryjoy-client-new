import { v } from "convex/values";

import { api } from "@/data/convex/_generated/api";
import {
  type ActionCtx,
  internalAction,
} from "@/data/convex/_generated/server";
import { log } from "@/shared/lib/logger";

import type {
  ModelParameters,
  PredictionInput,
  PredictionOutput,
  TrainingExample,
} from "./types";
import {
  fromNormalizedTimestamp,
  generateFeatureVectorFromExample,
  sanitizePredictionInput,
} from "./utils";

// ============================================================================
// MAIN FUNCTION
// ============================================================================

/**
 * Unified prediction function for departure times only
 */
export const predictTimeAction = internalAction({
  args: {
    prevTrip: v.object({
      ArvDockActual: v.optional(v.number()),
      ScheduledDeparture: v.optional(v.number()),
      LeftDockActual: v.optional(v.number()),
    }),
    currTrip: v.object({
      ScheduledDeparture: v.number(),
      ArvDockActual: v.optional(v.number()),
    }),
    routeId: v.string(),
  },
  handler: async (ctx, args): Promise<PredictionOutput> => {
    const { prevTrip, currTrip, routeId } = args;
    log.info(`Generating departure prediction for route ${routeId}`);

    try {
      const modelParams = await findModelForRoute(ctx, routeId);
      if (!modelParams) {
        return createErrorResponse(
          `No trained model available for route ${routeId}`
        );
      }

      const predictionInput: PredictionInput = { prevTrip, currTrip };

      // Sanitize input and create features using the same logic as training
      const sanitizedFeatures = sanitizePredictionInput(predictionInput);
      const features = generateFeatureVectorFromExample(
        sanitizedFeatures as TrainingExample
      );

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
 * Creates a standardized error response
 */
const createErrorResponse = (message: string): PredictionOutput => ({
  success: false,
  message,
});

/**
 * Creates a standardized success response
 */
const createSuccessResponse = (
  prediction: { predictedTime: number; confidence: number },
  modelVersion: string
): PredictionOutput => ({
  success: true,
  predictedTime: prediction.predictedTime,
  confidence: prediction.confidence,
  modelVersion,
  message: "Departure prediction generated successfully",
});

/**
 * Predicts time using trained model
 */
const predictWithModel = (
  features: number[],
  model: ModelParameters,
  _input: PredictionInput
): { predictedTime: number; confidence: number } | null => {
  try {
    // Validate feature count
    if (features.length !== model.coefficients.length) {
      log.error(
        `Feature count mismatch: expected ${model.coefficients.length}, got ${features.length}`
      );
      return null;
    }

    // Calculate prediction (model outputs normalized minutes)
    let prediction = model.intercept;
    for (let i = 0; i < features.length; i++) {
      prediction += model.coefficients[i] * features[i];
    }

    // Convert normalized prediction back to absolute timestamp
    const predictedTime = fromNormalizedTimestamp(prediction);

    // Calculate confidence based on model performance
    const confidence = Math.max(
      0.1,
      Math.min(0.9, 1 - Math.abs(prediction) / 1000)
    );

    return { predictedTime, confidence };
  } catch (error) {
    log.error("Prediction failed:", error);
    return null;
  }
};

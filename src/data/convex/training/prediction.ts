import { v } from "convex/values";

import { api } from "@/data/convex/_generated/api";
import type { ActionCtx } from "@/data/convex/_generated/server";
import { internalAction } from "@/data/convex/_generated/server";
import { log } from "@/shared/lib/logger";

import { predictionFunctionInputSchema } from "../schema";
import type {
  ModelParameters,
  PredictionInput,
  PredictionOutput,
  PredictionResult,
} from "./types";

type PredictionType = "departure" | "arrival";

/**
 * Shared prediction logic for both departure and arrival
 */
export const predictTime = async (
  ctx: ActionCtx,
  input: PredictionInput,
  predictionType: PredictionType
): Promise<{
  success: boolean;
  message: string;
  prediction?: PredictionResult;
}> => {
  try {
    log.info(`Predicting ${predictionType} time for vessel ${input.vesselId}`);

    // Load all model parameters and filter for this route
    const allModelParams = await ctx.runQuery(
      api.functions.predictions.queries.getAllModelParameters
    );

    const modelParams = allModelParams.find(
      (model: ModelParameters) =>
        model.routeId === input.opRouteAbrv &&
        model.modelType === predictionType
    );

    if (!modelParams) {
      log.warn(
        `No ${predictionType} model found for route ${input.opRouteAbrv}`
      );
      return {
        success: false,
        message: `No ${predictionType} model found for route ${input.opRouteAbrv}`,
      };
    }

    // Generate features for prediction
    const features = generateFeatures(input, predictionType);

    // Make prediction using linear regression
    const prediction = predictWithModel(features, modelParams);

    if (!prediction) {
      return {
        success: false,
        message: `Failed to generate ${predictionType} prediction`,
      };
    }

    log.info(
      `${predictionType} prediction: ${new Date(prediction.predictedTime).toISOString()} ± ${prediction.confidence} minutes`
    );

    return {
      success: true,
      message: `${predictionType} prediction generated successfully`,
      prediction: {
        predictedTime: prediction.predictedTime,
        confidence: prediction.confidence,
        modelVersion: modelParams.modelVersion,
      },
    };
  } catch (error) {
    log.error(`${predictionType} prediction failed:`, error);
    return {
      success: false,
      message: `${predictionType} prediction failed: ${error}`,
    };
  }
};

/**
 * Generates feature vector for prediction
 */
const generateFeatures = (
  input: PredictionInput,
  predictionType: PredictionType
): number[] => {
  // Create 24 binary hour features
  const hourFeatures = Array.from({ length: 24 }, (_, i) =>
    input.hourOfDay === i ? 1 : 0
  );

  // Create 2 binary day features
  const dayFeatures = [
    input.dayType === "weekday" ? 1 : 0,
    input.dayType === "weekend" ? 1 : 0,
  ];

  // Continuous features
  const continuousFeatures = [input.previousDelay];

  if (predictionType === "departure") {
    // For departure, we use arrival time as prior time
    continuousFeatures.push(input.priorTime);
  } else {
    // For arrival, we use departure time and scheduled departure
    continuousFeatures.push(input.priorTime);
    continuousFeatures.push(input.schedDep);
  }

  return [...hourFeatures, ...dayFeatures, ...continuousFeatures];
};

/**
 * Makes prediction using trained linear regression model
 */
const predictWithModel = (
  features: number[],
  model: ModelParameters
): { predictedTime: number; confidence: number } | null => {
  try {
    // Validate feature count matches model
    if (features.length !== model.coefficients.length) {
      log.error(
        `Feature count mismatch: ${features.length} vs ${model.coefficients.length}`
      );
      return null;
    }

    // Linear regression: y = intercept + Σ(coef_i * feature_i)
    let prediction = model.intercept;
    for (let i = 0; i < features.length; i++) {
      prediction += model.coefficients[i] * features[i];
    }

    // Prediction is already in milliseconds timestamp
    const predictedTime = prediction;

    // Use model's training metrics for confidence
    const confidence = model.trainingMetrics.rmse || 5; // default 5 minutes

    return {
      predictedTime,
      confidence,
    };
  } catch (error) {
    log.error("Model prediction failed:", error);
    return null;
  }
};

/**
 * Predicts ferry departure or arrival time
 * Uses trained linear regression model for the specific route
 */
export const predictTimeAction = internalAction({
  args: {
    input: v.object(predictionFunctionInputSchema),
    predictionType: v.union(v.literal("departure"), v.literal("arrival")),
  },
  handler: async (ctx, args): Promise<PredictionOutput> => {
    const result = await predictTime(ctx, args.input, args.predictionType);

    if (!result.success || !result.prediction) {
      throw new Error(result.message);
    }

    return result.prediction;
  },
});

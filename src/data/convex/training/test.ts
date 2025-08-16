import { v } from "convex/values";

import { api } from "@/data/convex/_generated/api";
import { internalAction } from "@/data/convex/_generated/server";
import { log } from "@/shared/lib/logger";

import type {
  ModelParameters,
  PredictionOutput,
  TrainingExample,
} from "./types";
import {
  fromNormalizedTimestamp,
  generateFeatureVectorFromExample,
  predictWithCoefficients,
  sanitizePredictionInput,
} from "./utils";

// ============================================================================
// TEST FUNCTIONS
// ============================================================================

/**
 * Simple test function to test the new prediction logic directly
 */
export const testPrediction = internalAction({
  args: {
    routeId: v.string(),
  },
  handler: async (ctx, args): Promise<PredictionOutput> => {
    const { routeId } = args;

    log.info(`Testing prediction for route ${routeId}`);

    try {
      // Load model parameters for this route
      const allModelParams = await ctx.runQuery(
        api.functions.predictions.queries.getAllModelParameters
      );

      const modelParams = allModelParams.find(
        (model: ModelParameters) => model.routeId === routeId
      );

      if (!modelParams) {
        return {
          success: false,
          message: `No model found for route ${routeId}`,
        };
      }

      // Create test input
      const testInput = {
        prevTrip: {
          ArvDockActual: 1755304974000,
          ScheduledDeparture: 1755304973000,
          LeftDockActual: 1755304973500,
        },
        currTrip: {
          ScheduledDeparture: 1755304975000,
          ArvDockActual: 1755304974500,
        },
      };

      // Generate features using the same sanitization as the main prediction
      const sanitizedFeatures = sanitizePredictionInput(testInput);
      const features = generateFeatureVectorFromExample(
        sanitizedFeatures as TrainingExample
      );

      // Make prediction
      const prediction = predictWithCoefficients(
        features,
        modelParams.coefficients,
        modelParams.intercept
      );

      // Convert normalized prediction back to absolute timestamp
      const predictedTime = fromNormalizedTimestamp(prediction);

      // Calculate confidence based on model performance
      const confidence = Math.max(
        0.1,
        Math.min(0.9, 1 - Math.abs(prediction) / 1000)
      );

      log.info(
        `Test prediction successful: departure at ${new Date(predictedTime).toISOString()} (confidence: ${confidence.toFixed(2)})`
      );

      return {
        success: true,
        predictedTime,
        confidence,
        modelVersion: modelParams.modelVersion,
        message: `Test prediction successful - Raw timestamp: ${predictedTime}`,
      };
    } catch (error) {
      log.error(`Test prediction failed:`, error);
      return {
        success: false,
        message: `Test prediction failed: ${error}`,
      };
    }
  },
});

/**
 * Manual test function to directly test the raw timestamp prediction
 */
export const manualTestPrediction = internalAction({
  args: {},
  handler: async (ctx): Promise<PredictionOutput> => {
    log.info("Testing manual prediction calculation");

    try {
      // Load model parameters for sea-bi route
      const allModelParams = await ctx.runQuery(
        api.functions.predictions.queries.getAllModelParameters
      );

      const modelParams = allModelParams.find(
        (model: ModelParameters) => model.routeId === "sea-bi"
      );

      if (!modelParams) {
        return {
          success: false,
          message: "No model found for sea-bi route",
        };
      }

      // Create test features manually (same as our 8-feature model)
      const testExample: TrainingExample = {
        routeId: "test",
        hourFeatures: Array.from({ length: 24 }, (_, i) =>
          i === 12 ? 1 : 0
        ) as readonly number[] & { length: 24 },
        isWeekday: 1,
        isWeekend: 0,
        prevArvTimeActual: 1755304974000,
        prevDepTermAbrv: "test",
        prevDepTimeSched: 1755304973000,
        prevDepTimeActual: 1755304973500,
        currArvTimeActual: 1755304974500,
        currArvTermAbrv: "test",
        currDepTermAbrv: "test",
        currDepTimeSched: 1755304975000,
        targetDepTimeActual: 0, // Not used for feature generation
      };

      const testFeatures = generateFeatureVectorFromExample(testExample);

      // Manual prediction calculation using the lightweight function
      const prediction = predictWithCoefficients(
        testFeatures,
        modelParams.coefficients,
        modelParams.intercept
      );

      // Convert normalized prediction back to absolute timestamp
      const predictedTime = fromNormalizedTimestamp(prediction);

      log.info(`Manual prediction result: ${prediction} (normalized)`);
      log.info(`Converted timestamp: ${predictedTime}`);
      log.info(`As date: ${new Date(predictedTime).toISOString()}`);

      return {
        success: true,
        predictedTime,
        confidence: 0.8,
        modelVersion: modelParams.modelVersion,
        message: `Manual prediction successful - Normalized: ${prediction}, Timestamp: ${predictedTime}`,
      };
    } catch (error) {
      log.error(`Manual test prediction failed:`, error);
      return {
        success: false,
        message: `Manual test prediction failed: ${error}`,
      };
    }
  },
});

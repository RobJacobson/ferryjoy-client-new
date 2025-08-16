import { api, internal } from "@/data/convex/_generated/api";
import { internalAction } from "@/data/convex/_generated/server";
import { log } from "@/shared/lib/logger";

import { prepareTrainingData } from "./preprocessing";
import { filterRoutesWithMinData, groupExamplesByRoute } from "./routeGrouping";
import { calculateRouteStatistics } from "./routeStatistics";
import {
  FEATURE_NAMES,
  generateModelVersion,
  trainLinearRegression,
} from "./train";
import type {
  ExampleData,
  ModelParameters,
  RouteGroup,
  TrainingResponse,
} from "./types";
import {
  createErrorResponse,
  createSuccessResponse,
  isNotOutlier,
  withErrorHandling,
} from "./utils";

// ============================================================================
// MAIN FUNCTION
// ============================================================================

/**
 * Trains prediction models for all routes
 * Orchestrates the training pipeline using focused modules
 */
export const trainPredictionModels = internalAction({
  args: {},
  handler: async (ctx) => {
    log.info("Starting prediction model training");

    return withErrorHandling(
      async () => {
        const featureResult = await ctx.runAction(
          internal.training.preprocessing.extractPredictionFeatures,
          {}
        );

        if (!featureResult.success) throw new Error(featureResult.message);

        // Debug logging to see what we actually got
        log.info(`Feature result keys: ${Object.keys(featureResult)}`);
        log.info(`Feature result type: ${typeof featureResult}`);
        log.info(`Feature result: ${JSON.stringify(featureResult, null, 2)}`);

        const { trainingExamples } = featureResult;
        log.info(
          `Training examples length: ${trainingExamples?.length || "undefined"}`
        );

        if (!trainingExamples?.length) {
          log.warn("No training examples available");
          return createErrorResponse("No training examples available");
        }

        // Functional pipeline: filter → reduce → filter
        const validRouteGroups: RouteGroup[] = trainingExamples
          .filter(isNotOutlier)
          .reduce(groupExamplesByRoute, [] as RouteGroup[])
          .filter(filterRoutesWithMinData(10));

        const routeStats = validRouteGroups.map(calculateRouteStatistics);
        log.info(`Route statistics: ${JSON.stringify(routeStats, null, 2)}`);

        const trainedModels = await Promise.all(
          validRouteGroups.map(async (group: RouteGroup) =>
            trainSingleModel(group.routeId, group.examples)
          )
        );

        const models = trainedModels.filter(
          (m): m is ModelParameters => m !== null
        );

        await Promise.all(
          models.map((model) =>
            ctx.runMutation(
              api.functions.predictions.mutations.storeModelParametersMutation,
              { model }
            )
          )
        );

        log.info(`Successfully trained ${models.length} models`);
        return createSuccessResponse<TrainingResponse>(
          `Trained ${models.length} models`,
          {
            models,
            routeStatistics: routeStats,
          }
        );
      },
      "Model training failed",
      (error: unknown) => log.error("Model training failed:", error)
    );
  },
});

// ============================================================================
// HELPER FUNCTIONS (in order of use)
// ============================================================================

/**
 * Trains a single model for a specific route
 */
const trainSingleModel = async (
  routeId: string,
  examples: ExampleData[]
): Promise<ModelParameters | null> => {
  try {
    const data = prepareTrainingData(examples);
    if (data.x.length < 10) return null;

    const { coefficients, intercept } = await trainLinearRegression(data);

    // Calculate metrics manually since we no longer have the model object
    const predictions = data.x.map((features) => {
      let prediction = intercept;
      for (let i = 0; i < features.length; i++) {
        prediction += coefficients[i] * features[i];
      }
      return prediction;
    });

    const errors = data.y.map((actual, i) => Math.abs(actual - predictions[i]));
    const mae = errors.reduce((sum, error) => sum + error, 0) / errors.length;
    const rmse = Math.sqrt(
      errors.reduce((sum, error) => sum + error * error, 0) / errors.length
    );

    const meanY = data.y.reduce((sum, val) => sum + val, 0) / data.y.length;
    const ssRes = data.y.reduce(
      (sum, actual, i) => sum + (actual - predictions[i]) ** 2,
      0
    );
    const ssTot = data.y.reduce(
      (sum, actual) => sum + (actual - meanY) ** 2,
      0
    );
    const r2 = 1 - ssRes / ssTot;

    const featureNames = [...FEATURE_NAMES]; // Convert readonly to mutable

    return {
      routeId,
      modelType: "departure",
      coefficients,
      intercept,
      featureNames,
      trainingMetrics: { mae, rmse, r2 },
      modelVersion: generateModelVersion(),
      createdAt: Date.now(),
    };
  } catch (error) {
    log.error(`Failed to train departure model for route ${routeId}:`, error);
    return null;
  }
};

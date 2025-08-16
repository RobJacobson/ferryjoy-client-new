import { api, internal } from "@/data/convex/_generated/api";
import { internalAction } from "@/data/convex/_generated/server";
import { log } from "@/shared/lib/logger";

import { calculateMetrics } from "./metrics";
import { prepareTrainingData } from "./preprocessing";
import { filterRoutesWithMinData, groupExamplesByRoute } from "./routeGrouping";
import { calculateRouteStatistics } from "./routeStatistics";
import {
  FEATURE_NAMES,
  generateModelVersion,
  trainLinearRegression,
} from "./train";
import type {
  ModelParameters,
  RouteGroup,
  TrainingExample,
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

        const { trainingExamples } = featureResult;
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
  examples: TrainingExample[]
): Promise<ModelParameters | null> => {
  try {
    const data = prepareTrainingData(examples);
    if (data.x.length < 10) return null;

    const model = await trainLinearRegression(data);
    const metrics = calculateMetrics(data, model);
    const featureNames = [...FEATURE_NAMES]; // Convert readonly to mutable

    return {
      routeId,
      modelType: "departure",
      coefficients: model.coefficients,
      intercept: model.intercept,
      featureNames,
      trainingMetrics: metrics,
      modelVersion: generateModelVersion(),
      createdAt: Date.now(),
    };
  } catch (error) {
    log.error(`Failed to train departure model for route ${routeId}:`, error);
    return null;
  }
};

import { v } from "convex/values";

import { api, internal } from "@/data/convex/_generated/api";
import { internalAction } from "@/data/convex/_generated/server";
import { log } from "@/shared/lib/logger";

type PredictionType = "departure" | "arrival";

import type { EncodedFeatures, ModelParameters, TrainingData } from "./types";

/**
 * Trains prediction models for all routes
 */
export const trainPredictionModels = internalAction({
  args: {},
  handler: async (ctx) => {
    log.info("Starting prediction model training");

    try {
      // Extract features from completed vessel trips
      const featureResult = await ctx.runAction(
        internal.training.preprocessing.extractPredictionFeatures,
        {}
      );

      if (!featureResult.success) {
        throw new Error(featureResult.message);
      }

      const { trainingFeatures } = featureResult;

      if (!trainingFeatures || trainingFeatures.length === 0) {
        log.warn("No training features available");
        return {
          success: false,
          message: "No training features available",
        };
      }

      log.info(`Training with ${trainingFeatures.length} samples`);

      // Group features by route for per-route models
      const routeGroups = groupFeaturesByRoute(trainingFeatures);
      const trainedModels: ModelParameters[] = [];

      // Train departure and arrival models for each route
      for (const [routeId, features] of routeGroups) {
        const predictionTypes: PredictionType[] = ["departure", "arrival"];

        for (const modelType of predictionTypes) {
          const model = await trainSingleModel(routeId, features, modelType);
          if (model) trainedModels.push(model);
        }
      }

      // Store model parameters
      for (const model of trainedModels) {
        await ctx.runMutation(
          api.functions.predictions.mutations.storeModelParametersMutation,
          { model }
        );
      }

      log.info(`Successfully trained ${trainedModels.length} models`);

      return {
        success: true,
        message: `Trained ${trainedModels.length} models`,
        models: trainedModels,
      };
    } catch (error) {
      log.error("Model training failed:", error);
      return {
        success: false,
        message: `Model training failed: ${error}`,
      };
    }
  },
});

/**
 * Groups features by route for per-route model training
 */
const groupFeaturesByRoute = (
  features: EncodedFeatures[]
): Map<string, EncodedFeatures[]> => {
  return features.reduce((groups, feature) => {
    const routeId = feature.routeId; // Use routeId from EncodedFeatures
    if (!groups.has(routeId)) groups.set(routeId, []);
    const group = groups.get(routeId);
    if (group) group.push(feature);
    return groups;
  }, new Map<string, EncodedFeatures[]>());
};

/**
 * Trains a single model for a specific route and type
 */
const trainSingleModel = async (
  routeId: string,
  features: EncodedFeatures[],
  modelType: PredictionType
): Promise<ModelParameters | null> => {
  try {
    const trainingData = prepareTrainingData(features, modelType);

    if (trainingData.x.length < 10) {
      log.warn(
        `Insufficient data for route ${routeId}: ${trainingData.x.length} samples`
      );
      return null;
    }

    const model = await trainLinearRegression(trainingData);
    const metrics = calculateMetrics(trainingData, model);

    return {
      routeId,
      modelType,
      coefficients: model.coefficients,
      intercept: model.intercept,
      featureNames: getFeatureNames(modelType),
      trainingMetrics: metrics,
      modelVersion: generateModelVersion(),
      createdAt: Date.now(),
    };
  } catch (error) {
    log.error(
      `Failed to train ${modelType} model for route ${routeId}:`,
      error
    );
    return null;
  }
};

/**
 * Prepares training data for mljs linear regression
 */
const prepareTrainingData = (
  features: EncodedFeatures[],
  targetType: PredictionType
): TrainingData => {
  const x: number[][] = [];
  const y: number[] = [];

  features.forEach((feature) => {
    const featureVector = getFeatureVector(feature, targetType);
    x.push(featureVector);

    // Calculate target variable based on prediction type
    if (targetType === "departure" && feature.departureTime) {
      y.push(feature.departureTime);
    } else if (targetType === "arrival" && feature.schedDep) {
      // For arrival, use scheduled departure + some offset as target
      // This is a placeholder - you'll need actual arrival times
      y.push(feature.schedDep + 30 * 60 * 1000); // 30 minutes after scheduled departure
    } else {
      y.push(0); // Fallback for missing data
    }
  });

  return { x, y };
};

/**
 * Gets feature vector based on prediction type
 */
const getFeatureVector = (
  feature: EncodedFeatures,
  targetType: PredictionType
): number[] => {
  const baseFeatures = [
    ...feature.hourFeatures,
    feature.isWeekday,
    feature.isWeekend,
    feature.previousDelay,
  ];

  // Add type-specific features
  if (targetType === "arrival") {
    return [...baseFeatures, feature.departureTime || 0, feature.schedDep || 0];
  }

  return baseFeatures;
};

/**
 * Trains linear regression using mljs
 */
const trainLinearRegression = async (data: TrainingData) => {
  // TODO: Import and use mljs regression library
  // For now, return a placeholder model
  return {
    coefficients: new Array(data.x[0]?.length || 27).fill(0),
    intercept: 0,
  };
};

/**
 * Calculates performance metrics for the model
 */
const calculateMetrics = (
  data: TrainingData,
  model: { coefficients: number[]; intercept: number }
) => {
  // TODO: Implement actual metric calculation
  return {
    mae: 0,
    rmse: 0,
    r2: 0,
  };
};

/**
 * Returns feature names based on prediction type
 */
const getFeatureNames = (modelType: PredictionType): string[] => {
  const hourNames = Array.from({ length: 24 }, (_, i) => `hour_${i}`);
  const baseNames = [...hourNames, "isWeekday", "isWeekend", "previousDelay"];

  if (modelType === "arrival") {
    return [...baseNames, "departureTime", "schedDep"];
  }

  return baseNames;
};

/**
 * Generates a unique model version using ISO format ending with minutes
 * Format: v2025-01-14T15:30 (year-month-dayThour:minute)
 */
const generateModelVersion = (): string => {
  const now = new Date();
  const isoString = now.toISOString();
  // Extract YYYY-MM-DDTHH:MM format (remove seconds and timezone)
  const version = isoString.substring(0, 16);
  return `v${version}`;
};

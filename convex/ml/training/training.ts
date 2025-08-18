import { api, internal } from "@convex/_generated/api";
import type { ActionCtx } from "@convex/_generated/server";
import MLR from "ml-regression-multivariate-linear";

import type {
  EncodedTrainingData,
  FeatureVector,
  ModelParameters,
  RouteGroup,
  RouteStatistics,
  TrainingExample,
  TrainingResponse,
} from "../types";
import { extractAndEncodeFeatures } from "./pipeline";

// ============================================================================
// MAIN FUNCTIONS
// ============================================================================

/**
 * Main training orchestration for the entire pipeline
 * Handles feature extraction, data organization, model training, and storage
 */
export const trainPredictionModelsPipeline = async (
  ctx: ActionCtx
): Promise<TrainingResponse> => {
  // Step 1: Get encoded training data from the refactored loading/encoding stages
  const encodedData = await extractAndEncodeFeatures(ctx);

  // Step 2: Organize examples by route and filter routes with sufficient data
  const validRouteGroups = organizeDataByRoutes(encodedData);

  // Step 3: Calculate route statistics to assess data quality and performance
  const routeStats = validRouteGroups.map(calculateRouteStatistics);

  // Step 4: Train individual models for each valid route using ML algorithms
  const models = await trainModelsForRoutes(validRouteGroups, ctx);

  // Step 5: Persist trained models to database for future predictions
  await storeTrainedModels(ctx, models);

  return {
    models,
    routeStatistics: routeStats,
  };
};

// ============================================================================
// HELPER FUNCTIONS (in numerical order of execution)
// ============================================================================

/**
 * Step 2: Organizes examples by route and filters routes with sufficient data
 * Groups training examples by route ID and ensures minimum data requirements are met
 */
const organizeDataByRoutes = (
  encodedData: EncodedTrainingData
): RouteGroup[] => {
  // For now, we'll create a single route group since the new pipeline
  // doesn't separate by route yet. This is a simplified approach.
  // TODO: Implement route-based grouping in the encoding stage

  if (encodedData.x.length < 10) {
    throw new Error("Insufficient training data available");
  }

  // Create a single route group with all data
  const routeGroup: RouteGroup = {
    routeId: "combined", // Placeholder - should be extracted from actual data
    examples: [], // We don't have TrainingExample[] anymore, just encoded data
  };

  return [routeGroup];
};

/**
 * Step 4: Trains models for each valid route group
 * Uses the new encoded training data structure
 */
export const trainModelsForRoutes = async (
  routeGroups: RouteGroup[],
  ctx: ActionCtx
): Promise<ModelParameters[]> => {
  // For now, train a single model on all data
  // TODO: Implement proper route-based training when route grouping is added

  const model = await trainSingleModel("combined", routeGroups[0], ctx);
  return model ? [model] : [];
};

/**
 * Trains a single model using the new encoded training data
 */
export const trainSingleModel = async (
  routeId: string,
  routeGroup: RouteGroup,
  ctx: ActionCtx
): Promise<ModelParameters | null> => {
  try {
    // Get the encoded data from the pipeline
    const encodedData = await extractAndEncodeFeatures(ctx);

    if (encodedData.x.length < 10) return null;

    const { coefficients, intercept } =
      await trainLinearRegression(encodedData);

    // Calculate metrics using the new data structure
    const predictions = encodedData.x.map((features: FeatureVector) => {
      let prediction = intercept;
      const featureValues = Object.values(features);
      for (let i = 0; i < featureValues.length; i++) {
        prediction += coefficients[i] * featureValues[i];
      }
      return prediction;
    });

    const metrics = calculateTrainingMetrics(encodedData.y, predictions);

    return {
      routeId,
      modelType: "departure",
      coefficients,
      intercept,
      featureNames: encodedData.featureNames,
      trainingMetrics: metrics,
      modelVersion: generateModelVersion(),
      createdAt: Date.now(),
    };
  } catch (error) {
    console.error(
      `Failed to train departure model for route ${routeId}:`,
      error
    );
    return null;
  }
};

/**
 * Trains a linear regression model using mljs with the new encoded data structure
 */
export const trainLinearRegression = async (
  data: EncodedTrainingData
): Promise<{ coefficients: number[]; intercept: number }> => {
  // Convert FeatureVector[] to number[][] for MLR
  const X = data.x.map((features) => Object.values(features));
  const y = data.y.map((val) => [val]);

  return new Promise((resolve) => {
    const regression = new MLR(X, y);

    // Extract coefficients and intercept from the trained model
    const coefficients = regression.weights.slice(0, -1).map((row) => row[0]);
    const intercept = regression.weights[regression.weights.length - 1][0];

    resolve({ coefficients, intercept });
  });
};

// ============================================================================
// HELPER FUNCTIONS (in order of use)
// ============================================================================

/**
 * Step 4a: Calculates training metrics (MAE, RMSE, R²) from predictions and actual values
 * Provides quantitative assessment of model performance for validation and comparison
 */
const calculateTrainingMetrics = (
  actuals: number[],
  predictions: number[]
): { mae: number; rmse: number; r2: number } => {
  const errors = actuals.map((actual, i) => Math.abs(actual - predictions[i]));

  // Mean Absolute Error
  const mae = errors.reduce((sum, error) => sum + error, 0) / errors.length;

  // Root Mean Square Error
  const rmse = Math.sqrt(
    errors.reduce((sum, error) => sum + error * error, 0) / errors.length
  );

  // R² Score
  const meanY = actuals.reduce((sum, val) => sum + val, 0) / actuals.length;
  const ssRes = actuals.reduce(
    (sum, actual, i) => sum + (actual - predictions[i]) ** 2,
    0
  );
  const ssTot = actuals.reduce((sum, actual) => sum + (actual - meanY) ** 2, 0);
  const r2 = 1 - ssRes / ssTot;

  return { mae, rmse, r2 };
};

/**
 * Step 3: Calculates statistics for a route group to assess data quality and performance
 * Analyzes delays, sample sizes, and variance to determine training data suitability
 */
const calculateRouteStatistics = (group: RouteGroup): RouteStatistics => {
  // For now, return simplified statistics since we don't have the old data structure
  // TODO: Implement proper statistics calculation when route grouping is added

  return {
    routeId: group.routeId,
    trainingExamples: 0, // Placeholder - should be calculated from actual data
    validationExamples: 0, // Placeholder - should be calculated from actual data
    modelPerformance: {
      mae: 0, // Placeholder
      rmse: 0, // Placeholder
      r2: 0, // Placeholder
    },
  };
};

/**
 * Step 5: Persists trained models to database for future predictions
 * Stores model parameters, coefficients, and training metrics for each route
 */
const storeTrainedModels = async (
  ctx: ActionCtx,
  models: ModelParameters[]
): Promise<void> => {
  if (!models.length) {
    throw new Error("No models were successfully trained");
  }

  await Promise.all(
    models.map((model) =>
      ctx.runMutation(
        api.functions.predictions.mutations.storeModelParametersMutation,
        { model }
      )
    )
  );
};

/**
 * Generates a model version string
 */
export const generateModelVersion = (): string => {
  const now = new Date();
  return `v${now.toISOString().split("T")[0]}`;
};

// ============================================================================
// ROUTE GROUPING UTILITIES
// ============================================================================

/**
 * Filters routes to ensure they have sufficient training data for reliable model training
 * Designed as a filter function: (group) => boolean
 */
export const filterRoutesWithMinData =
  (minExamples: number) =>
  (group: RouteGroup): boolean =>
    group.examples.length >= minExamples;

/**
 * Groups training examples by route ID for organized model training
 * Creates a reducer function that groups examples by route abbreviation
 */
export const groupByRoute = (
  acc: RouteGroup[],
  example: TrainingExample
): RouteGroup[] => {
  // TODO: Implement route-based grouping when we have route information
  // For now, this is a placeholder since we're not grouping by route yet
  return acc;
};

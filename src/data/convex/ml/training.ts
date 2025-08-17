import MLR from "ml-regression-multivariate-linear";

import { api, internal } from "@/data/convex/_generated/api";
import type { ActionCtx } from "@/data/convex/_generated/server";

import { prepareTrainingData } from "./loading";
import type {
  ExampleData,
  ModelParameters,
  RouteGroup,
  RouteStatistics,
  TrainingData,
  TrainingResponse,
} from "./types";
import { isNotOutlier } from "./utils";

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
  // Step 1: Extract and validate training examples from preprocessing pipeline
  const trainingExamples = await getTrainingExamples(ctx);

  // Step 2: Organize examples by route and filter routes with sufficient data
  const validRouteGroups = organizeDataByRoutes(trainingExamples);

  // Step 3: Calculate route statistics to assess data quality and performance
  const routeStats = validRouteGroups.map(calculateRouteStatistics);

  // Step 4: Train individual models for each valid route using ML algorithms
  const models = await trainModelsForRoutes(validRouteGroups);

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
 * Step 1: Extracts and validates training examples from preprocessing pipeline
 * Fetches vessel trip data, converts to training examples, and ensures data availability
 */
const getTrainingExamples = async (ctx: ActionCtx): Promise<ExampleData[]> => {
  const featureResult = await ctx.runAction(
    internal.ml.preprocessing.loadPredictionInputs,
    {}
  );

  const { trainingExamples } = featureResult;
  if (!trainingExamples?.length) {
    throw new Error("No training examples available");
  }

  return trainingExamples;
};

/**
 * Step 2: Organizes examples by route and filters routes with sufficient data
 * Groups training examples by route ID and ensures minimum data requirements are met
 */
const organizeDataByRoutes = (
  trainingExamples: ExampleData[]
): RouteGroup[] => {
  const validRouteGroups: RouteGroup[] = trainingExamples
    .filter(isNotOutlier)
    .reduce(groupExamplesByRoute, [])
    .filter(filterRoutesWithMinData(10));

  if (!validRouteGroups.length) {
    throw new Error("No routes have sufficient training data");
  }

  return validRouteGroups;
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
 * Trains prediction models for all routes
 * High-level training orchestration
 */
export const trainModelsForRoutes = async (
  routeGroups: RouteGroup[]
): Promise<ModelParameters[]> => {
  const trainedModels = await Promise.all(
    routeGroups.map(async (group) =>
      trainSingleModel(group.routeId, group.examples)
    )
  );

  return trainedModels.filter((m): m is ModelParameters => m !== null);
};

/**
 * Trains a single model for a specific route
 */
export const trainSingleModel = async (
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

    const metrics = calculateTrainingMetrics(data.y, predictions);

    return {
      routeId,
      modelType: "departure",
      coefficients,
      intercept,
      featureNames: [...FEATURE_NAMES], // Convert readonly to mutable
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
 * Trains a linear regression model using mljs
 */
export const trainLinearRegression = async (
  data: TrainingData
): Promise<{ coefficients: number[]; intercept: number }> => {
  const X = data.x;
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
  // Calculate delays directly from timestamps
  const delays = group.examples.map((ex) => {
    const actualTime = ex.target.departureTime;
    const scheduledTime = ex.input.currDepTimeSched;
    const delay = (actualTime - scheduledTime) / (60 * 1000); // Convert to minutes

    return delay;
  });

  const averageDelay =
    delays.length > 0
      ? delays.reduce((sum, delay) => sum + delay, 0) / delays.length
      : 0;

  const delayVariance =
    delays.length > 0
      ? delays.reduce((sum, delay) => sum + (delay - averageDelay) ** 2, 0) /
        delays.length
      : 0;

  let dataQuality: "excellent" | "good" | "poor";
  if (group.examples.length >= 50 && delayVariance < 100) {
    dataQuality = "excellent";
  } else if (group.examples.length >= 20 && delayVariance < 200) {
    dataQuality = "good";
  } else {
    dataQuality = "poor";
  }

  return {
    routeId: group.routeId,
    exampleCount: group.examples.length,
    hasValidData: group.examples.length > 0,
    averageDelay,
    dataQuality,
  };
};

/**
 * Feature names for the departure prediction model
 * 91 features total: 24 hour features + 2 day features + 5 timestamp features + 60 terminal features (3×20)
 */
export const FEATURE_NAMES: readonly string[] = [
  // 24 binary hour features
  ...Array.from({ length: 24 }, (_, i) => `hour_${i}`),
  // 2 binary features
  "isWeekday",
  "isWeekend",
  // 5 timestamp features (normalized)
  "prevArvTimeActual",
  "prevDepTimeSched",
  "prevDepTimeActual",
  "currArvTimeActual",
  "currDepTimeSched",
  // 60 terminal abbreviation features (3 terminals × 20 possible values each)
  // fromTerminalAbrv features
  ...Array.from({ length: 20 }, (_, i) => `fromTerminal_${i}`),
  // toTerminalAbrv features
  ...Array.from({ length: 20 }, (_, i) => `toTerminal_${i}`),
  // nextTerminalAbrv features
  ...Array.from({ length: 20 }, (_, i) => `nextTerminal_${i}`),
] as const;

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
 * Groups training examples by route ID for route-specific model training
 * Designed as a reducer function: (groups, example) => groups
 */
export const groupExamplesByRoute = (
  groups: RouteGroup[],
  example: ExampleData
): RouteGroup[] => {
  const existingGroup = groups.find((g) => g.routeId === example.input.routeId);

  if (existingGroup) {
    existingGroup.examples.push(example);
    return groups;
  } else {
    return [...groups, { routeId: example.input.routeId, examples: [example] }];
  }
};

/**
 * Filters routes to ensure they have sufficient training data for reliable model training
 * Designed as a filter function: (group) => boolean
 */
export const filterRoutesWithMinData =
  (minExamples: number) =>
  (group: RouteGroup): boolean =>
    group.examples.length >= minExamples;

import { api, internal } from "@convex/_generated/api";
import type { ActionCtx } from "@convex/_generated/server";

import { log } from "@/shared/lib/logger";

import type { ExampleData } from "./types";
import {
  fromNormalizedTimestamp,
  predictWithCoefficients,
  toPredictionVector,
} from "./utils";

// ============================================================================
// MAIN VALIDATION FUNCTIONS
// ============================================================================

/**
 * Main validation pipeline for analyzing training/validation data split
 * Orchestrates comprehensive data analysis and quality assessment
 */
export const validateDataPipeline = async (
  ctx: ActionCtx
): Promise<{
  dataOverview: {
    totalExamples: number;
    trainingExamples: number;
    validationExamples: number;
    splitRatio: number;
  };
  routeDistribution: Record<
    string,
    {
      training: number;
      validation: number;
      validationRatio: number;
    }
  >;
  dataQuality: {
    validTrainingExamples: number;
    validValidationExamples: number;
    invalidTrainingExamples: number;
    invalidValidationExamples: number;
  };
  timestampAnalysis: {
    trainingTimeRange: { start: number; end: number };
    validationTimeRange: { start: number; end: number };
    overlapAnalysis: string;
  };
  splitQuality: {
    isBalanced: boolean;
    routeCoverage: string;
    temporalSeparation: string;
    recommendations: string[];
  };
}> => {
  log.info("Starting validation data pipeline");

  // Step 1: Extract features with specified baseline
  const featureResult = await ctx.runAction(
    internal.ml.loading.loadPredictionInputs,
    {}
  );

  const { trainingExamples, validationExamples } = featureResult;

  if (!trainingExamples?.length || !validationExamples?.length) {
    throw new Error("Insufficient data for validation analysis");
  }

  // Step 2: Analyze data distribution and quality
  const dataOverview = analyzeDataOverview(
    trainingExamples,
    validationExamples
  );

  // Step 3: Analyze route distribution
  const routeDistribution = analyzeRouteDistribution(
    trainingExamples,
    validationExamples
  );

  // Step 4: Analyze data quality (check for valid feature vectors)
  const dataQuality = analyzeDataQuality(trainingExamples, validationExamples);

  // Step 5: Analyze timestamp distribution and potential overlap
  const timestampAnalysis = analyzeTimestampDistribution(
    trainingExamples,
    validationExamples
  );

  // Step 6: Assess overall split quality
  const splitQuality = assessSplitQuality(
    dataOverview,
    routeDistribution,
    timestampAnalysis
  );

  return {
    dataOverview,
    routeDistribution,
    dataQuality,
    timestampAnalysis,
    splitQuality,
  };
};

/**
 * Measures model accuracy on validation data
 * Tests trained models against validation examples to assess generalization performance
 */
export const measureValidationAccuracy = async (
  ctx: ActionCtx
): Promise<{
  routePerformance: Record<
    string,
    {
      totalExamples: number;
      mae: number;
      rmse: number;
      r2: number;
      avgError: number;
      stdDevError: number;
      predictions: Array<{
        actual: number;
        predicted: number;
        error: number;
        timestamp: number;
      }>;
    }
  >;
  overallPerformance: {
    totalExamples: number;
    avgMae: number;
    avgRmse: number;
    avgR2: number;
    avgError: number;
    stdDevError: number;
  };
}> => {
  // Step 1: Load trained models
  const models = await ctx.runQuery(
    api.functions.predictions.queries.getAllModelParameters
  );

  if (!models.length) {
    throw new Error("No trained models found");
  }

  // Step 2: Extract validation examples with specified baseline
  const featureResult = await ctx.runAction(
    internal.ml.loading.loadPredictionInputs,
    {}
  );

  const { validationExamples } = featureResult;

  if (!validationExamples?.length) {
    throw new Error("No validation examples available");
  }

  // Step 3: Test each model against validation data
  const routePerformance: Record<
    string,
    {
      totalExamples: number;
      mae: number;
      rmse: number;
      r2: number;
      avgError: number;
      stdDevError: number;
      predictions: Array<{
        actual: number;
        predicted: number;
        error: number;
        timestamp: number;
      }>;
    }
  > = {};

  // Group validation examples by route
  const examplesByRoute = validationExamples.reduce(
    (acc: Record<string, ExampleData[]>, example: ExampleData) => {
      const routeId = example.input.routeId;
      if (!acc[routeId]) acc[routeId] = [];
      acc[routeId].push(example);
      return acc;
    },
    {} as Record<string, ExampleData[]>
  );

  // Test each route's model
  for (const [routeId, examples] of Object.entries(examplesByRoute)) {
    const typedExamples = examples as ExampleData[];
    const model = models.find(
      (m) => m.routeId === routeId && m.modelType === "departure"
    );

    if (!model) {
      log.warn(`No trained model found for route ${routeId}`);
      continue;
    }

    // Make predictions on validation examples
    const predictions = typedExamples
      .map((example: ExampleData) => {
        try {
          const featureVector = toPredictionVector(example.input);
          const normalizedPrediction = predictWithCoefficients(
            featureVector,
            model.coefficients,
            model.intercept
          );

          // Convert normalized prediction back to timestamp
          const predictedTimestamp =
            fromNormalizedTimestamp(normalizedPrediction);

          // Calculate error in minutes
          const actualTimestamp = example.target.departureTime;
          const errorMinutes =
            (predictedTimestamp - actualTimestamp) / (1000 * 60);

          return {
            actual: actualTimestamp,
            predicted: predictedTimestamp,
            error: errorMinutes,
            timestamp: actualTimestamp,
          };
        } catch (error) {
          log.warn(`Failed to predict for example in route ${routeId}:`, error);
          return null;
        }
      })
      .filter((p): p is NonNullable<typeof p> => p !== null);

    if (predictions.length === 0) {
      log.warn(`No valid predictions for route ${routeId}`);
      continue;
    }

    // Calculate performance metrics
    const errors = predictions.map((p) => p.error);
    const avgError =
      errors.reduce((sum: number, e: number) => sum + e, 0) / errors.length;
    const mae =
      errors.reduce((sum: number, e: number) => sum + Math.abs(e), 0) /
      errors.length;
    const rmse = Math.sqrt(
      errors.reduce((sum: number, e: number) => sum + e * e, 0) / errors.length
    );

    // Calculate R²
    const actualValues = predictions.map((p) => p.actual);
    const predictedValues = predictions.map((p) => p.predicted);
    const actualMean =
      actualValues.reduce((sum: number, v: number) => sum + v, 0) /
      actualValues.length;
    const ssRes = errors.reduce((sum: number, e: number) => sum + e * e, 0);
    const ssTot = predictedValues.reduce(
      (sum: number, v: number) => sum + (v - actualMean) * (v - actualMean),
      0
    );
    const r2 = ssTot > 0 ? 1 - ssRes / ssTot : 0;

    // Calculate standard deviation of errors
    const stdDevError = Math.sqrt(
      errors.reduce(
        (sum: number, e: number) => sum + (e - avgError) * (e - avgError),
        0
      ) / errors.length
    );

    routePerformance[routeId] = {
      totalExamples: predictions.length,
      mae,
      rmse,
      r2,
      avgError,
      stdDevError,
      predictions,
    };
  }

  // Calculate overall performance metrics
  const routes = Object.values(routePerformance);
  const totalExamples = routes.reduce((sum, r) => sum + r.totalExamples, 0);
  const avgMae = routes.reduce((sum, r) => sum + r.mae, 0) / routes.length;
  const avgRmse = routes.reduce((sum, r) => sum + r.rmse, 0) / routes.length;
  const avgR2 = routes.reduce((sum, r) => sum + r.r2, 0) / routes.length;
  const avgError =
    routes.reduce((sum, r) => sum + r.avgError, 0) / routes.length;
  const stdDevError =
    routes.reduce((sum, r) => sum + r.stdDevError, 0) / routes.length;

  return {
    routePerformance,
    overallPerformance: {
      totalExamples,
      avgMae,
      avgRmse,
      avgR2,
      avgError,
      stdDevError,
    },
  };
};

// ============================================================================
// HELPER FUNCTIONS (in numerical order of execution)
// ============================================================================

/**
 * Step 2: Analyzes overall data distribution and split ratios
 */
const analyzeDataOverview = (
  trainingExamples: ExampleData[],
  validationExamples: ExampleData[]
) => {
  const totalExamples = trainingExamples.length + validationExamples.length;
  const splitRatio = Math.round(
    (validationExamples.length / totalExamples) * 100
  );

  return {
    totalExamples,
    trainingExamples: trainingExamples.length,
    validationExamples: validationExamples.length,
    splitRatio,
  };
};

/**
 * Step 3: Analyzes route distribution across training and validation sets
 */
const analyzeRouteDistribution = (
  trainingExamples: ExampleData[],
  validationExamples: ExampleData[]
): Record<
  string,
  { training: number; validation: number; validationRatio: number }
> => {
  const routeDistribution: Record<
    string,
    { training: number; validation: number; validationRatio: number }
  > = {};

  // Count examples by route for both sets
  trainingExamples.forEach((example: ExampleData) => {
    const routeId = example.input.routeId;
    if (!routeDistribution[routeId]) {
      routeDistribution[routeId] = {
        training: 0,
        validation: 0,
        validationRatio: 0,
      };
    }
    routeDistribution[routeId].training++;
  });

  validationExamples.forEach((example: ExampleData) => {
    const routeId = example.input.routeId;
    if (!routeDistribution[routeId]) {
      routeDistribution[routeId] = {
        training: 0,
        validation: 0,
        validationRatio: 0,
      };
    }
    routeDistribution[routeId].validation++;
  });

  // Calculate validation ratios for each route
  Object.keys(routeDistribution).forEach((routeId) => {
    const { training, validation } = routeDistribution[routeId];
    const total = training + validation;
    routeDistribution[routeId].validationRatio =
      total > 0 ? Math.round((validation / total) * 100) : 0;
  });

  return routeDistribution;
};

/**
 * Step 4: Analyzes data quality by checking feature vector validity
 */
const analyzeDataQuality = (
  trainingExamples: ExampleData[],
  validationExamples: ExampleData[]
) => {
  const validTrainingExamples = trainingExamples.filter(
    (example: ExampleData) => {
      try {
        toPredictionVector(example.input);
        return true;
      } catch {
        return false;
      }
    }
  ).length;

  const validValidationExamples = validationExamples.filter(
    (example: ExampleData) => {
      try {
        toPredictionVector(example.input);
        return true;
      } catch {
        return false;
      }
    }
  ).length;

  return {
    validTrainingExamples,
    validValidationExamples,
    invalidTrainingExamples: trainingExamples.length - validTrainingExamples,
    invalidValidationExamples:
      validationExamples.length - validValidationExamples,
  };
};

/**
 * Step 5: Analyzes timestamp distribution and checks for temporal overlap
 */
const analyzeTimestampDistribution = (
  trainingExamples: ExampleData[],
  validationExamples: ExampleData[]
) => {
  const trainingTimestamps = trainingExamples
    .map((ex: ExampleData) => ex.target.departureTime)
    .filter((t: number | null) => t !== null)
    .sort((a: number, b: number) => a - b);

  const validationTimestamps = validationExamples
    .map((ex: ExampleData) => ex.target.departureTime)
    .filter((t: number | null) => t !== null)
    .sort((a: number, b: number) => a - b);

  const trainingTimeRange = {
    start: trainingTimestamps[0] || 0,
    end: trainingTimestamps[trainingTimestamps.length - 1] || 0,
  };

  const validationTimeRange = {
    start: validationTimestamps[0] || 0,
    end: validationTimestamps[validationTimestamps.length - 1] || 0,
  };

  // Check for temporal overlap
  let overlapAnalysis = "No temporal overlap detected";
  if (
    trainingTimeRange.start < validationTimeRange.end &&
    trainingTimeRange.end > validationTimeRange.start
  ) {
    overlapAnalysis =
      "⚠️ TEMPORAL OVERLAP DETECTED - Training and validation sets may not be properly separated";
  }

  return {
    trainingTimeRange,
    validationTimeRange,
    overlapAnalysis,
  };
};

/**
 * Step 6: Assess overall split quality and provide recommendations
 */
const assessSplitQuality = (
  dataOverview: { splitRatio: number },
  routeDistribution: Record<string, { validationRatio: number }>,
  timestampAnalysis: { overlapAnalysis: string }
) => {
  const recommendations: string[] = [];

  // Check if split ratio is close to 20%
  const isBalanced = Math.abs(dataOverview.splitRatio - 20) <= 5;
  if (!isBalanced) {
    recommendations.push(
      `Split ratio (${dataOverview.splitRatio}%) is not close to ideal 20%`
    );
  }

  // Check route coverage
  const routeRatios = Object.values(routeDistribution).map(
    (r) => r.validationRatio
  );
  const avgRouteRatio =
    routeRatios.reduce((sum, ratio) => sum + ratio, 0) / routeRatios.length;
  const routeCoverage = Math.abs(avgRouteRatio - 20) <= 5 ? "Good" : "Poor";

  if (routeCoverage === "Poor") {
    recommendations.push(
      "Route distribution is uneven across training/validation sets"
    );
  }

  // Check temporal separation
  const temporalSeparation = timestampAnalysis.overlapAnalysis.includes(
    "OVERLAP"
  )
    ? "Poor"
    : "Good";
  if (temporalSeparation === "Poor") {
    recommendations.push(
      "Temporal overlap detected - consider time-based splitting"
    );
  }

  return {
    isBalanced,
    routeCoverage,
    temporalSeparation,
    recommendations,
  };
};

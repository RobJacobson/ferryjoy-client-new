import { v } from "convex/values";
import { Matrix } from "ml-matrix";
import MLR from "ml-regression-multivariate-linear";

import { api, internal } from "@/data/convex/_generated/api";
import { internalAction } from "@/data/convex/_generated/server";
import { log } from "@/shared/lib/logger";

import { prepareTrainingData } from "./featureUtils";
import type { EncodedFeatures, ModelParameters, TrainingData } from "./types";

type PredictionType = "departure" | "arrival";

/**
 * Trains prediction models for all routes
 */
export const trainPredictionModels = internalAction({
  args: {},
  handler: async (ctx) => {
    log.info("Starting prediction model training");

    try {
      const featureResult = await ctx.runAction(
        internal.training.preprocessing.extractPredictionFeatures,
        {}
      );

      if (!featureResult.success) throw new Error(featureResult.message);

      const { trainingFeatures } = featureResult;
      if (!trainingFeatures?.length) {
        log.warn("No training features available");
        return { success: false, message: "No training features available" };
      }

      const routeGroups = groupFeaturesByRoute(trainingFeatures);
      const trainedModels = await Promise.all(
        Array.from(routeGroups.entries()).map(async ([routeId, features]) =>
          trainSingleModel(routeId, features, "departure")
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
      return {
        success: true,
        message: `Trained ${models.length} models`,
        models,
      };
    } catch (error) {
      log.error("Model training failed:", error);
      return { success: false, message: `Model training failed: ${error}` };
    }
  },
});

const groupFeaturesByRoute = (
  features: EncodedFeatures[]
): Map<string, EncodedFeatures[]> =>
  features.reduce((groups, feature) => {
    const key = feature.routeId;
    const arr = groups.get(key) ?? [];
    arr.push(feature);
    groups.set(key, arr);
    return groups;
  }, new Map<string, EncodedFeatures[]>());

const trainSingleModel = async (
  routeId: string,
  features: EncodedFeatures[],
  modelType: PredictionType
): Promise<ModelParameters | null> => {
  try {
    const data = prepareTrainingData(features, modelType);
    if (data.x.length < 10) return null;

    const model = await trainLinearRegression(data);
    const metrics = calculateMetrics(data, model);

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

const trainLinearRegression = async (data: TrainingData) => {
  if (!data.x.length) throw new Error("No training data available");
  const expectedLength = data.x[0].length;
  if (!data.x.every((row) => row.length === expectedLength)) {
    throw new Error("Inconsistent feature vector lengths");
  }

  // Basic validation via Matrix (catches malformed shapes)
  new Matrix(data.x);
  new Matrix(data.y.map((v) => [v]));

  const y2D = data.y.map((val) => [val]);
  const regression = new MLR(data.x, y2D, { intercept: true }) as unknown as {
    weights: number[][];
  };

  const coefficients = regression.weights.slice(0, -1).map((row) => row[0]);
  const lastRow = regression.weights[regression.weights.length - 1];
  const intercept = lastRow ? lastRow[0] : 0;
  return { coefficients, intercept };
};

const calculateMetrics = (
  data: TrainingData,
  model: { coefficients: number[]; intercept: number }
) => {
  const predictions = data.x.map(
    (row) =>
      model.intercept +
      row.reduce((sum, f, j) => sum + f * model.coefficients[j], 0)
  );
  const residuals = data.y.map((y, i) => y - predictions[i]);
  const mae = residuals.reduce((s, r) => s + Math.abs(r), 0) / residuals.length;
  const mse = residuals.reduce((s, r) => s + r * r, 0) / residuals.length;
  const rmse = Math.sqrt(mse);
  const meanY = data.y.reduce((s, y) => s + y, 0) / data.y.length;
  const totalSS = data.y.reduce((s, y) => s + (y - meanY) ** 2, 0);
  const residualSS = residuals.reduce((s, r) => s + r * r, 0);
  const r2 = totalSS > 0 ? 1 - residualSS / totalSS : 0;
  return { mae, rmse, r2: Math.max(0, Math.min(1, r2)) };
};

const getFeatureNames = (_modelType: PredictionType): string[] => {
  const hourNames = Array.from({ length: 24 }, (_, i) => `hour_${i}`);
  return [
    ...hourNames,
    "isWeekday",
    "isWeekend",
    "priorStartMinutes",
    "previousDelay",
  ];
};

const generateModelVersion = (): string => {
  const iso = new Date().toISOString();
  return `v${iso.substring(0, 16)}`;
};

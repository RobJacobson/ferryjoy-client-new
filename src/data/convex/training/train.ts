import { Matrix } from "ml-matrix";
import MLR from "ml-regression-multivariate-linear";

import type { LinearRegressionModel, TrainingData } from "./types";

// ============================================================================
// MAIN FUNCTION
// ============================================================================

/**
 * Trains a linear regression model using mljs
 */
export const trainLinearRegression = async (
  data: TrainingData
): Promise<LinearRegressionModel> => {
  const X = data.x;
  const y = data.y.map((val) => [val]);

  return new Promise((resolve) => {
    const regression = new MLR(X, y);

    // Extract coefficients and intercept from the trained model
    const coefficients = regression.weights.slice(0, -1).map((row) => row[0]);
    const intercept = regression.weights[regression.weights.length - 1][0];

    const model: LinearRegressionModel = {
      coefficients,
      intercept,
      predict: (features: number[]) => {
        // Use the library's built-in predict method for reliability
        const prediction = regression.predict([features]);
        return prediction[0][0]; // Extract the single prediction value
      },
    };

    resolve(model);
  });
};

// ============================================================================
// HELPER FUNCTIONS (in order of use)
// ============================================================================

/**
 * Feature names for the departure prediction model
 * 8 features total: 24 hour features + 2 binary + 4 timestamp features
 */
export const FEATURE_NAMES: readonly string[] = [
  // 24 binary hour features
  ...Array.from({ length: 24 }, (_, i) => `hour_${i}`),
  // 2 binary features
  "isWeekday",
  "isWeekend",
  // 4 timestamp features (normalized)
  "prevArvTimeActual",
  "prevDepTimeSched",
  "prevDepTimeActual",
  "currArvTimeActual",
  "currDepTimeSched",
] as const;

/**
 * Generates a model version string
 */
export const generateModelVersion = (): string => {
  const now = new Date();
  return `v${now.toISOString().split("T")[0]}`;
};

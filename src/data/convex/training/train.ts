import { Matrix } from "ml-matrix";
import * as MLR from "ml-regression-multivariate-linear";

import type { TrainingData } from "./types";

// ============================================================================
// MAIN FUNCTION
// ============================================================================

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

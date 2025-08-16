import type {
  LinearRegressionModel,
  TrainingData,
  TrainingMetrics,
} from "./types";

/**
 * Calculates training metrics for a linear regression model
 */
export const calculateMetrics = (
  data: TrainingData,
  model: LinearRegressionModel
): TrainingMetrics => {
  const predictions = data.x.map((features) => model.predict(features));
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
  const ssTot = data.y.reduce((sum, actual) => sum + (actual - meanY) ** 2, 0);
  const r2 = 1 - ssRes / ssTot;

  return { mae, rmse, r2 };
};

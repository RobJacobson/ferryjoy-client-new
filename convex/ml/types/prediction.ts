// ============================================================================
// PREDICTION TYPES (Prediction pipeline specific)
// ============================================================================

/**
 * Feature vector for prediction input
 * Must match the structure used during training
 */
export type PredictionInput = {
  routeId: string;
  prevArvTimeActual: number;
  fromTerminalAbrv: string;
  prevDepTimeSched: number;
  prevDepTime: number;
  currArvTimeActual: number;
  toTerminalAbrv: string;
  nextTerminalAbrv: string;
  currDepTimeSched: number;
  scheduledDeparture: number;
  isWeekday: boolean;
  isWeekend: boolean;
};

/**
 * Prediction output with predicted time and confidence
 */
export type PredictionOutput = {
  predictedTime: number; // Predicted departure time as timestamp
  confidence: number; // Prediction confidence (0.1 to 0.9)
  modelVersion: string; // Model version used for prediction
};

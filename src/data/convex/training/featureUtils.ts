import type { EncodedFeatures, TrainingData } from "./types";

type PredictionType = "departure" | "arrival";

export const getFeatureVector = (
  feature: EncodedFeatures,
  _targetType: PredictionType
): number[] => [
  ...feature.hourFeatures,
  feature.isWeekday || 0,
  feature.isWeekend || 0,
  feature.priorStartMinutes ?? 0,
  feature.previousDelay ?? 0,
];

export const prepareTrainingData = (
  features: EncodedFeatures[],
  targetType: PredictionType
): TrainingData => {
  const tuples = features
    .map((f) => {
      const fv = getFeatureVector(f, targetType);
      if (targetType === "departure") {
        if (f.departureTime && f.schedDep) {
          const delayMinutes =
            (new Date(f.departureTime).getTime() -
              new Date(f.schedDep).getTime()) /
            (60 * 1000);
          return { x: fv, y: delayMinutes } as const;
        }
        return null;
      }
      if (f.actualArrival && f.schedDep) {
        const delayMinutes =
          (new Date(f.actualArrival).getTime() -
            new Date(f.schedDep).getTime()) /
          (60 * 1000);
        return { x: fv, y: delayMinutes } as const;
      }
      return null;
    })
    .filter((t): t is { x: number[]; y: number } => t !== null);

  const x = tuples.map((t) => t.x);
  const y = tuples.map((t) => t.y);
  return { x, y };
};

import { toNormalizedMinutes } from "../shared";
import type {
  FeatureVector,
  TrainingExample,
  TripPair,
  ValidatedVesselTrip,
} from "../types";

// ============================================================================
// MAIN ENCODING FUNCTION
// ============================================================================

/**
 * Converts trip pairs to feature vectors and training examples
 */
export const encodeFeatures = (pairs: TripPair[]): TrainingExample[] => {
  return pairs.map((pair) => ({
    input: extractFeatures(pair),
    target: predictDeparture(pair.currTrip),
  }));
};

/**
 * Extracts features from a trip pair
 */
const extractFeatures = (pair: TripPair): FeatureVector => {
  const { prevTrip: prev, currTrip: curr } = pair;

  const currHour = toHourOfDay(curr.ScheduledDeparture);
  const currDay = toDayOfWeek(curr.ScheduledDeparture);

  return {
    // Hour and day features
    ...createHourFeatures(currHour),
    ...createDayFeatures(currDay),

    // Terminal features
    ...createTerminalFeatures(curr.DepartingTerminalAbbrev),
    ...createTerminalFeatures(curr.ArrivingTerminalAbbrev),

    // Timestamp features (normalized)
    "timestamp.prevArvTimeActual": toNormalizedMinutes(prev.ArvDockActual),
    "timestamp.prevDepTimeSched": toNormalizedMinutes(prev.ScheduledDeparture),
    "timestamp.prevDepTime": toNormalizedMinutes(prev.LeftDock),
    "timestamp.currArvTimeActual": toNormalizedMinutes(curr.ArvDockActual),
    "timestamp.currDepTimeSched": toNormalizedMinutes(curr.ScheduledDeparture),

    // Time-based features
    "time.prevDelay": calculateDelay(prev),
    "time.currScheduledHour": currHour,
    "time.currScheduledMinutes": toMinutesSinceMidnight(
      curr.ScheduledDeparture
    ),
  };
};

// ============================================================================
// FEATURE EXTRACTION UTILITIES
// ============================================================================

const ALL_TERMINALS = [
  "SEA",
  "BI",
  "BA",
  "FA",
  "SO",
  "ED",
  "MU",
  "CL",
  "PO",
  "SW",
];

const toHourOfDay = (date: Date): number => date.getHours();
const toDayOfWeek = (date: Date): number => date.getDay();
const toMinutesSinceMidnight = (date: Date): number =>
  date.getHours() * 60 + date.getMinutes();

const createHourFeatures = (hour: number): Record<string, number> =>
  Object.fromEntries(
    Array.from({ length: 24 }, (_, i) => [
      `hourOfDay.${i.toString().padStart(2, "0")}`,
      i === hour ? 1 : 0,
    ])
  );

const createDayFeatures = (day: number): Record<string, number> => ({
  "dayType.isWeekday": day >= 1 && day <= 5 ? 1 : 0,
  "dayType.isWeekend": day === 0 || day === 6 ? 1 : 0,
});

const createTerminalFeatures = (terminal: string): Record<string, number> =>
  Object.fromEntries(
    ALL_TERMINALS.map((t) => [`terminal.${t}`, t === terminal ? 1 : 0])
  );

const calculateDelay = (trip: ValidatedVesselTrip): number => {
  const scheduled = trip.ScheduledDeparture.getTime();
  const actual = trip.LeftDock.getTime();
  return (actual - scheduled) / (1000 * 60);
};

const predictDeparture = (trip: ValidatedVesselTrip): number =>
  toNormalizedMinutes(trip.LeftDock);

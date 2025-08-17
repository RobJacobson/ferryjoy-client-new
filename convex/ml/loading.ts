import { api } from "@convex/_generated/api";
import type { ActionCtx } from "@convex/_generated/server";
import { internalAction } from "@convex/_generated/server";

import type { VesselTrip } from "@/data/types/domain/VesselTrip";
import { log } from "@/shared/lib/logger";

import { fromConvex } from "../../src/data/types/converters/convexConverters";
import type {
  FeatureVector,
  TrainingExample,
  FeatureInput as TrainingInput,
  FeatureOutput as TrainingOutput,
} from "./types";
import {
  groupListItem,
  toNormalizedMinutes,
  toPredictionVector,
} from "./utils";

/**
 * Type that guarantees all required fields for ML training are present
 * This eliminates the need for null checks in subsequent pipeline functions
 */
type ValidatedVesselTrip = VesselTrip & {
  OpRouteAbbrev: string;
  ArrivingTerminalAbbrev: string;
  DepartingTerminalAbbrev: string;
  ScheduledDeparture: Date;
  ArvDockActual: Date;
  LeftDock: Date;
};

/**
 * Main preprocessing pipeline for ML training data preparation
 * Orchestrates the extraction of prediction features from vessel trip data
 * Creates training examples by pairing consecutive trips and splitting into training/validation sets
 */

export const loadPredictionInputs = internalAction({
  args: {},
  handler: async (
    ctx
  ): Promise<{
    trainingExamples: TrainingExample[];
    validationExamples: TrainingExample[];
  }> => {
    // Step 1: Load and validate completed vessel trip data from database
    const validatedVesselTrips = await loadVesselTrips(ctx);

    // Step 2: Group vessel trips by vessel and sort by departure time
    const tripsByVessel = groupTripsByVesselAndSort(validatedVesselTrips);

    // Step 3: Transform vessel trips into training examples using sliding window pairs
    const examples = createTrainingExamples(tripsByVessel);

    // Step 4: Split examples into training (80%) and validation (20%) sets for ML pipeline
    const result = splitData(examples);

    // Log important info locally instead of passing up
    log.info(
      `Successfully extracted features from ${result.training.length + result.validation.length} trips`
    );

    return {
      trainingExamples: result.training,
      validationExamples: result.validation,
    };
  },
});

// ============================================================================
// HELPER FUNCTIONS (in numerical order of execution)
// ============================================================================

/**
 * Step 1: Loads and validates completed vessel trip data from database
 * Queries database for completed trips and ensures sufficient data availability
 */
const loadVesselTrips = async (
  ctx: ActionCtx
): Promise<ValidatedVesselTrip[]> => {
  const convexTrips = await ctx.runQuery(
    api.functions.vesselTrips.queries.getCompletedTrips
  );
  const completedVesselTrips = convexTrips.map(fromConvex) as VesselTrip[];

  // First filter by service status and basic requirements
  const inServiceTrips = completedVesselTrips.filter((vt) => vt.InService);

  // Then validate and filter required fields for ML training
  const validatedTrips = inServiceTrips.filter(
    validateAndFilterVesselTrip
  ) as ValidatedVesselTrip[];

  // Finally filter outliers (now with guaranteed non-null fields)
  const finalTrips = validatedTrips.filter(filterOutliers);

  return finalTrips;
};

/**
 * Validates and filters vessel trips to ensure all required fields for ML training are present
 * This creates a type guard that eliminates the need for null checks in subsequent functions
 */
const validateAndFilterVesselTrip = (trip: VesselTrip): boolean =>
  !!(
    trip.OpRouteAbbrev &&
    trip.ArrivingTerminalAbbrev &&
    trip.DepartingTerminalAbbrev &&
    trip.ScheduledDeparture &&
    trip.ArvDockActual &&
    trip.LeftDock
  );

const filterOutliers = (vt: ValidatedVesselTrip) => {
  // After validation, we know all required fields exist, so we can simplify the logic
  if (vt.ScheduledDeparture > vt.ArvDockActual) {
    return false;
  }
  if (
    vt.LeftDock.getTime() - vt.ScheduledDeparture.getTime() >
    60 * 60 * 1000
  ) {
    return false;
  }
  return true;
};

/**
 * Step 2: Groups vessel trips by vessel and sorts each vessel's trips by departure time
 * This creates time-ordered sequences for each vessel, which is essential for
 * creating meaningful training examples from consecutive trips (prev, next pairs)
 */
const groupTripsByVesselAndSort = (trips: ValidatedVesselTrip[]) => {
  // First group by vessel
  const tripsByVessel = trips.reduce(
    groupListItem((vt) => vt.VesselName),
    {}
  );

  // Then sort each vessel's trips by departure time
  Object.keys(tripsByVessel).forEach((vesselName) => {
    tripsByVessel[vesselName].sort(
      (a, b) => a.ScheduledDeparture.getTime() - b.ScheduledDeparture.getTime()
    );
  });

  return tripsByVessel;
};

/**
 * Step 3: Transforms vessel trip data into training examples using sliding window pairs
 * Creates consecutive trip pairs within each vessel group and converts them to ML-ready training examples
 */
const createTrainingExamples = (
  tripsByVessel: Record<string, ValidatedVesselTrip[]>
): TrainingExample[] => {
  // Process each vessel's trips to create consecutive pairs using reducer
  const examples = Object.values(tripsByVessel)
    .filter((vesselTrips) => vesselTrips.length >= 2) // Need at least 2 trips for pairs
    .flatMap((vesselTrips) =>
      vesselTrips.reduce(toTrainingExample, [] as TrainingExample[])
    );

  if (!examples.length) {
    throw new Error("No valid training examples could be created");
  }

  return examples;
};

/**
 * Reducer function that creates training examples from consecutive trip pairs
 * Processes vessel trips in chronological order to create (prev, curr) pairs
 */
const toTrainingExample = (
  acc: TrainingExample[],
  currTrip: ValidatedVesselTrip,
  index: number,
  vesselTrips: ValidatedVesselTrip[]
): TrainingExample[] => {
  if (index === 0) {
    return acc; // Skip first trip (no previous trip to pair with)
  }

  const prevTrip = vesselTrips[index - 1];
  const example = {
    trainingInput: toTrainingInput(prevTrip, currTrip),
    trainingOutput: toTrainingOutput(currTrip),
  } as TrainingExample;

  acc.push(example);
  return acc;
};

/**
 * Creates a PredictionInput from a pair of consecutive trips
 *
 * This function implements the core feature extraction logic for ML training.
 * It converts raw vessel trip data into structured features that capture:
 * - Temporal relationships between consecutive trips
 * - Terminal sequence information
 * - Schedule vs. actual timing differences
 *
 * Validation Strategy:
 * - Fail-fast approach: returns null for any invalid data
 * - Comprehensive field checking ensures data quality
 * - Invalid examples are filtered out upstream
 *
 * @param prevTrip - Previous vessel trip (for context)
 * @param currTrip - Current vessel trip (target for prediction)
 * @returns Structured prediction input or null if validation fails
 */
export const toTrainingInput = (
  prevTrip: ValidatedVesselTrip,
  currTrip: ValidatedVesselTrip
): TrainingInput => ({
  // Route identification
  routeId: currTrip.OpRouteAbbrev,

  // Previous trip data (for context and pattern learning)
  prevArvTimeActual: prevTrip.ArvDockActual,
  fromTerminalAbrv: prevTrip.DepartingTerminalAbbrev,
  prevDepTimeSched: prevTrip.ScheduledDeparture,
  prevDepTime: prevTrip.LeftDock,

  // Current trip data (target for prediction)
  currArvTimeActual: currTrip.ArvDockActual,
  toTerminalAbrv: currTrip.ArrivingTerminalAbbrev,
  nextTerminalAbrv: currTrip.DepartingTerminalAbbrev,
  currDepTimeSched: currTrip.ScheduledDeparture,

  // Derived features for ML model
  scheduledDeparture: currTrip.ScheduledDeparture.getTime(),

  // Day-of-week features (derived from scheduled departure)
  isWeekday: isWeekday(currTrip),
  isWeekend: !isWeekday(currTrip),
});

/**
 * Determines if a timestamp falls on a weekday (Monday-Friday)
 *
 * Provides binary classification for day-of-week pattern recognition in ML models.
 * Weekends often have different traffic patterns and schedules than weekdays.
 *
 * @param timestamp - Date object to check
 * @returns true if Monday-Friday, false if Saturday-Sunday
 * @throws Error if timestamp is invalid
 */
export const isWeekday = (vt: ValidatedVesselTrip): boolean =>
  vt.ScheduledDeparture.getDay() < 6;

const toTrainingOutput = (currTrip: VesselTrip): TrainingOutput => ({
  expectedDelay:
    toNormalizedMinutes(currTrip.LeftDock) -
    toNormalizedMinutes(currTrip.ScheduledDeparture),
});

/**
 * Step 4: Splits training examples into training (80%) and validation (20%) sets
 * Ensures proper data distribution for ML model training and evaluation
 */
const splitData = (examples: TrainingExample[]) => {
  return examples.reduce(toSplitExamples, {
    training: [],
    validation: [],
  });
};

// ============================================================================
// TRAINING DATA PREPARATION
// ============================================================================

/**
 * Converts training examples into ML-ready feature matrices and target vectors
 * Normalizes timestamps and validates feature vectors for optimal model training
 */
export const prepareTrainingData = (
  examples: TrainingExample[]
): { x: number[][]; y: number[] } => {
  const validExamples = examples.filter((example) => {
    try {
      toPredictionVector(example.input);
      return true;
    } catch {
      return false;
    }
  });

  return {
    x: validExamples.map((example) => [...toPredictionVector(example.input)]),
    y: validExamples.map((example) => example.target.departureTime),
  };
};

/**
 * Splits training examples into training (80%) and validation (20%) sets
 * Uses modulo-based distribution for consistent and reproducible data splitting
 */
const toSplitExamples = (
  acc: { training: TrainingExample[]; validation: TrainingExample[] },
  example: TrainingExample,
  index: number
) =>
  index % 5 !== 0
    ? { ...acc, training: [...acc.training, example] }
    : { ...acc, validation: [...acc.validation, example] };

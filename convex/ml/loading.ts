import { api } from "@convex/_generated/api";
import type { ActionCtx } from "@convex/_generated/server";
import { internalAction } from "@convex/_generated/server";

import type { VesselTrip } from "@/data/types/domain/VesselTrip";
import { log } from "@/shared/lib/logger";

import { fromConvex } from "../../src/data/types/converters/convexConverters";
import type { TrainingExample, ValidatedVesselTrip } from "./types";
import { groupListItem, toNormalizedMinutes } from "./utils";

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
  ) as unknown as ValidatedVesselTrip[];

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
  if (vt.ScheduledDeparture < vt.ArvDockActual) {
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
  const example: TrainingExample = {
    input: extractVesselTripFeatures(prevTrip, currTrip),
    target: { delayMinutes: calculateDelayMinutes(currTrip) },
  };

  acc.push(example);
  return acc;
};

/**
 * Extracts structured features from a pair of consecutive vessel trips
 * Creates the VesselTripFeatures structure that will be flattened in the encoding stage
 */
const extractVesselTripFeatures = (
  prevTrip: ValidatedVesselTrip,
  currTrip: ValidatedVesselTrip
) => {
  // Extract hour of day (0-23) and create binary array
  const hour = currTrip.ScheduledDeparture.getHours();
  const hourOfDay = Array.from({ length: 24 }, (_, i) => (i === hour ? 1 : 0));

  // Extract day type features
  const dayOfWeek = currTrip.ScheduledDeparture.getDay();
  const dayType = {
    isWeekday: dayOfWeek < 6 ? 1 : 0,
    isWeekend: dayOfWeek >= 6 ? 1 : 0,
  };

  // Extract timestamp features (normalized to minutes since reference)
  const timestamps = {
    prevArvTimeActual: toNormalizedMinutes(prevTrip.ArvDockActual),
    prevDepTimeSched: toNormalizedMinutes(prevTrip.ScheduledDeparture),
    prevDepTime: toNormalizedMinutes(prevTrip.LeftDock),
    currArvTimeActual: toNormalizedMinutes(currTrip.ArvDockActual),
    currDepTimeSched: toNormalizedMinutes(currTrip.ScheduledDeparture),
  };

  // Extract terminal features
  const terminals = {
    from: prevTrip.DepartingTerminalAbbrev,
    to: currTrip.ArrivingTerminalAbbrev,
    next: currTrip.DepartingTerminalAbbrev,
  };

  return {
    hourOfDay,
    dayType,
    timestamps,
    terminals,
  };
};

/**
 * Calculates delay in minutes for a vessel trip
 * Positive values indicate late departure, negative values indicate early departure
 */
const calculateDelayMinutes = (trip: ValidatedVesselTrip): number => {
  const scheduledTime = trip.ScheduledDeparture.getTime();
  const actualTime = trip.LeftDock.getTime();
  return (actualTime - scheduledTime) / (1000 * 60);
};

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

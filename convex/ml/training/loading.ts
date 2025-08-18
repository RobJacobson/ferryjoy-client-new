import { api } from "@convex/_generated/api";
import type { ActionCtx } from "@convex/_generated/server";
import { internalAction } from "@convex/_generated/server";

import type { VesselTrip } from "@/data/types/domain/VesselTrip";
import { log } from "@/shared/lib/logger";

import { fromConvex } from "../../../src/data/types/converters/convexConverters";
import { groupListItem, isValidVesselTrip } from "../shared";
import type { ValidatedVesselTrip, VesselTripPair } from "../types";

// ============================================================================
// MAIN FUNCTIONS
// ============================================================================

/**
 * Loads and prepares vessel trip data for ML pipelines
 * Returns raw vessel trip pairs that will be processed by the encoding stage
 *
 * This function focuses purely on data loading and validation:
 * 1. Retrieves vessel trips from the database
 * 2. Validates and filters trips for ML suitability
 * 3. Groups trips by vessel and creates consecutive pairs
 * 4. Returns raw pairs without feature extraction or data splitting
 *
 * @param ctx - Convex action context
 * @returns Array of vessel trip pairs ready for processing
 */
export const loadPredictionInputs = internalAction({
  args: {},
  handler: async (ctx): Promise<VesselTripPair[]> => {
    log.info("Starting vessel trip data loading for ML pipelines");

    // Step 1: Load vessel trips
    const trips = await loadVesselTrips(ctx);

    // Step 2: Validate and filter vessel trips
    const validatedTrips = validateAndFilterVesselTrips(trips);

    // Step 3: Group trips by vessel and create consecutive pairs
    const tripsByVessel = groupTripsByVesselAndSort(validatedTrips);

    // Step 4: Create vessel trip pairs
    const pairs = createVesselTripPairs(tripsByVessel);

    log.info(`Loaded ${pairs.length} vessel trip pairs`);

    return pairs;
  },
});

// ============================================================================
// HELPER FUNCTIONS (in numerical order of execution)
// ============================================================================

/**
 * Step 1: Loads vessel trips from the database
 * Retrieves all vessel trips and converts them to the domain model
 */
const loadVesselTrips = async (
  ctx: ActionCtx
): Promise<ValidatedVesselTrip[]> => {
  const convexTrips = await ctx.runQuery(
    api.functions.vesselTrips.queries.getCompletedTrips
  );
  log.info(`Loaded ${convexTrips.length} vessel trips from database`);

  // Convert from Convex format to domain model
  return convexTrips.map((trip) => fromConvex(trip)) as ValidatedVesselTrip[];
};

/**
 * Step 2: Validates and filters vessel trips to ensure all required fields for ML processing are present
 * Uses shared validation utilities to check field availability
 */
const validateAndFilterVesselTrips = (
  trips: VesselTrip[]
): ValidatedVesselTrip[] => {
  // First filter by service status
  const inServiceTrips = trips.filter((trip) => trip.InService);

  // Then validate required fields are present and cast to ValidatedVesselTrip
  const validTrips = inServiceTrips.filter(
    isValidVesselTrip
  ) as ValidatedVesselTrip[];

  if (!validTrips.length) {
    throw new Error(
      "No valid vessel trips found after validation and filtering"
    );
  }

  log.info(`Validated and filtered ${validTrips.length} vessel trips`);
  return validTrips;
};

/**
 * Step 3: Groups vessel trips by vessel and sorts each vessel's trips by departure time
 * This creates time-ordered sequences for each vessel, which is essential for
 * creating meaningful training examples from consecutive trips (prev, next pairs)
 */
const groupTripsByVesselAndSort = (trips: ValidatedVesselTrip[]) => {
  // First group by vessel
  const tripsByVessel = trips.reduce(
    groupListItem((trip) => trip.VesselName),
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
 * Step 4: Creates consecutive vessel trip pairs from sorted vessel trips
 * Creates (prev, curr) pairs within each vessel group for feature extraction
 */
const createVesselTripPairs = (
  tripsByVessel: Record<string, ValidatedVesselTrip[]>
): VesselTripPair[] => {
  // Process each vessel's trips to create consecutive pairs using reducer
  const pairs = Object.values(tripsByVessel)
    .filter((vesselTrips) => vesselTrips.length >= 2) // Need at least 2 trips for pairs
    .flatMap((vesselTrips) =>
      vesselTrips.reduce(toVesselTripPair, [] as VesselTripPair[])
    );

  if (!pairs.length) {
    throw new Error("No valid vessel trip pairs could be created");
  }

  return pairs;
};

/**
 * Reducer function that creates vessel trip pairs from consecutive trips
 * Processes vessel trips in chronological order to create (prev, curr) pairs
 */
const toVesselTripPair = (
  acc: VesselTripPair[],
  currTrip: ValidatedVesselTrip,
  index: number,
  vesselTrips: ValidatedVesselTrip[]
): VesselTripPair[] => {
  if (index === 0) {
    return acc; // Skip first trip (no previous trip to pair with)
  }

  const prevTrip = vesselTrips[index - 1];
  const pair: VesselTripPair = {
    prevTrip,
    currTrip,
    routeId: currTrip.OpRouteAbbrev,
  };

  acc.push(pair);
  return acc;
};

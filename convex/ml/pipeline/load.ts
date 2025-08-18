import { api } from "@convex/_generated/api";
import type { ActionCtx } from "@convex/_generated/server";

import type { ConvexVesselTrip, VesselTrip } from "@/data/types";
import { log } from "@/shared/lib/logger";

import { fromConvex } from "../../../src/data/types/converters/convexConverters";
import type { TripPair, ValidatedVesselTrip as ValidatedTrip } from "../types";

type VesselTripsByVessel = Record<string, ValidatedTrip[]>;

// ============================================================================
// VALIDATION UTILITIES
// ============================================================================

// ============================================================================
// MAIN FUNCTION
// ============================================================================

/**
 * Main pipeline function that loads, validates, filters, and creates training pairs
 * Orchestrates the entire data preparation process for ML training
 */
export const loadAndFilterTrips = async (
  ctx: ActionCtx
): Promise<TripPair[]> => {
  // Step 1: Load Convex vessel trips from database
  const convexTrips = await loadTrips(ctx);

  // Step 2: Convert Convex format to domain format and filter valid trips
  const validTrips = toValidTrips(convexTrips);

  // Step 3: Filter out outliers in the trips
  const filteredTrips = toFilteredTrips(validTrips);

  // Step 4 : Group trips by vessel for sequential analysis
  const tripsByVessel = toTripsGroupedByVessel(filteredTrips);

  // Step 5: Create a sorted record of vessel trips by vessel name, sorted by scheduled departure time
  const sortedTripsByVessel = toSortedTripsByVessel(tripsByVessel);

  // Step 6: Create trip pairs from sorted vessel trips
  const pairs = toTripPairs(sortedTripsByVessel);

  log.info(`Created ${pairs.length} trip pairs`);
  return pairs;
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Step 1: Loads vessel trips from the Convex database
 * Fetches all completed vessel trips for ML training
 */
const loadTrips = async (ctx: ActionCtx): Promise<ConvexVesselTrip[]> =>
  await ctx.runQuery(api.functions.vesselTrips.queries.getCompletedTrips);

/**
 * Step 2: Converts Convex vessel trips to domain format and filters for valid trips
 * Maps from Convex timestamp format to domain Date objects and validates required fields
 */
const toValidTrips = (convexTrips: ConvexVesselTrip[]): ValidatedTrip[] =>
  convexTrips
    .map(fromConvex)
    .filter((trip) => isValidTrip(trip as VesselTrip)) as ValidatedTrip[];
/**
 * Validates that a vessel trip has all required fields for ML training
 * Ensures all critical fields are present and non-null
 */
const isValidTrip = (trip: VesselTrip): boolean =>
  !!(
    trip.InService &&
    trip.OpRouteAbbrev &&
    trip.ArrivingTerminalAbbrev &&
    trip.DepartingTerminalAbbrev &&
    trip.ScheduledDeparture &&
    trip.ArvDockActual &&
    trip.LeftDock
  );

/**
 * Step 3: Applies additional filtering to remove outlier trips
 * Filters out trips with early departures and unreasonable delays
 */
const toFilteredTrips = (validTrips: ValidatedTrip[]): ValidatedTrip[] =>
  validTrips.filter(notEarlyDeparture).filter(isReasonableTime);

/**
 * Filters out trips where the vessel left dock before the scheduled departure time
 * This indicates data quality issues or incorrect timestamps
 */
const notEarlyDeparture = (trip: ValidatedTrip): boolean =>
  trip.LeftDock > trip.ScheduledDeparture;

/**
 * Filters out trips with unreasonable delays (more than 30 minutes)
 * Helps remove outliers that could skew the ML model training
 */
const isReasonableTime = (trip: ValidatedTrip): boolean =>
  trip.LeftDock.getTime() <= trip.ScheduledDeparture.getTime() + 30 * 60 * 1000;

/**
 * Step 4: Groups valid vessel trips by vessel name for sequential analysis
 * Creates a record where each key is a vessel name and value is an array of that vessel's trips
 */
const toTripsGroupedByVessel = (
  validTrips: ValidatedTrip[]
): VesselTripsByVessel => validTrips.reduce(groupTripsByVessel, {});

/**
 * Helper function to group trips by vessel name
 * Returns a new record with the vessel name as the key and the trips as the value
 */
const groupTripsByVessel = (
  acc: Record<string, ValidatedTrip[]>,
  trip: ValidatedTrip
) => {
  const vessel = acc[trip.VesselName] || [];
  vessel.push(trip);
  acc[trip.VesselName] = vessel;
  return acc;
};

/**
 * Step 5: Creates a new VesselTripsByVessel record with all trip arrays sorted by departure time
 * Returns immutable data without mutating the original record
 */
const toSortedTripsByVessel = (
  tripsByVessel: VesselTripsByVessel
): VesselTripsByVessel =>
  Object.fromEntries(
    Object.entries(tripsByVessel).map(([vesselName, trips]) => [
      vesselName,
      sortByScheduledDeparture(trips),
    ])
  );

/**
 * Helper function to sort vessel trips by scheduled departure time in ascending order
 * Returns a new sorted array without mutating the original
 */
const sortByScheduledDeparture = (trips: ValidatedTrip[]): ValidatedTrip[] =>
  trips.toSorted(
    (a, b) => a.ScheduledDeparture.getTime() - b.ScheduledDeparture.getTime()
  );

/**
 * Step 6: Creates consecutive trip pairs from sorted vessel trips for ML training
 * Generates (prevTrip, currTrip) pairs where each pair represents sequential trips by the same vessel
 */
const toTripPairs = (vesselTripsByVessel: VesselTripsByVessel): TripPair[] =>
  Object.values(vesselTripsByVessel).flatMap((vesselTrips) =>
    vesselTrips.slice(1).map((currTrip, i) => ({
      prevTrip: vesselTrips[i],
      currTrip,
      routeId: currTrip.OpRouteAbbrev,
    }))
  );

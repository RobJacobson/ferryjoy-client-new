import { api } from "@convex/_generated/api";
import type { ActionCtx } from "@convex/_generated/server";

import type { ActiveVesselTrip } from "@/data/types/ActiveVesselTrip";
import type { VesselLocation } from "@/data/types/VesselLocation";

import { toConvexActiveVesselTrip } from "../../functions/activeVesselTrips/schemas";

/**
 * Updates an existing active vessel trip with new location data.
 * This function compares the current trip with new location data and updates
 * only the fields that have changed, avoiding unnecessary database updates.
 *
 * @param ctx - The Convex action context for running mutations
 * @param currTrip - The existing active trip to be updated
 * @param currLocation - Current vessel location data from WSF API
 */
export const updateCurrentTrip = async (
  ctx: ActionCtx,
  currTrip: ActiveVesselTrip,
  currLocation: VesselLocation
): Promise<void> => {
  // Ensure the location data is for the same vessel and is newer
  if (
    currLocation.TimeStamp <= currTrip.TimeStamp ||
    currLocation.VesselID !== currTrip.VesselID
  ) {
    return;
  }

  // Get the update trip data
  const updatedTripData = getUpdateTripData(currTrip, currLocation);
  if (currTrip.VesselID === 15) {
    console.log("Curr trip: " + JSON.stringify(currTrip));
    console.log("Curr location: " + JSON.stringify(currLocation));
    console.log("Updated trip data: " + JSON.stringify(updatedTripData));
    console.log();
  }

  // Return early if none of the relevant fields have changed
  if (Object.keys(updatedTripData).length === 0) {
    return;
  }

  // Update the trip in the database
  await ctx.runMutation(api.functions.activeVesselTrips.mutations.update, {
    trip: toConvexActiveVesselTrip({
      ...currTrip, // Start with existing trip data
      ...updatedTripData, // Override only changed fields
      TimeStamp: currLocation.TimeStamp,
    }),
  });
};

/**
 * Compares two objects and returns only the fields that have different values.
 * This function is used to create partial update objects for database operations,
 * ensuring only changed fields are updated to minimize database writes.
 *
 * The function compares fields that exist in both ActiveVesselTrip and VesselLocation types,
 * using the commonFields array to ensure type safety and consistency.
 *
 * @param currTrip - The existing active vessel trip from the database
 * @param currLocation - Current vessel location data from WSF API
 * @returns A partial ActiveVesselTrip object containing only the fields that have changed,
 *          or an empty object if no changes are detected
 */
const getUpdateTripData = (
  currTrip: ActiveVesselTrip,
  currLocation: VesselLocation
): Partial<ActiveVesselTrip> =>
  commonFields.reduce(
    (updates, field) => {
      const locationValue = currLocation[field];
      const tripValue = currTrip[field];

      if (!valuesEqual(tripValue, locationValue)) {
        // Safe type assertion since we know the field exists in both types
        (updates as Record<string, unknown>)[field] = locationValue;
      }

      return updates;
    },
    {} as Partial<ActiveVesselTrip>
  );

// Fields present in both ActiveVesselTrip and VesselLocation
const commonFields: Array<keyof ActiveVesselTrip & keyof VesselLocation> = [
  "VesselID", // number
  "VesselName", // string
  "DepartingTerminalID", // number
  "DepartingTerminalName", // string
  "DepartingTerminalAbbrev", // string
  "ArrivingTerminalID", // number | null
  "ArrivingTerminalName", // string | null
  "ArrivingTerminalAbbrev", // string | null
  "InService", // boolean
  "AtDock", // boolean
  "ScheduledDeparture", // Date | null
  "LeftDock", // Date | null
  "Eta", // Date | null
  "OpRouteAbbrev", // string | null (now consistent across both types)
  "VesselPositionNum", // number | null
];

// Compare values with special handling for Date and null
const valuesEqual = (a: unknown, b: unknown): boolean => {
  // null === null
  if (a === null && b === null) return true;
  // If either is null, not equal (previous branch handled both-null)
  if (a === null || b === null) return false;
  // Dates by value
  const isDateA = a instanceof Date;
  const isDateB = b instanceof Date;
  if (isDateA || isDateB) {
    if (!isDateA || !isDateB) return false;
    return (a as Date).getTime() === (b as Date).getTime();
  }
  // Primitive strict equality otherwise
  return a === b;
};

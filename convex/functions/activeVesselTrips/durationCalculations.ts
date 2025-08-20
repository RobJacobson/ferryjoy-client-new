import type { Doc } from "@convex/_generated/dataModel";

import type { VesselTrip } from "@/data/types/domain/VesselTrip";

import { type ConvexVesselTrip, toConvexVesselTrip } from "./schemas";

/**
 * Calculates how late a vessel departed from its scheduled departure time.
 * Returns 0 if either leftDock or scheduledDeparture is not available.
 */
export const calculateLeftDockDelay = (prev: ConvexVesselTrip): number =>
  prev.LeftDock && prev.ScheduledDeparture
    ? prev.LeftDock - prev.ScheduledDeparture
    : 0;

/**
 * Calculates how long a vessel was docked from trip start to leaving dock.
 * Returns 0 if leftDock is not available.
 */
export const calculateAtDockDuration = (
  prev: ConvexVesselTrip & { TripStart: number }
): number => (prev.LeftDock ? prev.LeftDock - prev.TripStart : 0);

/**
 * Calculates the total journey duration from trip start to trip end.
 */
export const calculateTotalDuration = (
  prev: ConvexVesselTrip & { TripStart: number },
  curr: ConvexVesselTrip
): number => curr.TimeStamp - prev.TripStart;

/**
 * Calculates how long a vessel was at sea from leaving dock to arrival.
 * Returns 0 if leftDock is not available.
 */
export const calculateAtSeaDuration = (
  prev: ConvexVesselTrip,
  curr: ConvexVesselTrip
): number => (prev.LeftDock ? curr.TimeStamp - prev.LeftDock : 0);

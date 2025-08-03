import { distance, point } from "@turf/turf";
import { WsfVessels } from "ws-dottie";

import { api } from "@/data/convex/_generated/api";
import type { Doc } from "@/data/convex/_generated/dataModel";
import { internalAction } from "@/data/convex/_generated/server";
import {
  type ConvexVesselPing,
  toConvexVesselPing,
  toVesselPing,
} from "@/data/types/VesselPing";
import { log } from "@/shared/lib/logger";

import { withLogging } from "../shared/logging";

/**
 * Configuration constants for vessel ping processing
 */
const CONFIG = {
  /** Minimum speed threshold in knots to consider vessel in motion */
  SPEED_THRESHOLD_KNOTS: 0.3,
  /** Minimum distance threshold in meters to consider vessel movement significant */
  DISTANCE_THRESHOLD_METERS: 25,
  /** Hours to keep vessel ping records before cleanup */
  CLEANUP_HOURS: 24,
  /** Number of retry attempts for API calls */
  RETRY_ATTEMPTS: 2,
  /** Delay between retry attempts in milliseconds */
  RETRY_DELAY_MS: 5000,
} as const;

/**
 * Internal action for fetching and storing vessel locations from WSF API
 * This is called by cron jobs and makes external HTTP requests
 */
export const fetchAndStoreVesselPings = internalAction({
  args: {},
  handler: withLogging(
    "Vessel Pings cron job",
    async (
      ctx
    ): Promise<{
      success: boolean;
      count: number;
      filtered: number;
      message?: string;
    }> => {
      // Fetch current vessel locations with retry logic
      const currLocations = await fetchVesselLocationsWithRetry();

      // Get previous locations from Convex for comparison
      const prevLocations = await ctx.runQuery(
        api.functions.vesselPings.queries.getMostRecentPingsForAllVessels,
        {}
      );

      // Create lookup map for efficient vessel ID access
      const prevLocationsMap = createPrevLocationsMap(prevLocations);

      // Filter to only vessels with significant movement and newer timestamps
      const filteredVesselLocations = currLocations
        .filter(hasMoved(prevLocationsMap)) // Speed or distance threshold
        .filter(hasNewerTimestamp(prevLocationsMap)); // Prevent outdated data

      const filteredCount =
        currLocations.length - filteredVesselLocations.length;

      // Store filtered locations to database
      if (filteredVesselLocations.length > 0) {
        await ctx.runMutation(api.functions.vesselPings.mutations.bulkInsert, {
          locations: filteredVesselLocations,
        });
      }

      return {
        success: true,
        count: filteredVesselLocations.length,
        filtered: filteredCount,
        message: `Processing ${currLocations.length} vessels: ${filteredVesselLocations.length} in motion, ${filteredCount} filtered`,
      };
    }
  ),
});

/**
 * Calculates the distance between two vessel pings in meters
 *
 * @param curr - Current vessel ping location
 * @param prev - Previous vessel ping location
 * @returns Distance in meters between the two points
 */
const distanceMoved = (curr: ConvexVesselPing, prev: ConvexVesselPing) =>
  distance(
    point([curr.Longitude, curr.Latitude]),
    point([prev.Longitude, prev.Latitude]),
    { units: "meters" }
  );

/**
 * Creates a lookup map for efficient vessel ID access
 *
 * @param prevLocations - Array of previous vessel ping locations
 * @returns Map with vessel ID as key and ping data as value
 */
const createPrevLocationsMap = (prevLocations: ConvexVesselPing[]) =>
  new Map(prevLocations.map((ping) => [ping.VesselID, ping]));

/**
 * Fetches vessel locations from WSF API with retry logic and error handling
 *
 * @returns Promise resolving to array of current vessel ping locations
 * @throws Error if all retry attempts fail or no vessel data is received
 */
const fetchVesselLocationsWithRetry = async (): Promise<ConvexVesselPing[]> => {
  const fetchLocations = async (): Promise<ConvexVesselPing[]> => {
    const rawLocations = await WsfVessels.getVesselLocations();
    return rawLocations
      .filter((vessel) => vessel.InService)
      .map(toVesselPing)
      .map(toConvexVesselPing) as ConvexVesselPing[];
  };

  for (let attempt = 0; attempt <= CONFIG.RETRY_ATTEMPTS; attempt++) {
    try {
      const locations = await fetchLocations();

      // Validate we got reasonable data
      if (locations.length === 0) {
        throw new Error("No vessel locations received from WSF API");
      }

      return locations;
    } catch (error) {
      if (attempt === CONFIG.RETRY_ATTEMPTS) {
        log.error("Failed to fetch vessel locations after all retries:", error);
        throw error;
      }

      log.warn(
        `Retry ${attempt + 1}/${CONFIG.RETRY_ATTEMPTS} after error:`,
        error
      );
      await new Promise((resolve) =>
        setTimeout(resolve, CONFIG.RETRY_DELAY_MS)
      );
    }
  }

  throw new Error("Unexpected retry loop exit");
};

/**
 * Creates a filter function to check if vessel has significant movement
 *
 * @param prevLocationsMap - Map of previous vessel locations by vessel ID
 * @returns Filter function that returns true for vessels with significant movement
 */
const hasMoved = (prevLocationsMap: Map<number, ConvexVesselPing>) => {
  return (currLocation: ConvexVesselPing): boolean => {
    const prevLocation = prevLocationsMap.get(currLocation.VesselID);
    if (!prevLocation) {
      return true; // First ping for this vessel
    }

    return (
      currLocation.Speed >= CONFIG.SPEED_THRESHOLD_KNOTS ||
      distanceMoved(currLocation, prevLocation as ConvexVesselPing) >=
        CONFIG.DISTANCE_THRESHOLD_METERS
    );
  };
};

/**
 * Creates a filter function to ensure current ping has newer timestamp than previous
 *
 * @param prevLocationsMap - Map of previous vessel locations by vessel ID
 * @returns Filter function that returns true for pings with newer timestamps
 */
const hasNewerTimestamp = (prevLocationsMap: Map<number, ConvexVesselPing>) => {
  return (currLocation: ConvexVesselPing): boolean => {
    const prevLocation = prevLocationsMap.get(currLocation.VesselID);
    if (!prevLocation) {
      return true; // First ping for this vessel
    }

    return currLocation.TimeStamp > prevLocation.TimeStamp;
  };
};

/**
 * Internal action for cleaning up old vessel ping records
 * Deletes records older than 24 hours to prevent unlimited database growth
 */
export const cleanupOldPings = internalAction({
  args: {},
  handler: withLogging(
    "Vessel Pings cleanup",
    async (
      ctx
    ): Promise<{
      success: boolean;
      deletedCount: number;
      message?: string;
    }> => {
      const cutoffTime = Date.now() - CONFIG.CLEANUP_HOURS * 60 * 60 * 1000;

      const oldPings = await ctx.runQuery(
        api.functions.vesselPings.queries.getOlderThan,
        { cutoffTime, limit: 1000 }
      );

      if (oldPings.length > 0) {
        await ctx.runMutation(api.functions.vesselPings.mutations.bulkDelete, {
          ids: oldPings.map((p: Doc<"vesselPings">) => p._id),
        });
      }

      return {
        success: true,
        deletedCount: oldPings.length,
        message: `Deleted ${oldPings.length} records`,
      };
    }
  ),
});

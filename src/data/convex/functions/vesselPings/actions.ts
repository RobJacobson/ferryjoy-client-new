import { distance, point } from "@turf/turf";
import { WsfVessels } from "ws-dottie";

import { api } from "@/data/convex/_generated/api";
import { internalAction } from "@/data/convex/_generated/server";
import {
  type ConvexVesselPing,
  toConvexVesselPing,
  toVesselPing,
} from "@/data/types/VesselPing";
import { log } from "@/shared/lib/logger";

/**
 * Internal action for fetching and storing vessel locations from WSF API
 * This is called by cron jobs and makes external HTTP requests
 */
export const fetchAndStoreVesselPings = internalAction({
  args: {},
  handler: async (
    ctx
  ): Promise<{ success: boolean; count: number; filtered: number }> => {
    try {
      const startTime = new Date();

      const rawLocations = (await WsfVessels.getVesselLocations())
        .filter((vessel) => vessel.InService)
        .map(toVesselPing)
        .map(toConvexVesselPing) as ConvexVesselPing[];

      // Get most recent pings for comparison
      const vesselIds = rawLocations.map((location) => location.VesselID);
      const recentPings = await ctx.runQuery(
        api.functions.vesselPings.queries.getMostRecentByVesselIds,
        { vesselIds }
      );

      const recentPingsMap = new Map(
        recentPings.map((ping) => [ping.VesselID, ping])
      );

      // Filter locations to only store significant movements
      const significantLocations = rawLocations.filter(
        createSignificantMovementFilter(recentPingsMap)
      );

      const filteredCount = rawLocations.length - significantLocations.length;

      // Store only significant locations
      if (significantLocations.length > 0) {
        await ctx.runMutation(api.functions.vesselPings.mutations.bulkInsert, {
          locations: significantLocations,
        });
      }

      const endTime = new Date();
      const duration = endTime.getTime() - startTime.getTime();
      log.info(
        `✅ Vessel Pings cron job completed at ${endTime.toISOString()} (duration: ${duration}ms) - Stored: ${significantLocations.length}, Filtered: ${filteredCount}`
      );
      return {
        success: true,
        count: significantLocations.length,
        filtered: filteredCount,
      };
    } catch (error) {
      log.error("Error in cron job fetching and storing vessel pings:", error);
      throw error;
    }
  },
});

/**
 * Creates a filter function to determine if a vessel ping represents significant movement
 *
 * @param recentPingsMap - Map of vessel IDs to their most recent ping data
 * @returns Filter function that returns true for pings with significant movement
 */
const createSignificantMovementFilter =
  (recentPingsMap: Map<number, ConvexVesselPing>) =>
  (location: ConvexVesselPing): boolean => {
    const recentPing = recentPingsMap.get(location.VesselID);

    // Always store first ping for a vessel
    if (!recentPing) {
      return true;
    }

    // Check speed threshold (>= 0.3 knots)
    if (location.Speed >= 0.3) {
      return true;
    }

    // Check distance threshold (>= 25 meters)
    const currentPoint = point([location.Longitude, location.Latitude]);
    const previousPoint = point([recentPing.Longitude, recentPing.Latitude]);
    const distanceMeters = distance(currentPoint, previousPoint, {
      units: "meters",
    });

    return distanceMeters >= 25;
  };

/**
 * Internal action for cleaning up old vessel ping records
 * Deletes records older than 24 hours to prevent unlimited database growth
 */
export const cleanupOldPings = internalAction({
  args: {},
  handler: async (ctx): Promise<{ success: boolean; deletedCount: number }> => {
    try {
      const startTime = new Date();
      const cutoffTime = Date.now() - 24 * 60 * 60 * 1000; // 24 hours ago

      // Get old records in batches to avoid memory issues
      const oldPings = await ctx.runQuery(
        api.functions.vesselPings.queries.getOlderThan,
        { cutoffTime, limit: 1000 }
      );

      let totalDeleted = 0;

      if (oldPings.length > 0) {
        await ctx.runMutation(api.functions.vesselPings.mutations.bulkDelete, {
          ids: oldPings.map((p) => p._id),
        });
        totalDeleted = oldPings.length;

        log.info(
          `🧹 Deleted ${totalDeleted} old vessel ping records (older than 24h)`
        );
      }

      const endTime = new Date();
      const duration = endTime.getTime() - startTime.getTime();
      log.info(
        `✅ Vessel Pings cleanup completed at ${endTime.toISOString()} (duration: ${duration}ms)`
      );

      return { success: true, deletedCount: totalDeleted };
    } catch (error) {
      log.error("Error in vessel pings cleanup:", error);
      return { success: false, deletedCount: 0 };
    }
  },
});

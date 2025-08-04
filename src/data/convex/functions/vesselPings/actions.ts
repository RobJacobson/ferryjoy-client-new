import { WsfVessels } from "ws-dottie";

import { api } from "@/data/convex/_generated/api";
import { internalAction } from "@/data/convex/_generated/server";
import {
  type ConvexVesselPing,
  toConvexVesselPing,
  toVesselPing,
} from "@/data/types/VesselPing";

import { withLogging } from "../shared/logging";
import type { VesselPingDoc } from "./types";

/**
 * Configuration constants for vessel ping processing
 */
const CONFIG = {
  /** Hours to keep vessel ping records before cleanup */
  CLEANUP_HOURS: 24,
} as const;

/**
 * Internal action for fetching and storing vessel locations from WSF API
 * This is called by cron jobs and makes external HTTP requests
 */
export const fetchAndStoreVesselPings = internalAction({
  args: {},
  handler: withLogging(
    "Vessel Pings update",
    async (
      ctx
    ): Promise<{
      success: boolean;
      count: number;
      filtered: number;
      message?: string;
    }> => {
      // Fetch current vessel locations from WSF API
      const rawLocations = await WsfVessels.getVesselLocations();
      const currLocations = rawLocations
        .map(toVesselPing)
        .map(toConvexVesselPing) as ConvexVesselPing[];

      // Validate we got reasonable data
      if (currLocations.length === 0) {
        throw new Error("No vessel locations received from WSF API");
      }

      // Store locations to database
      await ctx.runMutation(api.functions.vesselPings.mutations.bulkInsert, {
        locations: currLocations,
      });

      return {
        success: true,
        count: currLocations.length,
        filtered: 0,
        message: `Saved ${currLocations.length} vessel pings`,
      };
    }
  ),
});

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
          ids: oldPings.map((p: VesselPingDoc) => p._id),
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

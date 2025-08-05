import { WsfVessels } from "ws-dottie";

import { api } from "@/data/convex/_generated/api";
import { internalAction } from "@/data/convex/_generated/server";
import { toConvex } from "@/data/types/converters";
import type { ConvexVesselLocation } from "@/data/types/convex/VesselLocation";
import { toVesselLocation } from "@/data/types/domain/VesselLocation";

import { withLogging } from "../shared/logging";

/**
 * Internal action for fetching and storing vessel locations from WSF API
 * This is called by cron jobs and makes external HTTP requests
 * Stores data without any filtering or transforming
 */
export const fetchAndStoreVesselLocations = internalAction({
  args: {},
  handler: withLogging(
    "Vessel Locations update",
    async (
      ctx
    ): Promise<{
      success: boolean;
      count: number;
      message?: string;
    }> => {
      // Fetch current vessel data from WSF API
      const rawVesselData = await WsfVessels.getVesselLocations();
      const vesselLocations = rawVesselData
        .map(toVesselLocation)
        .map(toConvex) as unknown as ConvexVesselLocation[];

      // Validate we got reasonable data
      if (vesselLocations.length === 0) {
        throw new Error("No vessel data received from WSF API");
      }

      // Store locations to database
      await ctx.runMutation(api.functions.vesselLocation.mutations.bulkInsert, {
        locations: vesselLocations,
      });

      return {
        success: true,
        count: vesselLocations.length,
        message: `Saved ${vesselLocations.length} vessel locations`,
      };
    }
  ),
});

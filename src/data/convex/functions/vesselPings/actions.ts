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
  handler: async (ctx): Promise<{ success: boolean; count: number }> => {
    try {
      const startTime = new Date();

      const convexLocations = (await WsfVessels.getVesselLocations())
        .map(toVesselPing)
        .map(toConvexVesselPing) as ConvexVesselPing[];

      // Call the public mutation to store the data
      const ids: string[] = await ctx.runMutation(
        api.functions.vesselPings.mutations.bulkInsert,
        {
          locations: convexLocations,
        }
      );

      const endTime = new Date();
      const duration = endTime.getTime() - startTime.getTime();
      log.info(
        `✅ Vessel Pings cron job completed at ${endTime.toISOString()} (duration: ${duration}ms)`
      );
      return { success: true, count: ids.length };
    } catch (error) {
      log.error("Error in cron job fetching and storing vessel pings:", error);
      throw error;
    }
  },
});

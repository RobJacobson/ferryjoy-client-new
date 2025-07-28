import { configManager, WsfVessels } from "ws-dottie";

import { api } from "@/data/convex/_generated/api";
import { internalAction } from "@/data/convex/_generated/server";
import { toConvex } from "@/data/convex/utils";
import { log } from "@/shared/lib/logger";

/**
 * Test function to check environment variables
 */
export const testEnvironmentVariables = internalAction({
  args: {},
  handler: async (ctx) => {
    const envVars = {
      WSDOT_ACCESS_TOKEN: process.env.WSDOT_ACCESS_TOKEN ? "Set" : "Not set",
      NODE_ENV: process.env.NODE_ENV,
    };
    log.info("Environment variables:", envVars);
    return envVars;
  },
});

/**
 * Internal action for fetching and storing vessel locations from WSF API
 * This is called by cron jobs and makes external HTTP requests
 */
export const fetchAndStoreVesselLocations = internalAction({
  args: {},
  handler: async (ctx): Promise<{ success: boolean; count: number }> => {
    try {
      const startTime = new Date();
      log.info(`🚢 Cron job started at ${startTime.toISOString()}`);

      const apiKey = process.env.WSDOT_ACCESS_TOKEN;
      log.info(`API Key available: ${apiKey ? "Yes" : "No"}`);

      if (!apiKey) {
        throw new Error("WSDOT_ACCESS_TOKEN environment variable is not set");
      }

      // Let ws-dottie automatically pick up the WSDOT_ACCESS_TOKEN environment variable
      // configManager.setApiKey(apiKey); // Removed - ws-dottie should auto-detect
      const locations = await WsfVessels.getVesselLocations();

      // Convert VesselLocation to Convex format using the reviver function
      const convexLocations = locations.map(toConvex);

      // Call the public mutation to store the data
      const ids: string[] = await ctx.runMutation(
        api.functions.vessels.mutations.bulkInsert,
        {
          locations: convexLocations,
        }
      );

      const endTime = new Date();
      const duration = endTime.getTime() - startTime.getTime();
      log.info(
        `✅ Cron job completed at ${endTime.toISOString()} (duration: ${duration}ms)`
      );
      log.info(`Cron job stored ${ids.length} vessel locations`);
      return { success: true, count: ids.length };
    } catch (error) {
      log.error(
        "Error in cron job fetching and storing vessel locations:",
        error
      );
      throw error;
    }
  },
});

import { type VesselBasic, WsfVessels } from "ws-dottie";

import { api } from "@/data/convex/_generated/api";
import { internalAction } from "@/data/convex/_generated/server";
import { log } from "@/shared/lib/logger";

import type { ConvexVesselBasics } from "./types";

/**
 * Internal action to update vessel basics from WSF API
 * Scheduled to run daily to keep vessel data current
 */
export const updateVesselBasics = internalAction({
  handler: async (ctx) => {
    try {
      // Fetch vessel basics from WSF API
      const vesselBasics = await WsfVessels.getVesselBasics();

      // Transform to Convex format
      const convexVesselBasics: ConvexVesselBasics[] = vesselBasics.map(
        (vessel: VesselBasic) => ({
          VesselID: vessel.VesselID,
          VesselName: vessel.VesselName,
          VesselAbbrev: vessel.VesselAbbrev,
          LastUpdated: Date.now(),
        })
      );

      // Call the public mutation to store the data
      await ctx.runMutation(api.functions.vesselBasics.mutations.bulkUpsert, {
        vessels: convexVesselBasics,
      });

      log.info(
        `✅ Vessel Basics updated: ${convexVesselBasics.length} vessels`
      );
    } catch (error) {
      log.error("Failed to update vessel basics:", error);
    }
  },
});

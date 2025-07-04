import {
  toVesselLocationConvex,
  toVesselLocationFromWsf,
  type VesselLocationApiResponse,
} from "../../shared/VesselLocation";
import { api } from "../_generated/api";
import type { Id } from "../_generated/dataModel";
import { action } from "../_generated/server";
import { fetchWsfServer } from "../lib/fetchServer";

/**
 * Fetch vessel locations from WSF and upsert to current locations table
 * This ensures the current table always has the latest data for each vessel
 */
export const fetchAndUpsertVesselLocationsCurrent = action({
  handler: async (
    ctx
  ): Promise<{
    success: boolean;
    message: string;
    upsertedCount?: number;
    skippedCount?: number;
    totalProcessed?: number;
  }> => {
    try {
      console.log("Fetching vessel locations for current table...");

      // Fetch vessel locations from WSF API (external call)
      const vesselLocationsWsf =
        await fetchWsfServer<VesselLocationApiResponse[]>("/vessellocations");
      const vesselLocations = vesselLocationsWsf?.map(toVesselLocationFromWsf);

      if (!vesselLocations || vesselLocations.length === 0) {
        console.log("No vessel locations received from WSF API");
        return {
          success: false,
          message: "No vessel locations received from WSF API",
          upsertedCount: 0,
          skippedCount: 0,
          totalProcessed: 0,
        };
      }

      // Convert all vessel locations to Convex format
      const convexData = vesselLocations.map(toVesselLocationConvex);

      // Upsert all locations to the current table
      const result: {
        upsertedCount: number;
        skippedCount: number;
        totalProcessed: number;
        upsertedIds: Id<"vesselLocationsCurrent">[];
      } = await ctx.runMutation(
        api.vesselLocationsCurrent.vesselLocationCurrentMutations
          .bulkUpsertVesselLocationsCurrent,
        {
          vesselLocations: convexData,
        }
      );

      console.log(
        `Processed ${result.totalProcessed} vessel locations: ${result.upsertedCount} upserted, ${result.skippedCount} skipped`
      );

      return {
        success: true,
        message: `Successfully processed ${result.totalProcessed} vessel locations: ${result.upsertedCount} upserted, ${result.skippedCount} skipped`,
        upsertedCount: result.upsertedCount,
        skippedCount: result.skippedCount,
        totalProcessed: result.totalProcessed,
      };
    } catch (error) {
      console.error("Error in fetchAndUpsertVesselLocationsCurrent:", error);

      return {
        success: false,
        message: `Error fetching vessel locations: ${error instanceof Error ? error.message : "Unknown error"}`,
        upsertedCount: 0,
        skippedCount: 0,
        totalProcessed: 0,
      };
    }
  },
});

import {
  toVesselLocationConvex,
  toVesselLocationFromWsf,
  type VesselLocationApiResponse,
} from "../../shared/VesselLocation";
import { api } from "../_generated/api";
import { action } from "../_generated/server";
import { fetchWsfServer } from "../lib/fetchServer";

/**
 * Fetch vessel locations from WSF API and store them in the database
 */
export const fetchAndStoreVesselLocations = action({
  handler: async (
    ctx
  ): Promise<{ success: boolean; message: string; count?: number }> => {
    console.log("Starting vessel locations fetch and store operation");

    try {
      // Fetch vessel locations from WSF API (external call)
      const vesselLocationsWsf =
        await fetchWsfServer<VesselLocationApiResponse[]>("/vessellocations");
      const vesselLocations = vesselLocationsWsf?.map(toVesselLocationFromWsf);

      if (!vesselLocations || vesselLocations.length === 0) {
        console.log("No vessel locations retrieved from API");
        return {
          success: false,
          message: "No vessel locations retrieved from API",
        };
      }

      // Convert all vessel locations to Convex format
      const convexData = vesselLocations.map(toVesselLocationConvex);

      // Log sample data (first record only to reduce noise)
      if (convexData.length > 0) {
        console.log(
          "Sample vessel location data:",
          JSON.stringify(convexData[0], null, 2)
        );
      }

      // Bulk insert all vessel locations in a single mutation call
      const result: { insertedCount: number; insertedIds: any[] } =
        await ctx.runMutation(
          api.vesselLocations.vesselLocationMutations.bulkInsertVesselLocations,
          { vesselLocations: convexData }
        );

      console.log(
        `Successfully stored ${result.insertedCount} vessel locations`
      );
      return {
        success: true,
        message: `Successfully stored ${result.insertedCount} vessel locations`,
        count: result.insertedCount,
      };
    } catch (error) {
      console.error("Error in fetchAndStoreVesselLocations:", error);
      return {
        success: false,
        message: `Error fetching vessel locations: ${error instanceof Error ? error.message : "Unknown error"}`,
      };
    }
  },
});

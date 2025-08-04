import { WsfVessels } from "ws-dottie";

import { api } from "@/data/convex/_generated/api";
import { internalAction } from "@/data/convex/_generated/server";
import { toVesselLocation } from "@/data/types/VesselLocation";

import { withLogging } from "../shared/logging";
import { type ConvexVesselLocation, toConvexVesselLocation } from "./types";

/**
 * Configuration constants for vessel location processing
 */
// const CONFIG = {
//   /** Hours to keep vessel location records before cleanup */
//   CLEANUP_HOURS: 24,
// } as const;

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
        .map(toConvexVesselLocation) as ConvexVesselLocation[];

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

/**
 * Internal action for cleaning up old vessel location records
 * Deletes records older than 24 hours to prevent unlimited database growth
 */
// export const cleanupOldLocations = internalAction({
//   args: {},
//   handler: withLogging(
//     "Vessel Locations cleanup",
//     async (
//       ctx
//     ): Promise<{
//       success: boolean;
//       deletedCount: number;
//       message?: string;
//     }> => {
//       const cutoffTime = Date.now() - CONFIG.CLEANUP_HOURS * 60 * 60 * 1000;

//       const oldLocations = await ctx.runQuery(
//         api.functions.vesselLocation.queries.getOlderThan,
//         { cutoffTime, limit: 1000 }
//       );

//       if (oldLocations.length > 0) {
//         await ctx.runMutation(
//           api.functions.vesselLocation.mutations.bulkDelete,
//           {
//             ids: oldLocations.map((f) => f._id),
//           }
//         );
//       }

//       return {
//         success: true,
//         deletedCount: oldLocations.length,
//         message: `Deleted ${oldLocations.length} records`,
//       };
//     }
//   ),
// });

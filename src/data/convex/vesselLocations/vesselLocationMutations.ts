import { v } from "convex/values";

import { mutation } from "../_generated/server";
import { insertVesselLocationIfNotExists } from "./vesselLocationHelpers";
import { vesselLocationArgs } from "./vesselLocationValidation";

/**
 * Bulk insert multiple vessel locations efficiently
 * Processes an array of vessel locations in a single mutation call
 */
export const bulkInsertVesselLocations = mutation({
  args: {
    vesselLocations: v.array(v.object(vesselLocationArgs)),
  },
  handler: async (ctx, { vesselLocations }) => {
    const results = [];

    for (const vesselLocation of vesselLocations) {
      const result = await insertVesselLocationIfNotExists(
        ctx.db,
        vesselLocation
      );
      if (result) {
        results.push(result);
      }
    }

    return {
      insertedCount: results.length,
      insertedIds: results,
    };
  },
});

/**
 * Insert single vessel location (kept for compatibility/testing)
 */
export const insertVesselLocation = mutation({
  args: vesselLocationArgs,
  handler: async (ctx, args) => {
    return await insertVesselLocationIfNotExists(ctx.db, args);
  },
});

import { v } from "convex/values";

import type { Id } from "../_generated/dataModel";
import { mutation } from "../_generated/server";
import { upsertVesselLocationCurrent } from "./vesselLocationCurrentHelpers";
import { vesselLocationCurrentArgs } from "./vesselLocationCurrentValidation";

/**
 * Bulk upsert multiple vessel locations to current table efficiently
 * Processes an array of vessel locations in a single mutation call
 * Only upserts when the new data has a newer timestamp than existing data
 */
export const bulkUpsertVesselLocationsCurrent = mutation({
  args: {
    vesselLocations: v.array(v.object(vesselLocationCurrentArgs)),
  },
  handler: async (ctx, { vesselLocations }) => {
    const results: Id<"vesselLocationsCurrent">[] = [];
    let skippedCount = 0;

    for (const vesselLocation of vesselLocations) {
      const result = await upsertVesselLocationCurrent(ctx.db, vesselLocation);
      if (result) {
        results.push(result);
      } else {
        // Null result means existing data was newer, so we skipped this update
        skippedCount++;
      }
    }

    return {
      upsertedCount: results.length,
      skippedCount,
      totalProcessed: vesselLocations.length,
      upsertedIds: results,
    };
  },
});

/**
 * Upsert single vessel location to current table
 */
export const upsertCurrentVesselLocation = mutation({
  args: vesselLocationCurrentArgs,
  handler: async (ctx, args) => {
    return await upsertVesselLocationCurrent(ctx.db, args);
  },
});

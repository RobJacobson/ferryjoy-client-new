import { v } from "convex/values";

import { mutation } from "@/data/convex/_generated/server";

import type { ConvexVesselBasics } from "./types";

/**
 * API function for bulk upserting vessel basics
 * Used by the scheduled function to update vessel data
 */
export const bulkUpsert = mutation({
  args: {
    vessels: v.array(
      v.object({
        VesselID: v.number(),
        VesselName: v.string(),
        VesselAbbrev: v.string(),
        LastUpdated: v.number(),
      })
    ),
  },
  handler: async (ctx, args) => {
    const results: string[] = [];

    for (const vessel of args.vessels) {
      const existingVessel = await ctx.db
        .query("vesselBasics")
        .withIndex("by_vessel_id", (q) => q.eq("VesselID", vessel.VesselID))
        .first();

      if (existingVessel) {
        // Update existing vessel
        await ctx.db.patch(existingVessel._id, vessel);
        results.push(existingVessel._id);
      } else {
        // Insert new vessel
        const id = await ctx.db.insert("vesselBasics", vessel);
        results.push(id);
      }
    }

    return results;
  },
});

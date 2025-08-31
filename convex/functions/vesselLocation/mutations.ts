import { mutation } from "@convex/_generated/server";
import { v } from "convex/values";

import type { VesselLocation } from "@/data/types/VesselLocation";

import { toConvexVesselLocation } from "./schemas";

/**
 * Bulk insert vessel locations into the database
 */
export const bulkInsert = mutation({
  args: { locations: v.array(v.any()) }, // domain-ish args if needed
  handler: async (ctx, args: { locations: VesselLocation[] }) => {
    // map domain → convex
    const convexVesselLocations = args.locations.map(toConvexVesselLocation);

    for (const cvl of convexVesselLocations) {
      await ctx.db.insert("vesselLocations", cvl);
    }
    return { success: true, count: convexVesselLocations.length };
  },
});

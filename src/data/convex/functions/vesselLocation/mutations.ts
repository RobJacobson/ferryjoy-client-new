import { v } from "convex/values";

import { mutation } from "@/data/convex/_generated/server";
import type { ConvexVesselLocation } from "@/data/types/convex/VesselLocation";
import { vesselLocationValidationSchema } from "@/data/types/convex/VesselLocation";

/**
 * Bulk insert vessel locations into the database
 */
export const bulkInsert = mutation({
  args: {
    locations: v.array(v.object(vesselLocationValidationSchema)),
  },
  handler: async (ctx, args: { locations: ConvexVesselLocation[] }) => {
    const insertPromises = args.locations.map((location) =>
      ctx.db.insert("vesselLocations", location)
    );

    await Promise.all(insertPromises);

    return {
      success: true,
      count: args.locations.length,
    };
  },
});

// No other mutations at this time

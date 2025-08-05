import { v } from "convex/values";

import type { Id } from "@/data/convex/_generated/dataModel";
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

/**
 * Bulk delete vessel locations by IDs
 */
export const bulkDelete = mutation({
  args: {
    ids: v.array(v.id("vesselLocations")),
  },
  handler: async (ctx, args: { ids: Id<"vesselLocations">[] }) => {
    const deletePromises = args.ids.map((id) => ctx.db.delete(id));

    await Promise.all(deletePromises);

    return {
      success: true,
      count: args.ids.length,
    };
  },
});

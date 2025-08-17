import type { Id } from "@convex/_generated/dataModel";
import { internalMutation, mutation } from "@convex/_generated/server";
import { v } from "convex/values";

import type { ConvexVesselPing } from "@/data/types/convex/VesselPing";
import { vesselPingValidationSchema } from "@/data/types/convex/VesselPing";

/**
 * Bulk insert multiple vessel ping records
 * Used by actions to store vessel location data
 */
export const bulkInsert = mutation({
  args: {
    locations: v.array(v.object(vesselPingValidationSchema)),
  },
  handler: async (ctx, args: { locations: ConvexVesselPing[] }) => {
    for (const location of args.locations) {
      await ctx.db.insert("vesselPings", location);
    }
  },
});

/**
 * Bulk delete multiple vessel ping records
 * Used for cleanup operations to remove old records
 */
export const bulkDelete = mutation({
  args: {
    ids: v.array(v.id("vesselPings")),
  },
  handler: async (ctx, args: { ids: Id<"vesselPings">[] }) => {
    for (const id of args.ids) {
      await ctx.db.delete(id);
    }
    return { deletedCount: args.ids.length };
  },
});

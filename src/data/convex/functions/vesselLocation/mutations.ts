import { v } from "convex/values";

import { mutation } from "@/data/convex/_generated/server";

import { vesselLocationValidationSchema } from "./types";

/**
 * Bulk insert vessel locations into the database
 */
export const bulkInsert = mutation({
  args: {
    locations: v.array(v.object(vesselLocationValidationSchema)),
  },
  handler: async (ctx, { locations }) => {
    const insertPromises = locations.map((location) =>
      ctx.db.insert("vesselLocation", location)
    );

    await Promise.all(insertPromises);

    return {
      success: true,
      count: locations.length,
    };
  },
});

/**
 * Bulk delete vessel locations by IDs
 */
export const bulkDelete = mutation({
  args: {
    ids: v.array(v.id("vesselLocation")),
  },
  handler: async (ctx, { ids }) => {
    const deletePromises = ids.map((id) => ctx.db.delete(id));

    await Promise.all(deletePromises);

    return {
      success: true,
      count: ids.length,
    };
  },
});

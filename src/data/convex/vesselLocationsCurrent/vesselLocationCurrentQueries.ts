import { v } from "convex/values";

import { query } from "../_generated/server";
import {
  getAllCurrentVesselLocations,
  getCurrentVesselLocationByID,
} from "./vesselLocationCurrentHelpers";

/**
 * Get all current vessel locations
 * Returns the most recent location for each vessel
 */
export const getAllVesselLocationsCurrent = query({
  args: {},
  handler: async (ctx) => {
    return await getAllCurrentVesselLocations(ctx.db);
  },
});

/**
 * Get current vessel location by vessel ID
 */
export const getVesselLocationCurrentByID = query({
  args: {
    vesselID: v.number(),
  },
  handler: async (ctx, { vesselID }) => {
    return await getCurrentVesselLocationByID(ctx.db, vesselID);
  },
});

/**
 * Get current vessel locations for multiple vessels
 */
export const getVesselLocationsCurrentByIDs = query({
  args: {
    vesselIDs: v.array(v.number()),
  },
  handler: async (ctx, { vesselIDs }) => {
    const results = [];

    for (const vesselID of vesselIDs) {
      const location = await getCurrentVesselLocationByID(ctx.db, vesselID);
      if (location) {
        results.push(location);
      }
    }

    return results;
  },
});

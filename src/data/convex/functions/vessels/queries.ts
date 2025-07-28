import { v } from "convex/values";

import { query } from "@/data/convex/_generated/server";

import { vesselQueryArgs } from "./types";

export const getByVesselId = query({
  args: vesselQueryArgs,
  handler: async (ctx, args) => {
    return await ctx.db
      .query("vesselLocations")
      .withIndex("by_vessel_id", (q) => q.eq("VesselID", args.VesselID))
      .first();
  },
});

export const getAll = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("vesselLocations").collect();
  },
});

export const getInService = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("vesselLocations")
      .withIndex("by_service_status", (q) =>
        q.eq("InService", true).eq("AtDock", false)
      )
      .collect();
  },
});

export const getAtDock = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("vesselLocations")
      .withIndex("by_service_status", (q) =>
        q.eq("InService", true).eq("AtDock", true)
      )
      .collect();
  },
});

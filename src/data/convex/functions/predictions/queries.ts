import { v } from "convex/values";

import { query } from "@/data/convex/_generated/server";

/**
 * Gets all model parameters
 */
export const getAllModelParameters = query({
  args: {},
  handler: async (ctx) => ctx.db.query("modelParameters").collect(),
});

/**
 * Gets all current predictions
 */
export const getAllCurrentPredictions = query({
  args: {},
  handler: async (ctx) => ctx.db.query("currentPredictions").collect(),
});

/**
 * Gets current predictions by type
 */
export const getCurrentPredictionsByType = query({
  args: {
    predictionType: v.union(v.literal("departure"), v.literal("arrival")),
  },
  handler: async (ctx, args) =>
    ctx.db
      .query("currentPredictions")
      .filter((q) => q.eq(q.field("predictionType"), args.predictionType))
      .collect(),
});

/**
 * Gets current predictions by route
 */
export const getCurrentPredictionsByRoute = query({
  args: { routeId: v.string() },
  handler: async (ctx, args) =>
    ctx.db
      .query("currentPredictions")
      .withIndex("by_route", (q) => q.eq("routeId", args.routeId))
      .collect(),
});

/**
 * Gets all historical predictions
 */
export const getAllHistoricalPredictions = query({
  args: {},
  handler: async (ctx) => ctx.db.query("historicalPredictions").collect(),
});

/**
 * Gets historical predictions by type
 */
export const getHistoricalPredictionsByType = query({
  args: {
    predictionType: v.union(v.literal("departure"), v.literal("arrival")),
  },
  handler: async (ctx, args) =>
    ctx.db
      .query("historicalPredictions")
      .filter((q) => q.eq(q.field("predictionType"), args.predictionType))
      .collect(),
});

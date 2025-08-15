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
 * Gets all current departure predictions
 */
export const getAllDeparturePredictions = query({
  args: {},
  handler: async (ctx) => ctx.db.query("currentDeparturePredictions").collect(),
});

/**
 * Gets all current arrival predictions
 */
export const getAllArrivalPredictions = query({
  args: {},
  handler: async (ctx) => ctx.db.query("currentArrivalPredictions").collect(),
});

/**
 * Gets all departure predictions (historical)
 */
export const getAllDeparturePredictionsHistorical = query({
  args: {},
  handler: async (ctx) => ctx.db.query("departurePredictions").collect(),
});

/**
 * Gets all arrival predictions (historical)
 */
export const getAllArrivalPredictionsHistorical = query({
  args: {},
  handler: async (ctx) => ctx.db.query("arrivalPredictions").collect(),
});

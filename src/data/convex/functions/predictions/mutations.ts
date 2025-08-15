import { v } from "convex/values";

import type { MutationCtx } from "@/data/convex/_generated/server";
import { mutation } from "@/data/convex/_generated/server";
import { log } from "@/shared/lib/logger";

import {
  currentPredictionDataSchema,
  modelParametersMutationSchema,
} from "../../schema";
import type {
  CurrentPredictionData,
  ModelParameters,
} from "../../training/types";

type PredictionTable = "currentPredictions";

/**
 * Helper function to update or create a prediction in the current predictions table
 */
const updateOrCreatePrediction = async (
  ctx: MutationCtx,
  tableName: PredictionTable,
  prediction: CurrentPredictionData
) => {
  const existing = await ctx.db
    .query(tableName)
    .withIndex("by_vessel_and_type", (q) =>
      q
        .eq("vesselId", prediction.vesselId)
        .eq("predictionType", prediction.predictionType)
    )
    .unique();

  if (existing) {
    await ctx.db.patch(existing._id, prediction);
    log.info(
      `Updated current ${prediction.predictionType} prediction for vessel ${prediction.vesselId}`
    );
  } else {
    await ctx.db.insert(tableName, prediction);
    log.info(
      `Created current ${prediction.predictionType} prediction for vessel ${prediction.vesselId}`
    );
  }
};

/**
 * Stores model parameters in the database
 */
export const storeModelParametersMutation = mutation({
  args: {
    model: v.object(modelParametersMutationSchema),
  },
  handler: async (ctx, args) => {
    try {
      const modelId = await ctx.db.insert(
        "modelParameters",
        args.model as ModelParameters
      );
      log.info(`Stored model parameters: ${modelId}`);
      return modelId;
    } catch (error) {
      log.error("Failed to store model parameters:", error);
      throw error;
    }
  },
});

/**
 * Factory function to create prediction update mutations
 */
const createPredictionMutation = (tableName: PredictionTable) =>
  mutation({
    args: {
      prediction: v.object(currentPredictionDataSchema),
    },
    handler: async (ctx, args) => {
      try {
        await updateOrCreatePrediction(
          ctx,
          tableName,
          args.prediction as CurrentPredictionData
        );
      } catch (error) {
        log.error(`Failed to update current prediction:`, error);
        throw error;
      }
    },
  });

/**
 * Updates current prediction for a vessel (handles both departure and arrival)
 */
export const updateCurrentPredictionMutation =
  createPredictionMutation("currentPredictions");

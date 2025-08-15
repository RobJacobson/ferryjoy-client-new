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

type PredictionTable =
  | "currentDeparturePredictions"
  | "currentArrivalPredictions";

/**
 * Helper function to update or create a prediction in the specified table
 */
const updateOrCreatePrediction = async (
  ctx: MutationCtx,
  tableName: PredictionTable,
  prediction: CurrentPredictionData
) => {
  const allPredictions = await ctx.db.query(tableName).collect();
  const existing = allPredictions.find(
    (p) => p.vesselId === prediction.vesselId
  );

  const predictionType =
    tableName === "currentDeparturePredictions" ? "departure" : "arrival";

  if (existing) {
    await ctx.db.patch(existing._id, prediction);
    log.info(
      `Updated current ${predictionType} prediction for vessel ${prediction.vesselId}`
    );
  } else {
    await ctx.db.insert(tableName, prediction);
    log.info(
      `Created current ${predictionType} prediction for vessel ${prediction.vesselId}`
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
        const predictionType =
          tableName === "currentDeparturePredictions" ? "departure" : "arrival";
        log.error(
          `Failed to update current ${predictionType} prediction:`,
          error
        );
        throw error;
      }
    },
  });

/**
 * Updates current departure prediction for a vessel
 */
export const updateCurrentDeparturePredictionMutation =
  createPredictionMutation("currentDeparturePredictions");

/**
 * Updates current arrival prediction for a vessel
 */
export const updateCurrentArrivalPredictionMutation = createPredictionMutation(
  "currentArrivalPredictions"
);

import { v } from "convex/values";

import { api } from "@/data/convex/_generated/api";
import type { ActionCtx } from "@/data/convex/_generated/server";
import { internalAction } from "@/data/convex/_generated/server";
import { log } from "@/shared/lib/logger";

import { vesselTripValidationSchema } from "../../types/convex/VesselTrip";
import type { Id } from "../_generated/dataModel";
import { generatePrediction } from "./predicting";
import { trainPredictionModelsPipeline } from "./training";
import type { PredictionOutput, TrainingResponse } from "./types";
import { measureValidationAccuracy, validateDataPipeline } from "./validating";

// ============================================================================
// ROOT ACTIONS (Public API)
// ============================================================================

/**
 * Predicts departure time for a vessel trip pair
 * Delegates to prediction module for core logic
 */
export const predictTimeAction = internalAction({
  args: {
    prevTrip: v.object(vesselTripValidationSchema),
    currTrip: v.object(vesselTripValidationSchema),
  },
  handler: async (ctx, args): Promise<PredictionOutput> => {
    // TODO: This will work once Convex generates the proper API structure
    // For now, call the function directly
    return await generatePrediction(ctx, args);
  },
});

// ============================================================================
// TRAINING ACTIONS
// ============================================================================

/**
 * Trains prediction models for all routes
 * Delegates to training module for core logic
 */
export const trainPredictionModelsAction = internalAction({
  args: {},
  handler: async (ctx): Promise<TrainingResponse> => {
    log.info("Starting prediction model training");
    return await trainPredictionModelsPipeline(ctx);
  },
});

/**
 * Validates the training/validation data split quality
 * Delegates to validation module for comprehensive analysis
 */
export const validateDataAction = internalAction({
  args: {},
  handler: async (ctx) => {
    log.info("Starting validation data analysis");
    return await validateDataPipeline(ctx);
  },
});

/**
 * Measures model accuracy on validation data
 * Tests trained models against validation examples to assess generalization
 */
export const measureValidationAccuracyAction = internalAction({
  args: {},
  handler: async (ctx) => {
    log.info("Starting validation accuracy measurement");
    return await measureValidationAccuracy(ctx);
  },
});

/**
 * Deletes all models from the database
 */
export const deleteAllModelsAction = internalAction({
  args: {},
  handler: async (ctx: ActionCtx) => {
    log.info("Starting deletion of all models");

    // Get all model IDs
    const models: Array<{ _id: Id<"modelParameters"> }> = await ctx.runQuery(
      api.functions.predictions.queries.getAllModelParameters
    );

    if (models.length === 0) {
      log.info("No models found to delete");
      return { deletedCount: 0 };
    }

    log.info(`Found ${models.length} models to delete`);

    // Delete each model
    const deletePromises = models.map((model) =>
      ctx.runMutation(
        api.functions.predictions.mutations.deleteModelParametersMutation,
        {
          modelId: model._id,
        }
      )
    );

    await Promise.all(deletePromises);

    log.info(`Successfully deleted ${models.length} models`);
    return { deletedCount: models.length };
  },
});

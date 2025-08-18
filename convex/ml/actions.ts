import { api } from "@convex/_generated/api";
import type { ActionCtx } from "@convex/_generated/server";
import { internalAction } from "@convex/_generated/server";
import { v } from "convex/values";

import { vesselTripValidationSchema } from "@/data/types/convex/VesselTrip";
import { log } from "@/shared/lib/logger";

import type { Id } from "../_generated/dataModel";
import { generatePrediction } from "./predicting";
import { trainPredictionModelsPipeline } from "./training";
import type {
  FeatureVector,
  PredictionOutput,
  TrainingResponse,
} from "./types";

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
    // Extract features from the vessel trips using a simple approach
    const features = extractSimplePredictionFeatures(
      args.prevTrip,
      args.currTrip
    );
    const routeId = args.currTrip.OpRouteAbbrev || "unknown";

    // Generate prediction using the extracted features
    return await generatePrediction(ctx, features, routeId);
  },
});

/**
 * Simple feature extraction for prediction inputs
 * Creates a basic feature vector from vessel trip data
 */
const extractSimplePredictionFeatures = (
  prevTrip: Record<string, unknown>,
  currTrip: Record<string, unknown>
): FeatureVector => {
  // For now, create a simple feature vector
  // TODO: Implement proper feature extraction matching the training pipeline
  return {
    "hourOfDay.00": 0, // Placeholder - should be extracted from currTrip.ScheduledDeparture
    "terminal.SEA": 1, // Placeholder - should be one-hot encoded
    "timestamp.currDepTimeSched": 0, // Placeholder - should be normalized timestamp
  };
};

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

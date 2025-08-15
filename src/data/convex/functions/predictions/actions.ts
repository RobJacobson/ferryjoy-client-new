import type { FunctionReference } from "convex/server";
import { v } from "convex/values";

import { api, internal } from "@/data/convex/_generated/api";
import type { ActionCtx } from "@/data/convex/_generated/server";
import { internalAction } from "@/data/convex/_generated/server";
import type { ConvexVesselTrip } from "@/data/types/convex/VesselTrip";
import { log } from "@/shared/lib/logger";

import type {
  CurrentPredictionData,
  PredictionInput,
  PredictionOutput,
} from "../../training/types";

type PredictionType = "departure" | "arrival";

type PredictionConfig = {
  type: PredictionType;
  action: FunctionReference<"action", "internal">;
  mutation: FunctionReference<"mutation", "public">;
  prepareInput: (trip: ConvexVesselTrip) => PredictionInput;
  prepareData: (
    trip: ConvexVesselTrip,
    prediction: PredictionOutput
  ) => CurrentPredictionData;
};

/**
 * Updates predictions for all active vessels
 */
export const updatePredictions = internalAction({
  args: {},
  handler: async (
    ctx
  ): Promise<{ success: boolean; message: string; count?: number }> => {
    log.info("Starting prediction updates for active vessels");

    try {
      const activeTrips = await ctx.runQuery(
        api.functions.vesselTrips.queries.getActiveTrips
      );
      log.info(`Found ${activeTrips.length} active trips to update`);

      const results = await Promise.all(
        activeTrips.map((trip) => updateVesselPredictions(ctx, trip))
      );

      const successfulUpdates = results.filter((r) => r.success).length;

      log.info("Successfully updated predictions for all active vessels");

      return {
        success: true,
        message: `Updated predictions for ${activeTrips.length} vessels`,
        count: activeTrips.length,
      };
    } catch (error) {
      log.error("Failed to update predictions:", error);
      return {
        success: false,
        message: `Failed to update predictions: ${error}`,
      };
    }
  },
});

/**
 * Updates predictions for a single vessel
 */
const updateVesselPredictions = async (
  ctx: ActionCtx,
  trip: ConvexVesselTrip
) => {
  const predictionConfigs: PredictionConfig[] = [
    {
      type: "departure",
      action: internal.training.prediction.predictTimeAction,
      mutation:
        api.functions.predictions.mutations.updateCurrentPredictionMutation,
      prepareInput: prepareDepartureInput,
      prepareData: prepareDeparturePredictionData,
    },
    {
      type: "arrival",
      action: internal.training.prediction.predictTimeAction,
      mutation:
        api.functions.predictions.mutations.updateCurrentPredictionMutation,
      prepareInput: prepareArrivalInput,
      prepareData: prepareArrivalPredictionData,
    },
  ];

  const results = await Promise.all(
    predictionConfigs.map(async (config) => {
      try {
        const prediction = await ctx.runAction(config.action, {
          input: config.prepareInput(trip),
          predictionType: config.type,
        });

        await ctx.runMutation(config.mutation, {
          prediction: config.prepareData(trip, prediction),
        });

        return { type: config.type, success: true };
      } catch (error) {
        log.error(`Failed to predict ${config.type} time:`, error);
        return { type: config.type, success: false };
      }
    })
  );

  return {
    success: results.some((r) => r.success),
    departureSuccess:
      results.find((r) => r.type === "departure")?.success || false,
    arrivalSuccess: results.find((r) => r.type === "arrival")?.success || false,
  };
};

/**
 * Prepares base prediction input from vessel trip data
 */
const prepareBaseInput = (
  trip: ConvexVesselTrip
): Omit<PredictionInput, "priorTime"> => ({
  vesselId: trip.VesselID,
  vesselName: trip.VesselName,
  opRouteAbrv: trip.OpRouteAbbrev || "",
  depTermAbrv: trip.DepartingTerminalAbbrev,
  arvTermAbrv: trip.ArrivingTerminalAbbrev || "",
  schedDep: trip.ScheduledDeparture || 0,
  hourOfDay: new Date(trip.Eta || trip.TimeStamp).getHours(),
  dayType:
    new Date(trip.Eta || trip.TimeStamp).getDay() < 6 ? "weekday" : "weekend",
  previousDelay: 0, // TODO: Calculate from previous trip
});

/**
 * Prepares departure prediction input
 */
const prepareDepartureInput = (trip: ConvexVesselTrip): PredictionInput => ({
  ...prepareBaseInput(trip),
  priorTime: trip.Eta || trip.TimeStamp, // arrivalTime for departure
});

/**
 * Prepares arrival prediction input
 */
const prepareArrivalInput = (trip: ConvexVesselTrip): PredictionInput => ({
  ...prepareBaseInput(trip),
  priorTime: trip.LeftDockActual || trip.TimeStamp, // departureTime for arrival
});

/**
 * Prepares base prediction data for storage
 */
const prepareBasePredictionData = (
  trip: ConvexVesselTrip,
  modelVersion: string
) => ({
  vesselName: trip.VesselName,
  opRouteAbrv: trip.OpRouteAbbrev || "",
  depTermAbrv: trip.DepartingTerminalAbbrev,
  arvTermAbrv: trip.ArrivingTerminalAbbrev || "",
  modelVersion,
  createdAt: Date.now(),
  schedDep: trip.ScheduledDeparture || 0,
});

/**
 * Prepares departure prediction data for storage
 */
const prepareDeparturePredictionData = (
  trip: ConvexVesselTrip,
  prediction: PredictionOutput
): CurrentPredictionData => ({
  vesselId: trip.VesselID,
  routeId: trip.OpRouteAbbrev || "",
  predictionType: "departure",
  ...prepareBasePredictionData(trip, prediction.modelVersion),
  predictedTime: prediction.predictedTime,
  confidence: prediction.confidence,
});

/**
 * Prepares arrival prediction data for storage
 */
const prepareArrivalPredictionData = (
  trip: ConvexVesselTrip,
  prediction: PredictionOutput
): CurrentPredictionData => ({
  vesselId: trip.VesselID,
  routeId: trip.OpRouteAbbrev || "",
  predictionType: "arrival",
  ...prepareBasePredictionData(trip, prediction.modelVersion),
  predictedTime: prediction.predictedTime,
  confidence: prediction.confidence,
});

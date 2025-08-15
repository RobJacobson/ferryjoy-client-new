import { v } from "convex/values";

import { api } from "@/data/convex/_generated/api";
import { internalAction } from "@/data/convex/_generated/server";
import type { ConvexVesselTrip } from "@/data/types/convex/VesselTrip";
import { log } from "@/shared/lib/logger";

import type { EncodedFeatures } from "./types";

/**
 * Converted vessel trip data for ML processing
 * Uses camelCase properties for consistency with ML libraries
 */
export type ProcessedVesselTrip = {
  vesselId: number;
  vesselName: string;
  opRouteAbrv: string;
  schedDep: number;
  depTermAbrv: string;
  arvTermAbrv: string;
  arrivalTime: number;
  hourOfDay: number;
  dayType: "weekday" | "weekend";
  previousDelay: number;
  actualDeparture?: number;
  actualArrival?: number;
};

/**
 * Feature extraction types for ferry prediction models
 */
export type PredictionFeatures = {
  // Core vessel and route data
  vesselId: number;
  vesselName: string;
  opRouteAbrv: string;
  schedDep: number;
  depTermAbrv: string;
  arvTermAbrv: string;

  // Temporal features
  hourOfDay: number; // 0-23
  dayType: "weekday" | "weekend";

  // Derived features
  previousDelay: number; // minutes

  // Target variables
  actualDeparture?: number;
  actualArrival?: number;
};

// EncodedFeatures type is now defined in types.ts

/**
 * Converts ConvexVesselTrip to ProcessedVesselTrip
 * Handles PascalCase to camelCase conversion and data validation
 * Incorporates Eta and ArvDockActual fields for accurate arrival predictions
 */
const convertVesselTrip = (
  trip: ConvexVesselTrip
): ProcessedVesselTrip | null => {
  // Validate required fields
  if (!trip.VesselID || !trip.VesselName || !trip.DepartingTerminalAbbrev) {
    return null;
  }

  // Use ETA if available, otherwise use timestamp
  // Eta is the estimated arrival time just before docking (usually within 1-2 minutes of actual)
  const arrivalTime = trip.Eta || trip.TimeStamp;

  // Calculate hour of day from arrival time
  const hourOfDay = new Date(arrivalTime).getHours();

  // Determine day type from arrival time
  const dayType = new Date(arrivalTime).getDay() < 6 ? "weekday" : "weekend";

  return {
    vesselId: trip.VesselID,
    vesselName: trip.VesselName,
    opRouteAbrv: trip.OpRouteAbbrev || "",
    schedDep: trip.ScheduledDeparture || 0,
    depTermAbrv: trip.DepartingTerminalAbbrev,
    arvTermAbrv: trip.ArrivingTerminalAbbrev || "",
    arrivalTime,
    hourOfDay,
    dayType,
    previousDelay: 0, // TODO: Calculate from previous trip
    actualDeparture: trip.LeftDockActual,
    actualArrival: trip.ArvDockActual, // Actual arrival time for validation
  };
};

/**
 * Extracts features from completed vessel trips for prediction model training
 * Loads data directly into RAM for processing (4,000 rows is small enough)
 */
export const extractPredictionFeatures = internalAction({
  args: {},
  handler: async (ctx) => {
    log.info("Starting feature extraction for prediction models");

    try {
      // Load completed vessel trips directly into RAM
      const trips: ConvexVesselTrip[] = await ctx.runQuery(
        api.functions.vesselTrips.queries.getCompletedTrips
      );

      log.info(`Loaded ${trips.length} vessel trips into memory`);

      // Convert and filter trips
      const processedTrips: ProcessedVesselTrip[] = trips
        .map(convertVesselTrip)
        .filter((trip): trip is ProcessedVesselTrip => trip !== null);

      log.info(`Converted ${processedTrips.length} valid trips`);

      // Extract features
      const features: PredictionFeatures[] = processedTrips
        .map(tripToFeatures)
        .filter((feature): feature is PredictionFeatures => feature !== null);

      log.info(`Extracted features from ${features.length} trips`);

      // Handle missing data and outliers
      const cleanedFeatures: PredictionFeatures[] =
        features.filter(removeOutliers);

      log.info(
        `Cleaned features: ${cleanedFeatures.length} trips after outlier removal`
      );

      // Encode features for ML
      const encodedFeatures: EncodedFeatures[] =
        cleanedFeatures.map(encodeFeatures);

      log.info(`Encoded ${encodedFeatures.length} feature sets`);

      // Split into training and validation (80/20)
      const splitIndex = Math.floor(encodedFeatures.length * 0.8);
      const trainingFeatures = encodedFeatures.slice(0, splitIndex);
      const validationFeatures = encodedFeatures.slice(splitIndex);

      log.info(
        `Split data: ${trainingFeatures.length} training, ${validationFeatures.length} validation`
      );

      return {
        success: true,
        trainingFeatures,
        validationFeatures,
        message: `Successfully extracted features from ${encodedFeatures.length} trips`,
      };
    } catch (error) {
      log.error("Feature extraction failed:", error);
      return {
        success: false,
        message: `Feature extraction failed: ${error}`,
      };
    }
  },
});

/**
 * Converts processed vessel trip to prediction features
 */
const tripToFeatures = (
  trip: ProcessedVesselTrip
): PredictionFeatures | null => {
  // Basic validation
  if (!trip.vesselId || !trip.vesselName || !trip.opRouteAbrv) {
    return null;
  }

  return {
    vesselId: trip.vesselId,
    vesselName: trip.vesselName,
    opRouteAbrv: trip.opRouteAbrv,
    schedDep: trip.schedDep,
    depTermAbrv: trip.depTermAbrv,
    arvTermAbrv: trip.arvTermAbrv,
    hourOfDay: trip.hourOfDay,
    dayType: trip.dayType,
    previousDelay: trip.previousDelay,
    actualDeparture: trip.actualDeparture,
    actualArrival: trip.actualArrival,
  };
};

/**
 * Removes outliers from feature data
 */
const removeOutliers = (feature: PredictionFeatures): boolean => {
  // Remove trips with extreme delays (>2 hours)
  if (feature.previousDelay > 120) {
    return false;
  }

  // Remove trips with missing critical data
  if (!feature.schedDep) {
    return false;
  }

  return true;
};

/**
 * Encodes features for machine learning
 */
const encodeFeatures = (feature: PredictionFeatures): EncodedFeatures => {
  // Create 24 binary hour features
  const hourFeatures = Array.from({ length: 24 }, (_, i) =>
    feature.hourOfDay === i ? 1 : 0
  ) as readonly number[] & { length: 24 };

  const encoded: EncodedFeatures = {
    routeId: feature.opRouteAbrv, // Add routeId for proper grouping
    hourFeatures,
    isWeekday: feature.dayType === "weekday" ? 1 : 0,
    isWeekend: feature.dayType === "weekend" ? 1 : 0,
    previousDelay: feature.previousDelay,
    departureTime: feature.actualDeparture,
    schedDep: feature.schedDep,
    actualArrival: feature.actualArrival, // Include actual arrival time for training
  };

  return encoded;
};

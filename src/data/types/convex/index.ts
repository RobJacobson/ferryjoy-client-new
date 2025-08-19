/**
 * Convex-specific type definitions and validation schemas
 * Use manual conversion functions for type-safe conversions between domain and Convex types
 */

export {
  type ConvexVesselTrip,
  fromConvexVesselTrip,
  toConvexVesselTrip,
  vesselTripValidationSchema,
} from "../../../../convex/functions/vesselTrips/schemas";
export {
  type CurrentPredictionData,
  currentPredictionDataSchema,
  type HistoricalPredictionData,
  historicalPredictionDataSchema,
  type ModelParameters,
  modelParametersMutationSchema,
} from "./Prediction";
export {
  type ConvexVesselLocation,
  fromConvexVesselLocation,
  toConvexVesselLocation,
  vesselLocationValidationSchema,
} from "./VesselLocation";
export {
  type ConvexVesselPing,
  fromConvexVesselPing,
  toConvexVesselPing,
  vesselPingValidationSchema,
} from "./VesselPing";

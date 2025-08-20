/**
 * Convex-specific type definitions and validation schemas
 * Use manual conversion functions for type-safe conversions between domain and Convex types
 */

export {
  activeVesselTripValidationSchema as vesselTripValidationSchema,
  type ConvexVesselTrip,
  fromConvexVesselTrip,
  toConvexVesselTrip,
} from "../../../../convex/functions/activeVesselTrips/schemas";
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

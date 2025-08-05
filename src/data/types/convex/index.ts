/**
 * Convex-specific type definitions and validation schemas
 * Use generic toConvex<T>() and fromConvex<T>() for conversions
 */

export {
  type ConvexVesselLocation,
  vesselLocationValidationSchema,
} from "./VesselLocation";
export {
  type ConvexVesselPing,
  vesselPingValidationSchema,
} from "./VesselPing";
export {
  type ConvexVesselTrip,
  vesselTripValidationSchema,
} from "./VesselTrip";

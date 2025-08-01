import { v } from "convex/values";

// Shared vessel ping validation schema
// This can be reused in both schema.ts and mutation/query arguments
export const vesselPingValidationSchema = {
  VesselID: v.number(),
  Latitude: v.number(),
  Longitude: v.number(),
  Speed: v.number(),
  Heading: v.number(),
  AtDock: v.boolean(),
  TimeStamp: v.number(),
} as const;

// Vessel ping mutation arguments (reusing shared schema)
export const vesselPingArgs = vesselPingValidationSchema;

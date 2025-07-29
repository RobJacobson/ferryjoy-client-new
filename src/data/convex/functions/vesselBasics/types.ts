import { v } from "convex/values";

// Shared vessel basics validation schema
// This can be reused in both schema.ts and mutation/query arguments
export const vesselBasicsValidationSchema = {
  VesselID: v.number(),
  VesselName: v.string(),
  VesselAbbrev: v.string(),
  LastUpdated: v.number(),
} as const;

// TypeScript type matching the vesselBasicsValidationSchema
export type ConvexVesselBasics = {
  VesselID: number;
  VesselName: string;
  VesselAbbrev: string;
  LastUpdated: number;
};

// Vessel basics query arguments
export const vesselBasicsQueryArgs = {
  VesselID: v.number(),
};

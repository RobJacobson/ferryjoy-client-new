import { v } from "convex/values";

// Shared vessel location arguments schema
export const vesselLocationArgs = {
  vesselID: v.number(),
  vesselName: v.string(),
  depTermID: v.number(),
  depTermName: v.string(),
  depTermAbrv: v.string(),
  arvTermID: v.optional(v.number()),
  arvTermName: v.optional(v.string()),
  arvTermAbrv: v.optional(v.string()),
  lat: v.number(),
  lon: v.number(),
  speed: v.number(),
  heading: v.number(),
  inService: v.boolean(),
  atDock: v.boolean(),
  leftDock: v.optional(v.number()),
  eta: v.optional(v.number()),
  schedDep: v.optional(v.number()),
  opRouteAbrv: v.optional(v.string()),
  vesselPosNum: v.optional(v.number()),
  sortSeq: v.number(),
  timeStamp: v.number(),
} as const;

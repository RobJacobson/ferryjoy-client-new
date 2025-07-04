// Re-export schema from config directory
// Note: Convex requires schema.ts to be at the root of the functions directory

import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  vesselLocations: defineTable({
    vesselID: v.number(),
    vesselName: v.string(),
    depTermID: v.number(),
    depTermName: v.string(),
    depTermAbrv: v.string(),
    arvTermID: v.optional(v.number()), // Optional per WSF spec
    arvTermName: v.optional(v.string()), // Optional per WSF spec
    arvTermAbrv: v.optional(v.string()), // Optional per WSF spec
    lat: v.number(),
    lon: v.number(),
    speed: v.number(),
    heading: v.number(),
    inService: v.boolean(),
    atDock: v.boolean(),
    leftDock: v.optional(v.number()), // Date stored as timestamp, optional per WSF spec
    eta: v.optional(v.number()), // Date stored as timestamp, optional per WSF spec
    schedDep: v.optional(v.number()), // Date stored as timestamp, optional per WSF spec
    opRouteAbrv: v.optional(v.string()), // Optional - first element from array or undefined
    vesselPosNum: v.optional(v.number()), // Optional per WSF spec
    sortSeq: v.number(),
    timeStamp: v.number(), // Date stored as timestamp, always present
  })
    .index("by_vessel_id", ["vesselID"])
    .index("by_timestamp", ["timeStamp"])
    .index("by_vessel_and_timestamp", ["vesselID", "timeStamp"]),

  vesselLocationsCurrent: defineTable({
    vesselID: v.number(),
    vesselName: v.string(),
    depTermID: v.number(),
    depTermName: v.string(),
    depTermAbrv: v.string(),
    arvTermID: v.optional(v.number()), // Optional per WSF spec
    arvTermName: v.optional(v.string()), // Optional per WSF spec
    arvTermAbrv: v.optional(v.string()), // Optional per WSF spec
    lat: v.number(),
    lon: v.number(),
    speed: v.number(),
    heading: v.number(),
    inService: v.boolean(),
    atDock: v.boolean(),
    leftDock: v.optional(v.number()), // Date stored as timestamp, optional per WSF spec
    eta: v.optional(v.number()), // Date stored as timestamp, optional per WSF spec
    schedDep: v.optional(v.number()), // Date stored as timestamp, optional per WSF spec
    opRouteAbrv: v.optional(v.string()), // Optional - first element from array or undefined
    vesselPosNum: v.optional(v.number()), // Optional per WSF spec
    sortSeq: v.number(),
    timeStamp: v.number(), // Date stored as timestamp, always present
  }).index("by_vessel_id", ["vesselID"]),
});

// Configuration exports
export const VESSEL_LOCATION_TABLE = "vesselLocations";
export const VESSEL_LOCATIONS_CURRENT_TABLE = "vesselLocationsCurrent";

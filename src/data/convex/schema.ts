import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Vessel tracking for real-time updates
  vessels: defineTable({
    vesselId: v.string(),
    location: v.optional(
      v.object({
        latitude: v.number(),
        longitude: v.number(),
        heading: v.optional(v.number()),
        speed: v.optional(v.number()),
      })
    ),
    lastUpdated: v.optional(v.number()),
  }).index("by_vessel_id", ["vesselId"]),

  // Vessel locations from WSF API
  vesselLocations: defineTable({
    VesselID: v.number(),
    VesselName: v.string(),
    Mmsi: v.number(),
    DepartingTerminalID: v.number(),
    DepartingTerminalName: v.string(),
    DepartingTerminalAbbrev: v.string(),
    ArrivingTerminalID: v.optional(v.number()),
    ArrivingTerminalName: v.optional(v.string()),
    ArrivingTerminalAbbrev: v.optional(v.string()),
    Latitude: v.number(),
    Longitude: v.number(),
    Speed: v.number(),
    Heading: v.number(),
    InService: v.boolean(),
    AtDock: v.boolean(),
    LeftDock: v.optional(v.number()), // Date as timestamp
    Eta: v.optional(v.number()), // Date as timestamp
    EtaBasis: v.optional(v.string()),
    ScheduledDeparture: v.optional(v.number()), // Date as timestamp
    OpRouteAbbrev: v.array(v.string()),
    VesselPositionNum: v.optional(v.number()),
    SortSeq: v.number(),
    ManagedBy: v.number(),
    TimeStamp: v.number(), // Date as timestamp
  })
    .index("by_vessel_id", ["VesselID"])
    .index("by_timestamp", ["TimeStamp"])
    .index("by_location", ["Latitude", "Longitude"])
    .index("by_service_status", ["InService", "AtDock"]),

  // User preferences for favorites and settings
  userPreferences: defineTable({
    userId: v.string(),
    favoriteTerminals: v.array(v.string()),
    favoriteRoutes: v.array(v.string()),
    theme: v.optional(v.string()),
  }).index("by_user_id", ["userId"]),

  // API response caching
  apiCache: defineTable({
    key: v.string(),
    data: v.any(),
    expiresAt: v.number(),
  }).index("by_key", ["key"]),
});

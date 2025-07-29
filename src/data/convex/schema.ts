import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

import { vesselBasicsValidationSchema } from "./functions/vesselBasics/types";
import { vesselPingValidationSchema } from "./functions/vesselPings/types";
import { vesselTripValidationSchema } from "./functions/vesselTrips/types";

export default defineSchema({
  // Vessel trips from WSF API (using shared validation schema)
  vesselTrips: defineTable(vesselTripValidationSchema)
    .index("by_vessel_id", ["VesselID"])
    .index("by_timestamp", ["TimeStamp"])
    .index("by_vessel_id_and_timestamp", ["VesselID", "TimeStamp"])
    .index("by_service_status", ["InService", "AtDock"]),

  // Vessel pings for tracking movement (using shared validation schema)
  vesselPings: defineTable(vesselPingValidationSchema)
    .index("by_vessel_id", ["VesselID"])
    .index("by_timestamp", ["TimeStamp"])
    .index("by_vessel_id_and_timestamp", ["VesselID", "TimeStamp"]),

  // Vessel basics from WSF API (using shared validation schema)
  vesselBasics: defineTable(vesselBasicsValidationSchema).index(
    "by_vessel_id",
    ["VesselID"]
  ),
});

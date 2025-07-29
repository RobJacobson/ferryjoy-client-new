import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

import { vesselPingValidationSchema } from "./functions/vesselPings/types";
import { vesselLocationValidationSchema } from "./functions/vessels/types";

export default defineSchema({
  // Vessel locations from WSF API (using shared validation schema)
  vesselLocations: defineTable(vesselLocationValidationSchema)
    .index("by_vessel_id", ["VesselID"])
    .index("by_timestamp", ["TimeStamp"])
    .index("by_vessel_id_and_timestamp", ["VesselID", "TimeStamp"]),

  // Vessel pings for tracking movement (using shared validation schema)
  vesselPings: defineTable(vesselPingValidationSchema)
    .index("by_vessel_id", ["VesselID"])
    .index("by_timestamp", ["TimeStamp"])
    .index("by_vessel_id_and_timestamp", ["VesselID", "TimeStamp"]),
});

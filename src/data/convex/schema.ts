import { defineSchema, defineTable } from "convex/server";

import { vesselLocationValidationSchema } from "../types/convex/VesselLocation";
import { vesselPingValidationSchema } from "../types/convex/VesselPing";
import { vesselTripValidationSchema } from "../types/convex/VesselTrip";

export default defineSchema({
  // Active vessel trips - frequently updated, small dataset
  activeVesselTrips: defineTable(vesselTripValidationSchema)
    .index("by_vessel_id", ["VesselID"])
    .index("by_timestamp", ["TimeStamp"])
    .index("by_departing_terminal", ["DepartingTerminalID"]),

  // Historical vessel trips - static, large dataset, infrequent updates
  historicalVesselTrips: defineTable(vesselTripValidationSchema)
    .index("by_timestamp", ["TimeStamp"])
    .index("by_vessel_id_and_timestamp", ["VesselID", "TimeStamp"])
    .index("by_scheduled_departure", ["ScheduledDeparture"])
    .index("by_vessel_id_and_scheduled_departure", [
      "VesselID",
      "ScheduledDeparture",
    ]),

  // Vessel pings for tracking movement (using shared validation schema)
  vesselPings: defineTable(vesselPingValidationSchema)
    .index("by_timestamp", ["TimeStamp"])
    .index("by_vessel_id_and_timestamp", ["VesselID", "TimeStamp"]),

  // Vessel locations combining vessel location data
  vesselLocation: defineTable(vesselLocationValidationSchema)
    .index("by_timestamp", ["TimeStamp"])
    .index("by_vessel_id_and_timestamp", ["VesselID", "TimeStamp"]),
});

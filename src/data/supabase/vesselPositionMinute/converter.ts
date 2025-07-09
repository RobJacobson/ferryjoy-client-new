// VesselPositionMinute data conversion functions

import type { VesselPositionMinute, VesselPositionMinuteRow } from "./types";

/**
 * Converter function for transforming database row to VesselPositionMinute object from Supabase
 */
export const toVesselPositionMinute = (
  row: VesselPositionMinuteRow
): VesselPositionMinute => ({
  id: row.id,
  vesselID: row.vessel_id,
  tripID: row.trip_id ?? 0,
  lat: row.lat,
  lon: row.lon,
  speed: row.speed,
  heading: row.heading,
  inService: row.in_service,
  atDock: row.at_dock,
  arvTermID: row.arv_term_id,
  depTermID: row.dep_term_id,
  timestamp: new Date(row.timestamp),
});

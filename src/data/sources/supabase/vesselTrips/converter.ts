// VesselTrips data conversion functions

import type { VesselTrip, VesselTripRow } from "./types";

/**
 * Converter function for transforming database row to VesselTrip object from Supabase
 */
export const toVesselTrip = (row: VesselTripRow): VesselTrip => ({
  id: row.id,
  vesselID: row.vessel_id ?? 0,
  vesselName: row.vessel_name ?? "",
  vesselAbrv: row.vessel_abrv ?? "",
  depTermID: row.dep_term_id ?? 0,
  depTermAbrv: row.dep_term_abrv ?? "",
  arvTermID: row.arv_term_id,
  arvTermAbrv: row.arv_term_abrv,
  inService: row.in_service ?? false,
  eta: row.eta ? new Date(row.eta) : null,
  schedDep: row.sched_dep ? new Date(row.sched_dep) : null,
  opRouteAbrv: row.op_route_abrv ?? "",
  vesselPosNum: row.vessel_pos_num,
  sortSeq: 0,
  timeStart: row.start_at ? new Date(row.start_at) : null,
  timeLeftDock: row.left_dock ? new Date(row.left_dock) : null,
  timeArrived: row.end_at ? new Date(row.end_at) : null,
  timeUpdated: row.updated_at ? new Date(row.updated_at) : null,
});

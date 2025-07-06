import type { Tables } from "./database.types";

/**
 * Transforms vessel_location_minute data from snake_case to camelCase
 * and converts date strings to Date objects
 */
export const transformVesselLocationMinute = (
  data: Tables<"vessel_location_minute">
) => ({
  atDock: data.at_dock,
  heading: data.heading,
  id: data.id,
  inService: data.in_service,
  lat: data.lat,
  lon: data.lon,
  speed: data.speed,
  timestamp: data.timestamp ? new Date(data.timestamp) : null,
  vesselId: data.vessel_id,
  vesselTripKey: data.vessel_trip_key,
});

/**
 * Transforms vessel_location_second data from snake_case to camelCase
 * and converts date strings to Date objects
 */
export const transformVesselLocationSecond = (
  data: Tables<"vessel_location_second">
) => ({
  arvTermAbrv: data.arv_term_abrv,
  arvTermId: data.arv_term_id,
  arvTermName: data.arv_term_name,
  atDock: data.at_dock,
  createdAt: new Date(data.created_at),
  depTermAbrv: data.dep_term_abrv,
  depTermId: data.dep_term_id,
  depTermName: data.dep_term_name,
  eta: data.eta ? new Date(data.eta) : null,
  heading: data.heading,
  id: data.id,
  inService: data.in_service,
  lat: data.lat,
  leftDock: data.left_dock ? new Date(data.left_dock) : null,
  lon: data.lon,
  opRouteAbrv: data.op_route_abrv,
  schedDep: data.sched_dep ? new Date(data.sched_dep) : null,
  speed: data.speed,
  timestamp: new Date(data.timestamp),
  vesselAbrv: data.vessel_abrv,
  vesselId: data.vessel_id,
  vesselName: data.vessel_name,
  vesselPosNum: data.vessel_pos_num,
  vesselTripKey: data.vessel_trip_key,
});

/**
 * Transforms vessel_trip data from snake_case to camelCase
 * and converts date strings to Date objects
 */
export const transformVesselTrip = (data: Tables<"vessel_trip">) => ({
  arvTermAbrv: data.arv_term_abrv,
  arvTermId: data.arv_term_id,
  arvTermName: data.arv_term_name,
  atDock: data.at_dock,
  createdAt: new Date(data.created_at),
  depTermAbrv: data.dep_term_abrv,
  depTermId: data.dep_term_id,
  depTermName: data.dep_term_name,
  endAt: data.end_at ? new Date(data.end_at) : null,
  eta: data.eta ? new Date(data.eta) : null,
  inService: data.in_service,
  key: data.key,
  leftDock: data.left_dock ? new Date(data.left_dock) : null,
  opRouteAbrv: data.op_route_abrv,
  schedDep: data.sched_dep ? new Date(data.sched_dep) : null,
  startAt: data.start_at ? new Date(data.start_at) : null,
  updatedAt: data.updated_at ? new Date(data.updated_at) : null,
  vesselAbrv: data.vessel_abrv,
  vesselId: data.vessel_id,
  vesselName: data.vessel_name,
  vesselPosNum: data.vessel_pos_num,
});

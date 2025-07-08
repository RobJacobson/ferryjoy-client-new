// Converter functions for schedules

import { parseWsfDateTime } from "../shared/dateUtils";
import type {
  Sailing,
  Schedule,
  ScheduleDeparture,
  WsfSailingResponse,
  WsfScheduleDepartureResponse,
  WsfScheduleResponse,
} from "./types";

/**
 * Converts WSF API schedule response to domain model
 */
export const toSchedule = (data: WsfScheduleResponse): Schedule => ({
  id: data.ScheduleID,
  routeId: data.RouteID,
  tripDate: parseWsfDateTime(data.TripDate),
  departures: data.Departures.map(toScheduleDeparture),
});

/**
 * Converts WSF API schedule departure response to domain model
 */
export const toScheduleDeparture = (
  data: WsfScheduleDepartureResponse
): ScheduleDeparture => ({
  departureTime: parseWsfDateTime(data.DepartureTime),
  arrivalTime: parseWsfDateTime(data.ArrivalTime),
  vesselId: data.VesselID,
  vesselName: data.VesselName,
  isActive: data.IsActive,
});

/**
 * Converts WSF API sailing response to domain model
 */
export const toSailing = (data: WsfSailingResponse): Sailing => ({
  sailingId: data.SailingID,
  schedRouteId: data.SchedRouteID,
  departureTime: parseWsfDateTime(data.DepartureTime),
  arrivalTime: parseWsfDateTime(data.ArrivalTime),
  vesselId: data.VesselID,
  vesselName: data.VesselName,
  isActive: data.IsActive,
});

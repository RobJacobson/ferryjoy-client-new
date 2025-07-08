// Converter functions for time adjustments

import { parseWsfDateTime } from "../shared/dateUtils";
import type { TimeAdjustment, WsfTimeAdjustmentResponse } from "./types";

/**
 * Converts WSF API time adjustment response to domain model
 */
export const toTimeAdjustment = (
  data: WsfTimeAdjustmentResponse
): TimeAdjustment => ({
  adjustmentId: data.AdjustmentID,
  routeId: data.RouteID,
  schedRouteId: data.SchedRouteID,
  departureTime: parseWsfDateTime(data.DepartureTime),
  adjustedTime: parseWsfDateTime(data.AdjustedTime),
  reason: data.Reason,
  isActive: data.IsActive,
});

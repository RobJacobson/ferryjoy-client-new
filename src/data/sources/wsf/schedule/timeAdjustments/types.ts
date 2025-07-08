// Types for time adjustments

/**
 * Domain model for time adjustment
 */
export type TimeAdjustment = {
  adjustmentId: number;
  routeId: number;
  schedRouteId: number;
  departureTime: Date;
  adjustedTime: Date;
  reason: string;
  isActive: boolean;
};

/**
 * Raw API response type for time adjustment
 */
export type WsfTimeAdjustmentResponse = {
  AdjustmentID: number;
  RouteID: number;
  SchedRouteID: number;
  DepartureTime: string;
  AdjustedTime: string;
  Reason: string;
  IsActive: boolean;
};

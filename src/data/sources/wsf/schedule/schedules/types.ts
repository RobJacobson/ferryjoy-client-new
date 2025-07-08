// Types for schedules

/**
 * Domain model for schedule
 */
export type Schedule = {
  id: number;
  routeId: number;
  tripDate: Date;
  departures: ScheduleDeparture[];
};

/**
 * Domain model for schedule departure
 */
export type ScheduleDeparture = {
  departureTime: Date;
  arrivalTime: Date;
  vesselId: number;
  vesselName: string;
  isActive: boolean;
};

/**
 * Domain model for sailing
 */
export type Sailing = {
  sailingId: number;
  schedRouteId: number;
  departureTime: Date;
  arrivalTime: Date;
  vesselId: number;
  vesselName: string;
  isActive: boolean;
};

/**
 * Raw API response type for schedule
 */
export type WsfScheduleResponse = {
  ScheduleID: number;
  RouteID: number;
  TripDate: string;
  Departures: WsfScheduleDepartureResponse[];
};

/**
 * Raw API response type for schedule departure
 */
export type WsfScheduleDepartureResponse = {
  DepartureTime: string;
  ArrivalTime: string;
  VesselID: number;
  VesselName: string;
  IsActive: boolean;
};

/**
 * Raw API response type for sailing
 */
export type WsfSailingResponse = {
  SailingID: number;
  SchedRouteID: number;
  DepartureTime: string;
  ArrivalTime: string;
  VesselID: number;
  VesselName: string;
  IsActive: boolean;
};

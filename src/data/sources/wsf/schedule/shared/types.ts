// Shared types for WSF Schedule API

/**
 * Base API response structure
 */
export type WsfApiResponse<T> = {
  data: T;
  error?: string;
  timestamp?: string;
};

/**
 * Route information
 */
export type Route = {
  id: number;
  name: string;
  description: string;
  abbreviation: string;
  color: string;
  isActive: boolean;
  terminals: Terminal[];
};

/**
 * Terminal information
 */
export type Terminal = {
  id: number;
  name: string;
  abbreviation: string;
  latitude: number;
  longitude: number;
  isActive: boolean;
};

/**
 * Vessel information
 */
export type Vessel = {
  id: number;
  name: string;
  abbreviation: string;
  vesselClass: string;
  isActive: boolean;
  capacity: {
    passengers: number;
    vehicles: number;
  };
};

/**
 * Departure information
 */
export type Departure = {
  id: number;
  departureTime: Date;
  arrivalTime: Date;
  vesselId: number;
  vesselName: string;
  fromTerminalId: number;
  fromTerminalName: string;
  toTerminalId: number;
  toTerminalName: string;
  isCancelled: boolean;
  notes?: string;
};

/**
 * Alert information
 */
export type Alert = {
  id: number;
  routeId: number;
  routeName: string;
  title: string;
  message: string;
  startDate: Date;
  endDate: Date;
  severity: "low" | "medium" | "high";
  isActive: boolean;
};

/**
 * Active season information
 */
export type ActiveSeason = {
  id: number;
  name: string;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  routes: number[]; // Route IDs
};

/**
 * Schedule query parameters
 */
export type ScheduleParams = {
  routeId?: number;
  sailingDate?: Date;
  vesselId?: number;
  terminalId?: number;
};

/**
 * Route query parameters
 */
export type RouteParams = {
  isActive?: boolean;
  terminalId?: number;
};

/**
 * Time adjustment query parameters
 */
export type TimeAdjustmentParams = {
  routeId?: number;
  sailingDate?: Date;
  isActive?: boolean;
};

/**
 * Alert query parameters
 */
export type AlertParams = {
  routeId?: number;
  severity?: "low" | "medium" | "high";
  isActive?: boolean;
};

/**
 * Active season query parameters
 */
export type ActiveSeasonParams = {
  isActive?: boolean;
  routeId?: number;
};

/**
 * Schedule cache flush date response
 */
export type ScheduleCacheFlushDate = {
  lastUpdated: Date;
  source: string;
};

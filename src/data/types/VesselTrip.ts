import type { VesselLocation as VesselLocationDottie } from "ws-dottie";

/**
 * Filtered vessel trip data for internal use
 * Contains all essential vessel trip fields including location data
 */
export type VesselTrip = {
  /** Unique identifier for the vessel */
  VesselID: number;
  /** Name of the vessel */
  VesselName: string;
  /** ID of the terminal the vessel is departing from */
  DepartingTerminalID: number;
  /** Name of the terminal the vessel is departing from */
  DepartingTerminalName: string;
  /** Abbreviation of the departing terminal */
  DepartingTerminalAbbrev: string;
  /** ID of the terminal the vessel is arriving at (null if not yet assigned) */
  ArrivingTerminalID: number | null;
  /** Name of the terminal the vessel is arriving at (null if not yet assigned) */
  ArrivingTerminalName: string | null;
  /** Abbreviation of the arriving terminal (null if not yet assigned) */
  ArrivingTerminalAbbrev: string | null;
  /** Current latitude position of the vessel */
  Latitude: number;
  /** Current longitude position of the vessel */
  Longitude: number;
  /** Current speed of the vessel in knots (filtered to > 0.2 knots to remove stationary noise) */
  Speed: number;
  /** Current heading of the vessel in degrees */
  Heading: number;
  /** Whether the vessel is currently in service */
  InService: boolean;
  /** Whether the vessel is currently docked at a terminal */
  AtDock: boolean;
  /** Scheduled departure time */
  ScheduledDeparture: Date | null;
  /** Timestamp when the vessel left dock (null if not applicable) */
  LeftDock: Date | null;
  /** Actual timestamp when the vessel left dock (null if not applicable) */
  LeftDockActual: Date | null;
  /** Estimated time of arrival (null if not available) */
  Eta: Date | null;
  /** Timestamp when the vessel arrived at dock (null if not applicable) */
  ArvDockActual: Date | null;
  /** Primary route abbreviation the vessel operates on */
  OpRouteAbbrev: string | null;
  /** Position number of the vessel in the route sequence */
  VesselPositionNum: number | null;
  /** Timestamp when this location data was recorded */
  TimeStamp: Date;
};

/**
 * Converts raw WSF vessel location data to our internal VesselTrip format
 * Filters out unnecessary fields and transforms data for our use case
 * Applies speed filtering to remove stationary noise (speeds < 0.2 knots)
 */
export const toVesselTrip = (vl: VesselLocationDottie): VesselTrip => {
  const { EtaBasis, SortSeq, ManagedBy, Mmsi, ...filtered } = vl;
  return {
    ...filtered,
    Speed: filtered.Speed > 0.2 ? filtered.Speed : 0,
    OpRouteAbbrev: filtered.OpRouteAbbrev?.[0] ?? null,
    ArvDockActual: null,
    LeftDockActual: null,
  };
};

// TypeScript type matching the vesselTripValidationSchema
export type ConvexVesselTrip = {
  VesselID: number;
  VesselName: string;
  DepartingTerminalID: number;
  DepartingTerminalName: string;
  DepartingTerminalAbbrev: string;
  ArrivingTerminalID?: number;
  ArrivingTerminalName?: string;
  ArrivingTerminalAbbrev?: string;
  Latitude: number;
  Longitude: number;
  Speed: number;
  Heading: number;
  InService: boolean;
  AtDock: boolean;
  LeftDock?: number;
  LeftDockActual?: number;
  Eta?: number;
  ScheduledDeparture?: number;
  ArvDockActual?: number;
  OpRouteAbbrev?: string;
  VesselPositionNum?: number;
  TimeStamp: number;
};

/**
 * Converts VesselTrip to Convex format
 * Converts all Date fields to numbers for Convex compatibility
 */
export const toConvexVesselTrip = (trip: VesselTrip): ConvexVesselTrip => {
  // Convert Date fields to numbers for Convex compatibility
  const convexTrip: ConvexVesselTrip = {
    ...trip,
    ArrivingTerminalID: trip.ArrivingTerminalID ?? undefined,
    ArrivingTerminalName: trip.ArrivingTerminalName ?? undefined,
    ArrivingTerminalAbbrev: trip.ArrivingTerminalAbbrev ?? undefined,
    VesselPositionNum: trip.VesselPositionNum ?? undefined,
    OpRouteAbbrev: trip.OpRouteAbbrev ?? undefined,
    ArvDockActual: trip.ArvDockActual
      ? trip.ArvDockActual.getTime()
      : undefined,
    LeftDock: trip.LeftDock ? trip.LeftDock.getTime() : undefined,
    LeftDockActual: trip.LeftDockActual
      ? trip.LeftDockActual.getTime()
      : undefined,
    Eta: trip.Eta ? trip.Eta.getTime() : undefined,
    ScheduledDeparture: trip.ScheduledDeparture
      ? trip.ScheduledDeparture.getTime()
      : undefined,
    TimeStamp: trip.TimeStamp.getTime(),
  };

  return convexTrip;
};

/**
 * Converts ConvexVesselTrip back to VesselTrip format
 * Converts number timestamps back to Date objects
 */
export const toVesselTripFromConvex = (
  convexTrip: ConvexVesselTrip
): VesselTrip => {
  // Convert number timestamps back to Date objects
  const vesselTrip: VesselTrip = {
    ...convexTrip,
    ArrivingTerminalID: convexTrip.ArrivingTerminalID ?? null,
    ArrivingTerminalName: convexTrip.ArrivingTerminalName ?? null,
    ArrivingTerminalAbbrev: convexTrip.ArrivingTerminalAbbrev ?? null,
    VesselPositionNum: convexTrip.VesselPositionNum ?? null,
    OpRouteAbbrev: convexTrip.OpRouteAbbrev ?? null,
    ArvDockActual: convexTrip.ArvDockActual
      ? new Date(convexTrip.ArvDockActual)
      : null,
    LeftDock: convexTrip.LeftDock ? new Date(convexTrip.LeftDock) : null,
    LeftDockActual: convexTrip.LeftDockActual
      ? new Date(convexTrip.LeftDockActual)
      : null,
    Eta: convexTrip.Eta ? new Date(convexTrip.Eta) : null,
    ScheduledDeparture: convexTrip.ScheduledDeparture
      ? new Date(convexTrip.ScheduledDeparture)
      : null,
    TimeStamp: new Date(convexTrip.TimeStamp),
  };

  return vesselTrip;
};

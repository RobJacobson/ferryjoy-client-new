import type { VesselLocation as VesselLocationDottie } from "ws-dottie";

/**
 * Filtered vessel location data for internal use
 * Contains all essential vessel location fields excluding unnecessary metadata
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
  /** Whether the vessel is currently in service */
  InService: boolean;
  /** Whether the vessel is currently docked at a terminal */
  AtDock: boolean;
  /** Scheduled departure time */
  ScheduledDeparture: Date | null;
  /** Timestamp when the vessel left dock (null if not applicable) */
  LeftDock: Date | null;
  /** Estimated time of arrival (null if not available) */
  Eta: Date | null;
  /** Timestamp when the vessel arrived at dock (null if not applicable) */
  ArvDock: Date | null;
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
 */
export const toVesselTrip = (vl: VesselLocationDottie): VesselTrip => {
  const {
    EtaBasis,
    SortSeq,
    ManagedBy,
    Mmsi,
    Latitude,
    Longitude,
    Speed,
    Heading,
    ...filtered
  } = vl;
  const OpRouteAbbrev = filtered.OpRouteAbbrev?.[0] ?? null;
  return { ...filtered, OpRouteAbbrev, ArvDock: null };
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
  InService: boolean;
  AtDock: boolean;
  LeftDock?: number;
  Eta?: number;
  ScheduledDeparture?: number;
  ArvDock?: number;
  OpRouteAbbrev?: string;
  VesselPositionNum?: number;
  TimeStamp: number;
  LastUpdated: number;
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
    ArvDock: trip.ArvDock ? trip.ArvDock.getTime() : undefined,
    LeftDock: trip.LeftDock ? trip.LeftDock.getTime() : undefined,
    Eta: trip.Eta ? trip.Eta.getTime() : undefined,
    ScheduledDeparture: trip.ScheduledDeparture
      ? trip.ScheduledDeparture.getTime()
      : undefined,
    TimeStamp: trip.TimeStamp.getTime(),
    LastUpdated: Date.now(),
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
    ArvDock: convexTrip.ArvDock ? new Date(convexTrip.ArvDock) : null,
    LeftDock: convexTrip.LeftDock ? new Date(convexTrip.LeftDock) : null,
    Eta: convexTrip.Eta ? new Date(convexTrip.Eta) : null,
    ScheduledDeparture: convexTrip.ScheduledDeparture
      ? new Date(convexTrip.ScheduledDeparture)
      : null,
    TimeStamp: new Date(convexTrip.TimeStamp),
  };

  return vesselTrip;
};

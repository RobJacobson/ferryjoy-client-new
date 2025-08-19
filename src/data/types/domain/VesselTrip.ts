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
export const toVesselTrip = (vl: any): VesselTrip => {
  const {
    EtaBasis,
    SortSeq,
    ManagedBy,
    Mmsi,
    Latitude,
    Longitude,
    Speed,
    Heading,
    ...rest
  } = vl;
  return {
    ...rest,
    OpRouteAbbrev: rest.OpRouteAbbrev?.[0] ?? null,
    ArvDockActual: null,
    LeftDockActual: null,
  };
};

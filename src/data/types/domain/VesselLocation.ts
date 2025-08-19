/**
 * Filtered vessel location data for internal use
 * Contains all essential vessel location fields excluding unnecessary metadata
 */
export type VesselLocation = {
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
  /** Current speed of the vessel in knots */
  Speed: number;
  /** Current heading of the vessel in degrees */
  Heading: number;
  /** Whether the vessel is currently in service */
  InService: boolean;
  /** Whether the vessel is currently docked at a terminal */
  AtDock: boolean;
  /** Timestamp when the vessel left dock (null if not applicable) */
  LeftDock: Date | null;
  /** Estimated time of arrival (null if not available) */
  Eta: Date | null;
  /** Scheduled departure time */
  ScheduledDeparture: Date | null;
  /** Array of route abbreviations the vessel operates on */
  OpRouteAbbrev: string[];
  /** Position number of the vessel in the route sequence */
  VesselPositionNum: number | null;
  /** Timestamp when this location data was recorded */
  TimeStamp: Date;
};

/**
 * Converts a VesselLocation from ws-dottie to a filtered VesselLocation
 * Removes EtaBasis, SortSeq, ManagedBy, and Mmsi fields for simplified data processing
 */
export const toVesselLocation = (vl: any): VesselLocation => {
  const { EtaBasis, SortSeq, ManagedBy, Mmsi, ...filtered } = vl;
  return filtered;
};

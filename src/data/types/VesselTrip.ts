import type { VesselLocation as VesselLocationDottie } from "ws-dottie";

import { toConvex as toConvexGeneral } from "@/data/convex/utils";

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
  ScheduledDeparture: string | null;
  /** Timestamp when the vessel left dock (null if not applicable) */
  LeftDock: string | null;
  /** Estimated time of arrival (null if not available) */
  Eta: string | null;
  /** Timestamp when the vessel arrived at dock (null if not applicable) */
  ArvDock: Date | null;
  /** Primary route abbreviation the vessel operates on */
  OpRouteAbbrev: string | null;
  /** Position number of the vessel in the route sequence */
  VesselPositionNum: number | null;
  /** Timestamp when this location data was recorded */
  TimeStamp: Date;
  /** Timestamp when this vessel trip was last added or updated */
  LastUpdated: Date;
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

  let opRouteAbbrev: string | null = null;
  if (filtered.OpRouteAbbrev && filtered.OpRouteAbbrev.length > 0) {
    for (const route of filtered.OpRouteAbbrev) {
      if (route !== undefined && route !== null && route !== "") {
        opRouteAbbrev = route;
        break;
      }
    }
  }

  // Convert date strings to ISO strings in Los Angeles timezone
  const toLAISOString = (
    dateString: string | null | undefined
  ): string | null => {
    if (!dateString) return null;
    try {
      const date = new Date(dateString);
      return date
        .toLocaleString("en-US", {
          timeZone: "America/Los_Angeles",
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        })
        .replace(
          /(\d+)\/(\d+)\/(\d+),\s(\d+):(\d+):(\d+)/,
          "$3-$1-$2T$4:$5:$6.000Z"
        );
    } catch {
      return null;
    }
  };

  const now = new Date();
  return {
    ...filtered,
    ArvDock: null,
    OpRouteAbbrev: opRouteAbbrev,
    // Convert the raw string dates from WSF API to LA timezone strings
    LeftDock: toLAISOString(vl.LeftDock as string | null),
    Eta: toLAISOString(vl.Eta as string | null),
    ScheduledDeparture: toLAISOString(vl.ScheduledDeparture as string | null),
    LastUpdated: now,
  };
};

/**
 * Converts VesselTrip to Convex format
 * Keeps timestamp fields (Eta, LeftDock, ScheduledDeparture) as strings
 * Converts other Date fields (ArvDock, TimeStamp, LastUpdated) to numbers
 */
export const toConvex = (trip: VesselTrip) => {
  // Convert Date fields to numbers for Convex compatibility
  const convexTrip = {
    ...trip,
    ArvDock: trip.ArvDock ? trip.ArvDock.getTime() : null,
    TimeStamp: trip.TimeStamp.getTime(),
    LastUpdated: trip.LastUpdated.getTime(),
  };

  return convexTrip;
};

import type { ActiveVesselTrip } from "./ActiveVesselTrip";

/**
 * Completed vessel trip data extending ActiveVesselTrip
 * Contains additional fields for completed trips including timing and duration data
 */
export type CompletedVesselTrip = ActiveVesselTrip & {
  /** Unique key identifier for the completed trip */
  Key: string;
  /** Start time of the trip, i.e., when the vessel arrived at dock */
  TripStart: Date;
  /** Time when the vessel left dock, which must be non-null */
  LeftDock: Date;
  /** Delay in departure time in minutes */
  LeftDockDelay: number | null;
  /** Duration the vessel spent at dock in minutes */
  AtDockDuration: number;
  /** Duration the vessel spent at sea in minutes */
  AtSeaDuration: number;
  /** Total duration of the trip in minutes */
  TotalDuration: number;
  /** Time when the vessel left dock */
  TripEnd: Date;
};

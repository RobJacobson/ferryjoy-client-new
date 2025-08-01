import type { VesselLocation } from "ws-dottie";

/**
 * Enhanced vessel data with additional computed properties
 */
export type VesselData = VesselLocation & {
  /** Computed distance from user's location */
  distanceFromUser?: number;
  /** Computed ETA to next terminal */
  etaToNextTerminal?: number;
  /** Vessel status with additional context */
  status: "in-service" | "out-of-service" | "maintenance" | "unknown";
};

/**
 * Vessel filter options
 */
export type VesselFilter = {
  /** Filter by service status */
  inService?: boolean;
  /** Filter by vessel name (partial match) */
  name?: string;
  /** Filter by route */
  route?: string;
  /** Filter by terminal proximity */
  nearTerminal?: string;
};

/**
 * Vessel sort options
 */
export type VesselSort = {
  /** Sort field */
  field: "name" | "status" | "distance" | "eta";
  /** Sort direction */
  direction: "asc" | "desc";
};

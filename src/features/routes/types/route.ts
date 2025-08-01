/**
 * Route data structure
 */
export type Route = {
  /** Unique route identifier */
  id: number;
  /** Route name (e.g., "Seattle ↔ Bainbridge Island") */
  name: string;
  /** Trip duration in minutes */
  duration: number;
  /** Service frequency description */
  frequency: string;
  /** Route status */
  status: "active" | "inactive" | "maintenance" | "unknown";
  /** Next scheduled departure time */
  nextDeparture: string;
  /** Origin terminal */
  originTerminal?: string;
  /** Destination terminal */
  destinationTerminal?: string;
};

/**
 * Route filter options
 */
export type RouteFilter = {
  /** Filter by status */
  status?: Route["status"];
  /** Filter by origin terminal */
  originTerminal?: string;
  /** Filter by destination terminal */
  destinationTerminal?: string;
  /** Filter by maximum duration */
  maxDuration?: number;
};

/**
 * Route sort options
 */
export type RouteSort = {
  /** Sort field */
  field: "name" | "duration" | "nextDeparture";
  /** Sort direction */
  direction: "asc" | "desc";
};

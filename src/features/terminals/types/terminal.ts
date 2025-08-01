/**
 * Terminal data structure
 */
export type Terminal = {
  /** Unique terminal identifier */
  id: number;
  /** Terminal name */
  name: string;
  /** Current wait time in minutes */
  waitTime: number;
  /** Available space percentage */
  spaceAvailable: number;
  /** Terminal location coordinates */
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  /** Terminal status */
  status: "open" | "closed" | "limited" | "unknown";
};

/**
 * Terminal filter options
 */
export type TerminalFilter = {
  /** Filter by wait time threshold */
  maxWaitTime?: number;
  /** Filter by minimum space availability */
  minSpaceAvailable?: number;
  /** Filter by terminal name */
  name?: string;
  /** Filter by status */
  status?: Terminal["status"];
};

/**
 * Terminal sort options
 */
export type TerminalSort = {
  /** Sort field */
  field: "name" | "waitTime" | "spaceAvailable";
  /** Sort direction */
  direction: "asc" | "desc";
};

// Vessel marker sizing and layout constants
export const MARKER_DIMENSIONS = {
  CONTAINER_SIZE: 150,
  VESSEL_CIRCLE_SIZE: 80,
  DIRECTION_INDICATOR_SIZE: 95,
  ARROW_SIZE: 48,
} as const;

// Map zoom level configuration
export const ZOOM_CONFIG = {
  MIN_ZOOM: 6,
  MAX_ZOOM: 22,
  MIN_SCALE: 0.1,
  MAX_SCALE: 2.0,
} as const;

// ETA display thresholds
export const ETA_CONFIG = {
  MILLISECONDS_PER_MINUTE: 1000 * 60,
  MAX_ETA_MINUTES: 120,
  MIN_ETA_MINUTES: 1,
} as const;

// Z-index values for layering
export const Z_INDEX = {
  OUT_OF_SERVICE: 0,
  AT_DOCK: 10,
  IN_TRANSIT: 20,
  VESSEL_CIRCLE: 30,
} as const;

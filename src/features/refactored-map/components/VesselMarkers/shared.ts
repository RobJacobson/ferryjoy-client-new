/**
 * Shared constants and types for VesselMarkers component
 * Contains vessel marker styling constants and utilities used by both native and web implementations
 */

import type { VesselLocation } from "ws-dottie";

import { calculateEtaMinutes } from "@/shared/lib/utils/eta";

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
} as const;

// Vessel marker colors
export const VESSEL_MARKER_COLORS = {
  IN_SERVICE: "rgb(249, 168, 212)", // pink-200
  OUT_OF_SERVICE: "rgb(209, 213, 219)", // gray-300
  BORDER: "rgb(255, 255, 255)", // white
} as const;

// Perspective scaling constant - adjust this value to control the strength of the perspective effect
const PERSPECTIVE_STRENGTH = 2.5;

/**
 * Clamp a value between min and max bounds
 */
const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value));

/**
 * Calculate perspective scaling factor based on pitch and vessel position
 * Returns 1.0 when pitch is 0 (no perspective effect)
 * Returns larger values for vessels closer to camera when pitch > 0
 */
export const calculatePerspectiveFactor = (
  pitch: number,
  vesselLatitude: number,
  vesselLongitude: number,
  centerLatitude: number,
  centerLongitude: number,
  heading: number
): number => {
  // No perspective effect when map is flat
  if (pitch === 0) return 1.0;

  // Calculate vessel's position relative to map center
  const latDiff = vesselLatitude - centerLatitude;
  const lonDiff = vesselLongitude - centerLongitude;

  // Rotate coordinate system to account for map heading
  const headingRad = (heading * Math.PI) / 180;
  const rotatedY =
    latDiff * Math.cos(headingRad) + lonDiff * Math.sin(headingRad);

  // Vessels closer to camera (bottom of tilted screen) get larger scale
  const normalizedY = -rotatedY * 1;

  // Use cosine-based adjustment: effect becomes more dramatic as pitch approaches 90°
  const pitchRad = (pitch * Math.PI) / 180;
  const perspectiveFactor =
    1.0 + normalizedY * (1 - Math.cos(pitchRad)) * PERSPECTIVE_STRENGTH;

  return clamp(perspectiveFactor, 0.5, 2);
};

/**
 * Get z-index for vessel layering
 */
export const getVesselZIndex = (vessel: VesselLocation): number => {
  return !vessel.InService
    ? Z_INDEX.OUT_OF_SERVICE
    : vessel.AtDock
      ? Z_INDEX.AT_DOCK
      : Z_INDEX.IN_TRANSIT;
};

/**
 * Generate screen reader label for vessel marker
 */
export const getVesselAccessibilityLabel = (vessel: VesselLocation): string => {
  const etaMinutes = calculateEtaMinutes(vessel);

  const status = vessel.InService
    ? vessel.AtDock
      ? "docked at terminal"
      : "in transit"
    : "out of service";

  const etaInfo = etaMinutes
    ? `, arriving in ${etaMinutes} minute${etaMinutes !== 1 ? "s" : ""}`
    : "";

  const headingInfo =
    vessel.InService && !vessel.AtDock
      ? `, traveling ${vessel.Heading} degrees`
      : "";

  const speedInfo =
    vessel.InService && !vessel.AtDock && vessel.Speed > 0
      ? `, speed ${Math.round(vessel.Speed)} knots`
      : "";

  return `Ferry ${vessel.VesselName}, ${status}${etaInfo}${headingInfo}${speedInfo}`;
};

/**
 * Check if vessels should be shown based on zoom level
 */
export const shouldShowVessels = (zoom: number): boolean => {
  return zoom >= 8;
};

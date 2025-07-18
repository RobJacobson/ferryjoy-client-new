import type { VesselLocation } from "wsdot-api-client";

import { ETA_CONFIG, Z_INDEX } from "./vesselMarkerConstants";

// Perspective scaling constant - adjust this value to control the strength of the perspective effect
const PERSPECTIVE_STRENGTH = 0.05;

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
  const perspectiveFactor = 1.0 + normalizedY * pitch * PERSPECTIVE_STRENGTH;

  return clamp(perspectiveFactor, 0.5, 2);
};

/**
 * Linear interpolation for zoom-based scaling
 * Returns 0 if zoom < minZoom, maxSize if zoom >= maxZoom
 */
export const lerpZoom = (
  zoom: number,
  minZoom: number,
  maxZoom: number,
  maxSize: number
): number => {
  if (zoom < minZoom) return 0;
  if (zoom >= maxZoom) return maxSize;

  const t = (zoom - minZoom) / (maxZoom - minZoom);
  return t * maxSize;
};

/**
 * Calculate ETA in minutes from current time
 */
export const calculateEtaMinutes = (eta: Date | null): number | null => {
  if (!eta) return null;

  const timeDiff = eta.getTime() - Date.now();
  const minutesDiff = Math.round(timeDiff / ETA_CONFIG.MILLISECONDS_PER_MINUTE);

  // Return null if more than max ETA minutes away
  if (minutesDiff > ETA_CONFIG.MAX_ETA_MINUTES) return null;

  return minutesDiff + 1;
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
  const etaMinutes = calculateEtaMinutes(vessel.Eta);

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

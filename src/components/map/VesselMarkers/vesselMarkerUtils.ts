import type { VesselLocation } from "wsdot-api-client";

import { ETA_CONFIG, Z_INDEX } from "./vesselMarkerConstants";

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
export const getVesselZIndex = (vessel: VesselLocation): number =>
  !vessel.InService
    ? Z_INDEX.OUT_OF_SERVICE
    : vessel.AtDock
      ? Z_INDEX.AT_DOCK
      : Z_INDEX.IN_TRANSIT;

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

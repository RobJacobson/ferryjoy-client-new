import type { VesselLocation } from "ws-dottie";

// ETA display thresholds - matching vesselMarkerConstants
const ETA_CONFIG = {
  MILLISECONDS_PER_MINUTE: 1000 * 60,
  MAX_ETA_MINUTES: 120, // 2 hours
  MIN_ETA_MINUTES: 1,
} as const;

/**
 * Calculate ETA in minutes from now for a vessel, or return null if no ETA available
 * Returns null if ETA is in the past or more than 2 hours away
 */
export const calculateEtaMinutes = (vessel: VesselLocation): number | null => {
  const eta = vessel.Eta;
  if (!eta) return null;

  const timeDiff = eta.getTime() - Date.now();
  const minutesDiff = Math.round(timeDiff / ETA_CONFIG.MILLISECONDS_PER_MINUTE);

  // Return null if more than max ETA minutes away
  if (minutesDiff > ETA_CONFIG.MAX_ETA_MINUTES) return null;

  return minutesDiff + 1;
};

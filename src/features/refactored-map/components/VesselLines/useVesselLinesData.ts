import { bezierSpline } from "@turf/turf";
import type { Feature, LineString } from "geojson";
import type { VesselLocation } from "ws-dottie";

import { useVesselPings } from "@/data/contexts";
import type { VesselPing } from "@/data/types/domain/VesselPing";
import { toVesselPing } from "@/data/types/domain/VesselPing";
import { log, VESSEL_HISTORY_MINUTES } from "@/shared/lib";
import {
  featuresToFeatureCollection,
  locationsToLineFeature,
} from "@/shared/utils/geoJson";

// Configuration constants for vessel line processing
const VESSEL_LINE_CONFIG = {
  /** Time window for historical pings (in minutes) */
  HISTORY_WINDOW_MINUTES: VESSEL_HISTORY_MINUTES,
  /** Exclude recent pings to avoid overlap with current position (in minutes) */
  RECENT_CUTOFF_MINUTES: 1,
  /** Minimum number of points required to create a line */
  MIN_LINE_POINTS: 2,
  /** Bezier spline configuration for smooth curves */
  BEZIER_CONFIG: {
    resolution: 10000, // Higher = more interpolated points = smoother
    sharpness: 0.98, // Higher = more curved/smooth (0-1)
  },
} as const;

/**
 * Hook for processing vessel ping data into smooth line features for map display
 * Combines historical vessel pings with current animated positions to create
 * vessel trajectory lines with bezier curve smoothing
 */
export const useVesselLinesData = (vesselLocations: VesselLocation[]) => {
  const { vesselPings } = useVesselPings();

  // Early return if required data is missing
  if (!vesselPings || !vesselLocations?.length) {
    return undefined;
  }

  // Process each vessel individually, filtering out failed ones
  const features = vesselLocations
    .map((vesselLocation) =>
      createVesselLineFeature(vesselLocation, vesselPings)
    )
    .filter((feature) => feature !== null);

  // Convert vessel lines to GeoJSON feature collection
  return featuresToFeatureCollection(features);
};

/**
 * Creates a complete line feature for a single vessel, handling errors gracefully
 * Returns null if the vessel cannot be processed (instead of throwing)
 */
const createVesselLineFeature = (
  vesselLocation: VesselLocation,
  vesselPings: Record<number, VesselPing[]>
): Feature<LineString> | null => {
  try {
    const vesselLine = buildVesselLine(vesselLocation, vesselPings);

    // Need at least 2 points to create a line
    if (vesselLine.length < VESSEL_LINE_CONFIG.MIN_LINE_POINTS) {
      return null;
    }

    return createSmoothLineFeature(vesselLine);
  } catch (error) {
    log.error("Failed to create vessel line feature", {
      vesselId: vesselLocation.VesselID,
      vesselName: vesselLocation.VesselName,
      error,
    });
    return null; // Return null instead of throwing to prevent breaking other vessels
  }
};

/**
 * Builds vessel line data by combining historical pings with current position
 * Filters pings by time window and dock status for cleaner trajectories
 */
const buildVesselLine = (
  vesselLocation: VesselLocation,
  vesselPings: Record<number, VesselPing[]>
): VesselPing[] => {
  const pings = vesselPings[vesselLocation.VesselID];
  if (!pings?.length) return [];

  // Calculate time boundaries for filtering
  const historyStart = getTimeMinutesAgo(
    VESSEL_LINE_CONFIG.HISTORY_WINDOW_MINUTES
  );
  const recentCutoff = getTimeMinutesAgo(
    VESSEL_LINE_CONFIG.RECENT_CUTOFF_MINUTES
  );

  // Filter pings by time window and remove consecutive dock entries
  const filteredPings = pings
    .filter(
      (ping) => ping.TimeStamp >= historyStart && ping.TimeStamp < recentCutoff
    )
    .filter(shouldIncludePing);

  // Combine historical pings with current position
  return [...filteredPings, toVesselPing(vesselLocation)];
};

/**
 * Creates a date object for a given number of minutes ago
 * Memoized to avoid creating new Date objects on every call
 */
const getTimeMinutesAgo = (minutes: number): Date =>
  new Date(Date.now() - minutes * 60 * 1000);

/**
 * Determines if a ping should be included in the vessel line
 * Filters out consecutive dock entries to create cleaner trajectories
 * Keeps pings that are not at dock, or the last ping before leaving dock
 */
const shouldIncludePing = (
  ping: VesselPing,
  index: number,
  array: VesselPing[]
): boolean =>
  !ping.AtDock || (index < array.length - 1 && !array[index + 1].AtDock);

/**
 * Creates a smooth line feature from vessel ping data using bezier spline interpolation
 * Falls back to straight lines if bezier smoothing fails
 */
const createSmoothLineFeature = (
  vesselLine: VesselPing[]
): Feature<LineString> => {
  const lineFeature = locationsToLineFeature(vesselLine);

  try {
    return bezierSpline(lineFeature, VESSEL_LINE_CONFIG.BEZIER_CONFIG);
  } catch (error) {
    log.error("Bezier spline smoothing failed, using straight line", {
      vesselId: vesselLine[0]?.VesselID,
      pointCount: vesselLine.length,
      error,
    });
    return lineFeature; // Fallback to straight line if bezier fails
  }
};

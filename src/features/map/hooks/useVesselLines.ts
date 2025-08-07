import { bezierSpline } from "@turf/turf";
import type { VesselLocation } from "ws-dottie";

import { useVesselPings } from "@/data/contexts";
import type { VesselPing } from "@/data/types/domain/VesselPing";
import { log } from "@/shared/lib/logger";
import {
  featuresToFeatureCollection,
  locationsToLineFeature,
} from "@/shared/utils/geoJson";

/**
 * Hook for processing vessel ping data into smooth line features for map display
 * Combines historical vessel pings with current animated positions to create
 * vessel trajectory lines with bezier curve smoothing
 */
export const useVesselLines = (vesselLocations: VesselLocation[]) => {
  const { vesselPings } = useVesselPings();

  // Early return if required data is missing
  if (!vesselPings || !vesselLocations) {
    return undefined;
  }

  try {
    // Create vessel lines from vessel locations and pings
    const features = vesselLocations
      .map((vesselLocation) => toVesselLine(vesselLocation, vesselPings))
      .filter((line) => line.length >= 2)
      .map(toLineFeature);

    // Convert vessel lines to GeoJSON feature collection
    return featuresToFeatureCollection(features);
  } catch (error) {
    log.error("Error processing vessel lines", {
      error,
      vesselLocationsCount: vesselLocations.length,
    });
    return undefined;
  }
};

/**
 * Converts vessel location and pings to vessel line data
 * Replaces last ping with current position for smooth transitions
 * Returns empty array if no historical pings exist
 */
const toVesselLine = (
  vesselLocation: VesselLocation,
  vesselPings: Record<number, VesselPing[]>
): VesselPing[] => {
  try {
    const pings = vesselPings[vesselLocation.VesselID];
    if (!pings) return [];

    // Filter pings to only include those within the last twenty minutes
    const firstTime = minutesAgo(20);
    const lastTime = minutesAgo(1);
    const filteredPings = pings
      .filter(
        (ping) => ping.TimeStamp >= firstTime && ping.TimeStamp < lastTime
      )
      .filter(filterAtDock);

    // Return the filtered pings and the current location, as a VesselPing
    return [...filteredPings, vesselLocation as VesselPing];
  } catch (error) {
    log.error("Error processing vessel line", {
      vesselId: vesselLocation.VesselID,
      error,
    });
    return [];
  }
};

/**
 * Creates a date object for a given number of minutes ago
 * @param minutes - The number of minutes ago
 * @returns A date object
 */
const minutesAgo = (minutes: number) =>
  new Date(Date.now() - minutes * 60 * 1000);

/**
 * Filters pings to remove consecutive dock entries
 * Keeps pings that are not at dock, or removes consecutive dock pings
 * @param ping - The ping to filter
 * @param index - The index of the ping
 * @param array - The array of pings
 * @returns True if the ping should be kept, false otherwise
 */
const filterAtDock = (ping: VesselPing, index: number, array: VesselPing[]) =>
  !ping.AtDock || (index < array.length - 1 && !array[index + 1].AtDock);

/**
 * Converts vessel line data to GeoJSON line feature with bezier smoothing
 * Creates smooth vessel trajectory lines using bezier spline interpolation
 */
const toLineFeature = (vesselLine: (VesselPing | VesselLocation)[]) => {
  const lineFeature = locationsToLineFeature(vesselLine);
  try {
    return bezierSpline(lineFeature, {
      resolution: 10000, // Higher = more interpolated points = smoother
      sharpness: 0.98, // Higher = more curved/smooth
    });
  } catch {
    log.error("Bezier spline failed for vessel line", vesselLine[0]?.VesselID);
    return lineFeature; // Fallback to straight line if bezier fails
  }
};

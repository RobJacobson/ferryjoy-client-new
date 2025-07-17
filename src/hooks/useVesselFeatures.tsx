import { featureCollection, point } from "@turf/turf";
import type { VesselLocation } from "wsdot-api-client";

/**
 * Calculate ETA in minutes from now, or return null if no ETA available
 */
const calculateEtaMinutes = (eta: Date | null): number | null => {
  if (!eta) return null;

  const now = new Date();
  const diffMs = eta.getTime() - now.getTime();
  const diffMinutes = Math.round(diffMs / (1000 * 60));

  // Return null if ETA is in the past or more than 24 hours away
  if (diffMinutes < 0 || diffMinutes > 24 * 60) return null;

  return diffMinutes;
};

/**
 * Custom hook that converts smoothed vessel positions to GeoJSON format with ETA information
 * Uses Turf.js for proper GeoJSON creation and includes ETA minutes from vessel location data
 */
export const useVesselFeatures = (vessels: VesselLocation[]) =>
  featureCollection(
    vessels.map((vessel) => {
      // Get ETA minutes from the vessel's Eta property (already a Date object)
      const etaMinutes = calculateEtaMinutes(vessel.Eta);

      const feature = point([vessel.Longitude, vessel.Latitude], {
        vessel: {
          ...vessel,
          etaMinutes,
        },
      });
      return feature;
    })
  );

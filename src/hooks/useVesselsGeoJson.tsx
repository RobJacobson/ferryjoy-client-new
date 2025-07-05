import { featureCollection, point } from "@turf/turf";

import { useVesselPositionsSmoothed } from "@/data/contexts/VesselPositionsSmoothed";

/**
 * Custom hook that converts smoothed vessel positions to GeoJSON format
 * Uses Turf.js for proper GeoJSON creation
 */
export const useVesselsGeoJson = () => {
  const { smoothedVessels } = useVesselPositionsSmoothed();

  // Ensure smoothedVessels is always an array
  const vessels = smoothedVessels || [];

  return featureCollection(
    vessels.map((vessel) => point([vessel.lon, vessel.lat], { vessel }))
  );
};

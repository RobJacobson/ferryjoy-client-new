import { featureCollection, point } from "@turf/turf";
import type { VesselLocation } from "ws-dottie";

/**
 * Custom hook that converts vessel positions to GeoJSON format
 * Pure data conversion without any calculated properties
 */
export const useVesselFeatures = (vessels: VesselLocation[]) =>
  featureCollection(
    vessels.map((vessel) => {
      const feature = point([vessel.Longitude, vessel.Latitude], {
        vessel,
      });
      return feature;
    })
  );

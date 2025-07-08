import { featureCollection, point } from "@turf/turf";

import type { VesselLocation } from "../sources/wsf/vessels/vesselLocations";

/**
 * Utility function for converting vessel locations to GeoJSON FeatureCollection using Turf.js
 * Creates a collection of Point features with vessel data in properties
 */
export const vesselsToGeoJSON = (vessels: VesselLocation[]) => {
  const features = vessels.map((vessel) =>
    point([vessel.lon, vessel.lat], { vessel })
  );
  return featureCollection(features);
};

/**
 * Utility function for converting a single vessel location to GeoJSON Point feature
 * Useful for individual vessel rendering or testing
 */
export const vesselToGeoJSON = (vessel: VesselLocation) => {
  return point([vessel.lon, vessel.lat], { vessel });
};

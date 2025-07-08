import { featureCollection, point } from "@turf/turf";

import type { VesselLocation } from "../sources/wsf/vesselLocations";

/**
 * Convert vessel locations to GeoJSON FeatureCollection using Turf.js
 * Creates a collection of Point features with vessel data in properties
 */
export const vesselsToGeoJSON = (vessels: VesselLocation[]) => {
  const features = vessels.map((vessel) =>
    point([vessel.lon, vessel.lat], { vessel })
  );
  return featureCollection(features);
};

/**
 * Convert a single vessel location to GeoJSON Point feature
 * Useful for individual vessel rendering or testing
 */
export const vesselToGeoJSON = (vessel: VesselLocation) => {
  return point([vessel.lon, vessel.lat], { vessel });
};

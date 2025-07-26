import { feature, featureCollection, point } from "@turf/turf";
import type { Feature, Point } from "geojson";
import type { VesselLocation } from "ws-dottie";

/**
 * Utility function for converting vessel locations to GeoJSON FeatureCollection using Turf.js
 * Creates a collection of Point features with vessel data in properties
 */
export const vesselsToFeatureCollection = (vessels: VesselLocation[]) =>
  featureCollection(vessels.map(vesselToFeature));

/**
 * Utility function for converting a single vessel location to GeoJSON Point feature
 * Useful for individual vessel rendering or testing
 */
export const vesselToFeature = (
  vessel: VesselLocation
): Feature<Point, { vessel: VesselLocation }> =>
  point([vessel.Longitude, vessel.Latitude], { vessel });

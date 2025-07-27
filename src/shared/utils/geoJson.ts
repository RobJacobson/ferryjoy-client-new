import { featureCollection, point } from "@turf/turf";
import type { Feature, Point } from "geojson";

type Location = {
  Longitude: number;
  Latitude: number;
};

/**
 * Generic utility function for converting any object with Location properties to GeoJSON Point feature
 * @param location - Object with Longitude and Latitude properties
 * @returns GeoJSON Point feature with the original object as properties
 */
const featureToGeoJson = <T extends Location>(
  location: T
): Feature<Point, { feature: T }> =>
  point([location.Longitude, location.Latitude], { feature: location });

/**
 * Generic utility function for converting an array of objects with Location properties to GeoJSON FeatureCollection
 * @param locations - Array of objects with Longitude and Latitude properties
 * @returns GeoJSON FeatureCollection with each object as feature properties
 */
export const featuresToFeatureCollection = <T extends Location>(
  locations: T[]
) => featureCollection(locations.map(featureToGeoJson));

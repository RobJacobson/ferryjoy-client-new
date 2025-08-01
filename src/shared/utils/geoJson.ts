import { featureCollection, lineString, point } from "@turf/turf";
import type { Feature, LineString, Point } from "geojson";

type Location = {
  Longitude: number;
  Latitude: number;
};

/**
 * Generic utility function for converting any object with Location properties to GeoJSON Point feature
 * @param location - Object with Longitude and Latitude properties
 * @returns GeoJSON Point feature with the original object as properties
 */
const locationToPointFeature = <T extends Location>(
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
) => featureCollection(locations.map(locationToPointFeature));

/**
 * Converts an array of location objects to a GeoJSON LineString feature
 * @param locations - Array of objects with Longitude and Latitude properties
 * @returns GeoJSON LineString feature
 */
export const locationsToLineFeature = <T extends Location>(
  locations: T[]
): Feature<LineString> => {
  const coordinates = locations.map((loc) => [loc.Longitude, loc.Latitude]);
  return lineString(coordinates, locations);
};

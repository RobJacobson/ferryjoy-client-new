import { featureCollection, lineString, point } from "@turf/turf";
import type { Feature, FeatureCollection, LineString, Point } from "geojson";

export type Location = {
  Longitude: number;
  Latitude: number;
};

/**
 * Generic utility function for converting any object with Location properties to GeoJSON Point feature
 * @param location - Object with Longitude and Latitude properties
 * @returns GeoJSON Point feature with the original object as properties
 */
export const locationToPointFeature = <T extends Location>(
  location: T
): Feature<Point, { feature: T }> =>
  point([location.Longitude, location.Latitude], { feature: location });

/**
 * Converts an array of location objects to a GeoJSON FeatureCollection of Points
 * @param locations - Array of objects with Longitude and Latitude properties
 * @returns GeoJSON FeatureCollection containing Point features for each location
 */
export const locationsToFeatureCollection = <T extends Location>(
  locations: T[]
): FeatureCollection =>
  featureCollection(locations.map(locationToPointFeature));

/**
 * Generic utility function for converting an array of GeoJSON Features to FeatureCollection
 * @param features - Array of GeoJSON Features
 * @returns GeoJSON FeatureCollection
 */
export const featuresToFeatureCollection = <T extends Feature>(
  features: T[]
): FeatureCollection => featureCollection(features);

/**
 * Converts an array of location objects to a GeoJSON LineString feature
 * @param locations - Array of objects with Longitude and Latitude properties
 * @returns GeoJSON LineString feature with locations as properties
 */
export const locationsToLineFeature = <T extends Location>(
  locations: T[]
): Feature<LineString, { locations: T[] }> => {
  const coordinates = locations.map((loc) => [loc.Longitude, loc.Latitude]);
  return lineString(coordinates, { locations });
};

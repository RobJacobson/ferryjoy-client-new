import { useCallback } from "react";
import { useWindowDimensions } from "react-native";

import type { BoundingBox } from "@/features/map/types/boundingBox";

type Coordinate = { latitude: number; longitude: number };

/**
 * Type for map instance with flyTo capability
 */
type MapInstance = {
  flyTo?: (options: {
    center: [number, number];
    zoom: number;
    bearing: number;
    pitch: number;
    duration: number;
  }) => void;
};

/**
 * Hook for flying to bounding box with proper zoom calculation
 * Uses window dimensions and pitch to calculate appropriate zoom level
 */
export const useFlyToBoundingBox = () => {
  const { width, height } = useWindowDimensions();

  const flyToBoundingBox = useCallback(
    (
      coordinates: Coordinate[],
      mapInstance: MapInstance,
      pitch: number = 45
    ) => {
      if (coordinates.length === 0) return;

      const center = calculateCenter(coordinates);
      const zoom = calculateZoomLevel(coordinates, { width, height }, pitch);

      flyToLocation(
        mapInstance,
        [center.longitude, center.latitude],
        zoom,
        0, // heading
        pitch
      );
    },
    [width, height]
  );

  return { flyToBoundingBox };
};

/**
 * Calculate center point from array of coordinates
 */
const calculateCenter = (coordinates: Coordinate[]): Coordinate => {
  const sumLat = coordinates.reduce((sum, coord) => sum + coord.latitude, 0);
  const sumLng = coordinates.reduce((sum, coord) => sum + coord.longitude, 0);

  return {
    latitude: sumLat / coordinates.length,
    longitude: sumLng / coordinates.length,
  };
};

/**
 * Project coordinate based on center and pitch
 */
const projectCoordinate = (
  coordinate: Coordinate,
  center: Coordinate,
  pitchRadians: number
): Coordinate => {
  const latDiff = coordinate.latitude - center.latitude;
  const lngDiff = coordinate.longitude - center.longitude;

  // Apply pitch transformation
  const projectedLat = center.latitude + latDiff * Math.cos(pitchRadians);
  const projectedLng = center.longitude + lngDiff;

  return { latitude: projectedLat, longitude: projectedLng };
};

/**
 * Calculate bounding box from coordinates
 */
const calculateBoundingBox = (coordinates: Coordinate[]): BoundingBox => {
  const lats = coordinates.map((c) => c.latitude);
  const lngs = coordinates.map((c) => c.longitude);

  return {
    minLatitude: Math.min(...lats),
    maxLatitude: Math.max(...lats),
    minLongitude: Math.min(...lngs),
    maxLongitude: Math.max(...lngs),
  };
};

/**
 * Calculate appropriate zoom level for bounding box
 */
const calculateZoomLevel = (
  coordinates: Coordinate[],
  mapDimensions: { width: number; height: number },
  pitch: number
): number => {
  const boundingBox = calculateBoundingBox(coordinates);
  // Convert bounding box to Web Mercator pixels at zoom 0
  const [x1, y1] = projectWebMercatorPixels(
    boundingBox.minLongitude,
    boundingBox.minLatitude
  );
  const [x2, y2] = projectWebMercatorPixels(
    boundingBox.maxLongitude,
    boundingBox.maxLatitude
  );

  const bboxWidth = Math.abs(x2 - x1) * Math.cos(pitch * DEGREES_TO_RADIANS);
  const bboxHeight = Math.abs(y2 - y1);

  // Calculate zoom levels for width and height separately to account for different aspect ratios
  const zoomLevelWidth = Math.log2(mapDimensions.width / bboxWidth);
  const zoomLevelHeight = Math.log2(mapDimensions.height / bboxHeight);

  // Take minimum to ensure entire bounding box fits
  const zoomLevel = Math.min(zoomLevelWidth, zoomLevelHeight);

  return zoomLevel;
};

/**
 * Execute flyTo animation
 */
const flyToLocation = (
  mapInstance: MapInstance,
  center: [number, number],
  zoom: number,
  heading: number,
  pitch: number
) => {
  if (mapInstance?.flyTo) {
    mapInstance.flyTo({
      center,
      zoom,
      bearing: heading,
      pitch,
      duration: 10000,
    });
  }
};

/**
 * Project lat/lon to Web Mercator pixels at zoom 0
 */
const projectWebMercatorPixels = (
  lon: number,
  lat: number
): [number, number] => {
  const x = (512 * (lon + 180)) / 360;
  const y =
    (512 *
      (1 -
        Math.log(
          Math.tan((lat * Math.PI) / 180) + 1 / Math.cos((lat * Math.PI) / 180)
        ) /
          Math.PI)) /
    2;
  return [x, y];
};

const DEGREES_TO_RADIANS = Math.PI / 180;

// Perspective projection with pitch (corrected direction)
// function project(x, y, theta, f = 1) {
//   // x, y in [0, 1], y=0 bottom, y=1 top
//   const x0 = x - 0.5;
//   const y0 = y - 0.5;
//   // Corrected: negative pitch (rotate plane toward viewer)
//   const y_rot = y0 * Math.cos(theta);
//   const z_rot = -y0 * Math.sin(theta);
//   const denom = 1 + z_rot / f;
//   const x_proj = x0 / denom + 0.5;
//   const y_proj = y_rot / denom + 0.5;
//   return [x_proj, y_proj];
// }

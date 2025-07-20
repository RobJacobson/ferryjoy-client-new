import { useCallback, useState } from "react";

import type { CameraRef } from "@/components/mapbox/Camera/types";
import { useMapState } from "@/data/contexts/MapStateContext";
import { log } from "@/lib";
import type { BoundingBox } from "@/types";

type Coordinate = { latitude: number; longitude: number };

/**
 * Hook for flying to coordinates with proper zoom level calculation
 * Accounts for map dimensions, pitch, and aspect ratios
 */
export const useFlyToBoundingBox = () => {
  const { cameraRef, mapDimensions, pitch, heading } = useMapState();
  const [computedBoundingBox, setComputedBoundingBox] =
    useState<BoundingBox | null>(null);
  const [currentCoordinates, setCurrentCoordinates] = useState<Coordinate[]>(
    []
  );
  const [currentTerminalAbbrevs, setCurrentTerminalAbbrevs] = useState<
    string[]
  >([]);
  const [calculatedZoomLevel, setCalculatedZoomLevel] = useState<number | null>(
    null
  );

  const flyToCoordinates = useCallback(
    (coordinates: Coordinate[], terminalAbbrevs: string[]) => {
      if (coordinates.length === 0) return;

      setCurrentCoordinates(coordinates);
      setCurrentTerminalAbbrevs(terminalAbbrevs);

      // Calculate bounding box using all points
      const pitchRadians = (pitch * Math.PI) / 180;
      const center = calculateCenter(coordinates);
      const projectedCoordinates = coordinates.map((c) =>
        projectCoordinate(c, center, pitchRadians)
      );
      const pitchedCenter = calculateCenter(projectedCoordinates);
      log.info("center", center);
      log.info("pitchedCenter", pitchedCenter);
      log.info("coordinates", coordinates);
      log.info("projectedCoordinates", projectedCoordinates);

      const boundingBox = calculateBoundingBox(projectedCoordinates);
      setComputedBoundingBox(boundingBox);

      // Calculate center and zoom level using the bounding box
      const zoomLevel = calculateZoomLevel(boundingBox, mapDimensions);
      setCalculatedZoomLevel(zoomLevel);

      flyToLocation(
        cameraRef,
        [center.longitude, center.latitude],
        zoomLevel,
        heading,
        pitch
      );
    },
    [cameraRef, mapDimensions, pitch, heading]
  );

  return {
    flyToCoordinates,
    computedBoundingBox,
    currentCoordinates,
    currentTerminalAbbrevs,
    calculatedZoomLevel,
  };
};

const calculateCenter = (coordinates: Coordinate[]): Coordinate => {
  const lats = coordinates.map((c) => c.latitude);
  const lngs = coordinates.map((c) => c.longitude);
  return {
    latitude: (Math.min(...lats) + Math.max(...lats)) / 2,
    longitude: (Math.min(...lngs) + Math.max(...lngs)) / 2,
  };
};

const projectCoordinate = (
  coordinate: Coordinate,
  center: Coordinate,
  pitchRadians: number
) => {
  const { latitude: y, longitude: x } = coordinate;
  const { latitude: yc, longitude: xc } = center;
  const denom = 1 + (y - yc) * Math.sin(pitchRadians);
  const x_proj = (x - xc) / denom + xc;
  const y_proj = ((y - yc) * Math.cos(pitchRadians)) / denom + yc;
  return {
    latitude: y_proj,
    longitude: x_proj,
  };
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
  boundingBox: BoundingBox,
  mapDimensions: { width: number; height: number }
): number => {
  // Convert bounding box to Web Mercator pixels at zoom 0
  const [x1, y1] = projectWebMercatorPixels(
    boundingBox.minLongitude,
    boundingBox.minLatitude
  );
  const [x2, y2] = projectWebMercatorPixels(
    boundingBox.maxLongitude,
    boundingBox.maxLatitude
  );

  const bboxWidth = Math.abs(x2 - x1);
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
  cameraRef: React.RefObject<CameraRef | null>,
  center: [number, number],
  zoom: number,
  heading: number,
  pitch: number
) => {
  if (cameraRef.current?.flyTo) {
    cameraRef.current.flyTo(center, zoom, heading, pitch, 10000);
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

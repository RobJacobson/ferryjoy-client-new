import { useCallback } from "react";

import { useMapState } from "@/data/contexts/MapStateContext";
import { log } from "@/lib";
import type { BoundingBox } from "@/types";

/**
 * Hook for flying to a bounding box with proper zoom level calculation
 * Accounts for map dimensions, padding, pitch, and aspect ratios
 */
export const useFlyToBoundingBox = () => {
  const { cameraRef, mapDimensions, pitch, heading } = useMapState();

  const flyToBoundingBox = useCallback(
    (boundingBox: BoundingBox) => {
      // Calculate center point from bounding box
      const centerLng =
        (boundingBox.minLongitude + boundingBox.maxLongitude) / 2;
      const centerLat = (boundingBox.minLatitude + boundingBox.maxLatitude) / 2;

      // Project lat/lon to Web Mercator pixels at zoom 0
      const project = (lon: number, lat: number): [number, number] => {
        const x = (512 * (lon + 180)) / 360;
        const y =
          (512 *
            (1 -
              Math.log(
                Math.tan((lat * Math.PI) / 180) +
                  1 / Math.cos((lat * Math.PI) / 180)
              ) /
                Math.PI)) /
          2;
        return [x, y];
      };

      // Get bounding box pixel coordinates at zoom 0
      const [x1, y1] = project(
        boundingBox.minLongitude,
        boundingBox.minLatitude
      );
      const [x2, y2] = project(
        boundingBox.maxLongitude,
        boundingBox.maxLatitude
      );

      // Calculate bounding box size in pixels at zoom 0
      const bboxWidth = Math.abs(x2 - x1);
      const bboxHeight = Math.abs(y2 - y1);

      // Transform bounding box for pitch perspective
      // As pitch increases, the bbox becomes a trapezoid: wider at base, narrower at top, shorter height
      const pitchRadians = (pitch * Math.PI) / 180;
      const pitchAdjustment = Math.cos(pitchRadians);

      // Width: divide by cosine to make it larger (reduce zoom, more space for perspective)
      const pitchAdjustedBboxWidth = bboxWidth / pitchAdjustment;
      // Height: multiply by cosine to make it smaller (increase zoom, account for flattening)
      const pitchAdjustedBboxHeight = bboxHeight * pitchAdjustment;

      // Log pitch adjustment data for debugging
      log.info("Pitch adjustment data:", {
        pitch: `${pitch}°`,
        bbox: {
          originalWidth: bboxWidth,
          adjustedWidth: pitchAdjustedBboxWidth,
          widthAdjustment: (pitchAdjustedBboxWidth / bboxWidth).toFixed(3),
          originalHeight: bboxHeight,
          adjustedHeight: pitchAdjustedBboxHeight,
          heightAdjustment: (pitchAdjustedBboxHeight / bboxHeight).toFixed(3),
        },
      });

      // Calculate zoom levels for width and height separately
      // This properly accounts for aspect ratio differences
      const zoomLevelWidth = Math.log2(
        mapDimensions.width / pitchAdjustedBboxWidth
      );
      const zoomLevelHeight = Math.log2(
        mapDimensions.height / pitchAdjustedBboxHeight
      );

      // Take the minimum zoom level to ensure the entire bounding box fits
      // This ensures both width and height constraints are satisfied
      const zoomLevel = Math.min(zoomLevelWidth, zoomLevelHeight);

      // Clamp zoom level to reasonable bounds
      const clampedZoom = Math.min(18, Math.max(8, zoomLevel));

      // Use flyTo with current pitch and heading to preserve them
      if (cameraRef.current?.flyTo) {
        cameraRef.current.flyTo(
          [centerLng, centerLat],
          clampedZoom,
          heading,
          pitch,
          10000 // 10 seconds animation
        );
      }
    },
    [cameraRef, mapDimensions, pitch, heading]
  );

  return flyToBoundingBox;
};

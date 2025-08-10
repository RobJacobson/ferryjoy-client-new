/**
 * Generic ScaledMarker component for map markers
 * Handles zoom-based scaling, perspective scaling, and 3D transforms
 * Children are responsible for the visual appearance and styling
 */

import type { ReactNode } from "react";
import { TouchableOpacity } from "react-native";

import { useMapState } from "@/shared/contexts";
import { clamp, lerp } from "@/shared/lib/utils";
import { mapProjectionUtils } from "@/shared/utils/mapProjection";

type ScaledMarkerProps = {
  children: ReactNode;
  onPress: () => void;
  latitude: number;
  longitude: number;
  className?: string;
};

// Base size of the marker in pixels
const BASE_SIZE = 96;

// Perspective scaling constant
const PERSPECTIVE_STRENGTH = 1.25;

// Zoom scaling constants
const MIN_ZOOM = 6;
const MAX_ZOOM = 22;
const MIN_ZOOM_SCALE = 0;
const MAX_ZOOM_SCALE = 2;

/**
 * Calculate perspective scaling factor based on pitch and screen Y position
 * Creates a linear relationship where:
 * - screenY = -1 (bottom of screen, closer to camera) gets larger scale when pitch > 0
 * - screenY = +1 (top of screen, further from camera) gets smaller scale when pitch > 0
 * - screenY = 0 (center of screen) gets scale = 1.0
 */
const calculatePerspectiveScale = (pitch: number, screenY: number): number => {
  // No perspective effect when map is flat
  if (pitch === 0) return 1.0;

  // Use cosine-based adjustment: effect becomes more dramatic as pitch approaches 90°
  const pitchRad = pitch * (Math.PI / 180);
  const pitchEffect = (1 - Math.cos(pitchRad)) * PERSPECTIVE_STRENGTH;

  // Create linear relationship:
  // screenY = -1 → scale > 1.0 (larger)
  // screenY = 0 → scale = 1.0 (normal)
  // screenY = +1 → scale < 1.0 (smaller)
  const perspectiveFactor = 1.0 - screenY * pitchEffect;

  return clamp(perspectiveFactor, 0.5, 2.0);
};

/**
 * Calculate zoom-based scaling factor
 * Maps zoom level from MIN_ZOOM to MAX_ZOOM to scale from MIN_ZOOM_SCALE to MAX_ZOOM_SCALE
 *
 * @param zoomLevel - Current map zoom level
 * @returns Scale factor based on zoom level (0 at zoom 4, 1 at zoom 22)
 */
const calculateZoomScale = (zoomLevel: number): number =>
  lerp(zoomLevel, MIN_ZOOM, MAX_ZOOM, MIN_ZOOM_SCALE, MAX_ZOOM_SCALE);

export const ScaledMarker = ({
  children,
  onPress,
  latitude,
  longitude,
  className,
}: ScaledMarkerProps) => {
  const { cameraState, mapDimensions } = useMapState();

  // Calculate precise screen Y position using viewport-mercator-project
  const screenY = mapProjectionUtils.getNormalizedScreenY(
    [longitude, latitude],
    cameraState,
    mapDimensions
  );

  // Calculate perspective scale based on pitch and precise screen position
  const perspectiveScale = calculatePerspectiveScale(
    cameraState.pitch,
    screenY
  );

  // Calculate zoom-based scale (0 at zoom 4, 1 at zoom 22)
  const zoomScale = calculateZoomScale(cameraState.zoomLevel);

  // Calculate final marker size by combining base size with both scaling factors
  const totalScale = perspectiveScale * zoomScale;

  return (
    <TouchableOpacity
      onPress={onPress}
      className={className}
      style={{
        transform: [
          { rotateX: `${cameraState.pitch}deg` },
          { scale: totalScale },
        ],
      }}
    >
      {children}
    </TouchableOpacity>
  );
};

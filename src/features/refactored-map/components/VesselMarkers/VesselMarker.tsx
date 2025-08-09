import { TouchableOpacity } from "react-native";
import type { VesselLocation } from "ws-dottie";

import { useMapState } from "@/shared/contexts";
import { clamp, cn, lerp } from "@/shared/lib/utils";
import { mapProjectionUtils } from "@/shared/utils/mapProjection";

import { getVesselMarkerStyles } from "./shared";

/**
 * Base size of the vessel marker in pixels
 * This is the maximum size of the marker when the map is at zoom level 22
 * and perspective scaling is at 1.0 (center of screen or pitch is 0)
 */
const BASE_SIZE = 96;

// Perspective scaling constant
const PERSPECTIVE_STRENGTH = 1.25;

// Zoom scaling constants
const MIN_ZOOM = 4;
const MAX_ZOOM = 22;
const MIN_ZOOM_SCALE = 0;
const MAX_ZOOM_SCALE = 1;

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

/**
 * Shared vessel marker content component
 * Renders the visual appearance of a vessel marker with:
 * - Zoom-based sizing (invisible at zoom 4, full size at zoom 22)
 * - Perspective scaling based on screen position and camera pitch
 * - Pitch-based rotation for 3D effect
 * Uses precise viewport-mercator-project calculations for accurate perspective effects
 */
export const VesselMarker = ({
  vessel,
  onPress,
}: {
  vessel: VesselLocation;
  onPress: () => void;
}) => {
  const { cameraState, mapDimensions } = useMapState();

  // Calculate precise screen Y position using viewport-mercator-project
  const screenY = mapProjectionUtils.getNormalizedScreenY(
    [vessel.Longitude, vessel.Latitude],
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
  const scaledSize = BASE_SIZE * perspectiveScale * zoomScale;

  return (
    <TouchableOpacity
      onPress={onPress}
      className={cn(
        "rounded-full border-2 border-white shadow-sm",
        getVesselMarkerStyles(vessel.InService)
      )}
      style={{
        width: scaledSize,
        height: scaledSize,
        transform: [{ rotateX: `${cameraState.pitch}deg` }],
      }}
    />
  );
};

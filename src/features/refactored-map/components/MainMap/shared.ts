/**
 * Shared constants and types for MainMap component
 * Contains layout logic and configuration used by both native and web implementations
 */

import type { PropsWithChildren } from "react";

import type { CameraState } from "../../utils/cameraTranslation";

export type MainMapProps = PropsWithChildren<{
  onCameraStateChange?: (cameraState: CameraState) => void;
}>;

export const DEFAULT_CAMERA_STATE: CameraState = {
  centerCoordinate: [-122.3321, 47.6062], // Seattle coordinates
  zoomLevel: 9,
  heading: 0,
  pitch: 0,
};

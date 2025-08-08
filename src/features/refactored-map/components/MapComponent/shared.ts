/**
 * Shared logic for Map component
 * Contains layout, styling, and common functionality used by both native and web implementations
 */

import type { PropsWithChildren } from "react";
import { StyleSheet } from "react-native";

import { DEFAULT_CAMERA_STATE, DEFAULT_MAP_STYLE } from "../../utils/mapbox";
import type { CameraState } from "./cameraState";

/**
 * Map component props type
 */
export type MapProps = PropsWithChildren<{
  /** Initial camera state for the map (native format) */
  initialCameraState?: CameraState;
  /** Map style URL */
  mapStyle?: string;
  /** Callback when map camera state changes */
  onCameraStateChange?: (cameraState: CameraState) => void;
}>;

/**
 * Default props for Map component
 */
export const DEFAULT_MAP_PROPS: MapProps = {
  initialCameraState: DEFAULT_CAMERA_STATE,
  mapStyle: DEFAULT_MAP_STYLE,
};

/**
 * Styles for Map component
 */
export const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: "relative",
  },
  map: {
    flex: 1,
  },
});

/**
 * Merge camera state with defaults
 */
export const mergeCameraState = (
  userCameraState?: Partial<CameraState>
): CameraState => ({
  ...DEFAULT_CAMERA_STATE,
  ...userCameraState,
});

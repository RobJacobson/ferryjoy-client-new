/**
 * MainMap component
 * High-level wrapper that provides content management and business logic
 * Platform-agnostic wrapper that doesn't touch Mapbox libraries directly
 */

import type { PropsWithChildren } from "react";

import type { CameraState } from "../../utils/cameraTranslation";
import { MapComponent } from "../MapComponent";
import { RoutesLayer } from "../RoutesLayer";
import { VesselLayer } from "../VesselLayer";

export type MainMapProps = PropsWithChildren<{
  onCameraStateChange?: (cameraState: CameraState) => void;
}>;

export const DEFAULT_CAMERA_STATE: CameraState = {
  centerCoordinate: [-122.3321, 47.6062], // Seattle coordinates
  zoomLevel: 9,
  heading: 0,
  pitch: 0,
};

export const MainMap = ({ children, onCameraStateChange }: MainMapProps) => {
  return (
    <MapComponent
      onCameraStateChange={onCameraStateChange}
      initialCameraState={DEFAULT_CAMERA_STATE}
    >
      <RoutesLayer />
      <VesselLayer />
      {children}
    </MapComponent>
  );
};

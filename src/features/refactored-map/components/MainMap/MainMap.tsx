/**
 * MainMap component
 * High-level wrapper that provides content management and business logic
 * Platform-agnostic wrapper that doesn't touch Mapbox libraries directly
 */

import type { PropsWithChildren } from "react";

import { useVesselLocations } from "@/data/contexts/VesselLocationContext";

import { MapComponent } from "../MapComponent";
import type { CameraState } from "../MapComponent/cameraState";
import { RoutesLayer } from "../RoutesLayer";
import { VesselLayer } from "../VesselLayer";
import { VesselLines } from "../VesselLines";

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
  const { vesselLocations } = useVesselLocations();

  return (
    <MapComponent
      onCameraStateChange={onCameraStateChange}
      initialCameraState={DEFAULT_CAMERA_STATE}
    >
      <RoutesLayer />
      <VesselLines vesselLocations={vesselLocations} />
      <VesselLayer vesselLocations={vesselLocations} />
      {children}
    </MapComponent>
  );
};

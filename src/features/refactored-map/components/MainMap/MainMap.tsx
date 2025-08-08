/**
 * MainMap component
 * High-level wrapper that provides content management and business logic
 * Platform-agnostic wrapper that doesn't touch Mapbox libraries directly
 */

import type { PropsWithChildren } from "react";

import { useVesselLocations } from "@/data/contexts/VesselLocationContext";

import { DEFAULT_CAMERA_STATE } from "../../utils/mapbox";
import { MapComponent } from "../MapComponent";
import type { CameraState } from "../MapComponent/cameraState";
import { RoutesLayer } from "../RoutesLayer";
import { VesselLayer } from "../VesselLayer";
import { VesselLines } from "../VesselLines";
import { VesselMarkers } from "../VesselMarkers";

export type MainMapProps = PropsWithChildren<{
  onCameraStateChange?: (cameraState: CameraState) => void;
}>;

export const MainMap = ({ children, onCameraStateChange }: MainMapProps) => {
  const { vesselLocations } = useVesselLocations();

  return (
    <MapComponent onCameraStateChange={onCameraStateChange}>
      <RoutesLayer />
      <VesselLines vesselLocations={vesselLocations} />
      <VesselLayer vesselLocations={vesselLocations} />
      <VesselMarkers vesselLocations={vesselLocations} />
      {children}
    </MapComponent>
  );
};

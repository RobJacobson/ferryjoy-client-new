/**
 * MainMap component
 * High-level wrapper that provides content management and business logic
 * Platform-agnostic wrapper that doesn't touch Mapbox libraries directly
 */

import type { PropsWithChildren } from "react";

import { useVesselLocations } from "@/data/contexts/VesselLocationContext";

import { DebugPanel } from "../components/DebugPanel";
import { MapComponent } from "../components/MapComponent";
import type { CameraState } from "../components/MapComponent/cameraState";
import { RoutesLayer } from "../components/RoutesLayer";
import { VesselLayer } from "../components/VesselLayer";
import { VesselLines } from "../components/VesselLines";
import { VesselMarkers } from "../components/VesselMarkers";
import { DEFAULT_CAMERA_STATE } from "../utils/mapbox";

// Toggle to show/hide debug panel
const SHOW_DEBUG_PANEL = false;

export type MainMapProps = PropsWithChildren<{
  onCameraStateChange?: (cameraState: CameraState) => void;
}>;

export const MainMap = ({ children, onCameraStateChange }: MainMapProps) => {
  const { vesselLocations } = useVesselLocations();

  return (
    <MapComponent onCameraStateChange={onCameraStateChange}>
      <RoutesLayer />
      <VesselLines vesselLocations={vesselLocations} />
      {/* <VesselLayer vesselLocations={vesselLocations} /> */}
      <VesselMarkers vesselLocations={vesselLocations} />
      {SHOW_DEBUG_PANEL && <DebugPanel />}
      {children}
    </MapComponent>
  );
};

/**
 * MainMap component
 * High-level wrapper that provides content management and business logic
 * Platform-agnostic wrapper that doesn't touch Mapbox libraries directly
 */

import type { PropsWithChildren } from "react";

import { useVesselLocations } from "@/data/contexts/VesselLocationContext";
import { useAnimatedVesselLocations } from "@/shared/hooks/useAnimatedVesselLocations";

import { DebugPanel } from "../components/DebugPanel";
import { MapComponent } from "../components/MapComponent";
import type { CameraState } from "../components/MapComponent/cameraState";
import { RoutesLayer } from "../components/RoutesLayer";
import { VesselLayer } from "../components/VesselLayer";
import { VesselLines } from "../components/VesselLines";
import { VesselMarkers } from "../components/VesselMarkers";

// Toggle to show/hide debug panel
const SHOW_DEBUG_PANEL = false;

export type MainMapProps = PropsWithChildren<{
  onCameraStateChange?: (cameraState: CameraState) => void;
}>;

export const MainMap = ({ children, onCameraStateChange }: MainMapProps) => {
  const { vesselLocations } = useVesselLocations();
  const animatedVesselLocations = useAnimatedVesselLocations();

  return (
    <MapComponent onCameraStateChange={onCameraStateChange}>
      <RoutesLayer />
      <VesselLines vesselLocations={animatedVesselLocations} />
      <VesselMarkers vesselLocations={animatedVesselLocations} />
      {SHOW_DEBUG_PANEL && <DebugPanel />}
      {children}
    </MapComponent>
  );
};

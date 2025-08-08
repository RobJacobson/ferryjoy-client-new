/**
 * MainMap native implementation using @rnmapbox/maps
 * High-level wrapper that provides content management and business logic
 */

import { MapComponent } from "../MapComponent";
import { RoutesLayer } from "../RoutesLayer";
import { DEFAULT_CAMERA_STATE, type MainMapProps } from "./shared";

export const MainMap = ({ children, onCameraStateChange }: MainMapProps) => {
  return (
    <MapComponent
      onCameraStateChange={onCameraStateChange}
      initialCameraState={DEFAULT_CAMERA_STATE}
    >
      <RoutesLayer />
      {children}
    </MapComponent>
  );
};

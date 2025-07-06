import Mapbox from "@rnmapbox/maps";

import type { CameraProps } from "./types";

// Native implementation using @rnmapbox/maps
export const Camera = ({
  centerCoordinate,
  zoomLevel,
  heading,
  pitch,
  animationDuration,
  animationMode,
}: CameraProps) => {
  return (
    <Mapbox.Camera
      centerCoordinate={centerCoordinate}
      zoomLevel={zoomLevel}
      heading={heading}
      pitch={pitch}
      animationDuration={animationDuration}
      animationMode={animationMode}
    />
  );
};

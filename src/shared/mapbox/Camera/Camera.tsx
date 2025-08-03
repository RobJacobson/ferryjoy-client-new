import Mapbox from "@rnmapbox/maps";
import { forwardRef, useImperativeHandle, useRef } from "react";

import type { CameraProps } from "./types";

// Native implementation using @rnmapbox/maps
// Note: @rnmapbox/maps Camera automatically receives map context when used inside MapView
export const Camera = forwardRef<any, CameraProps>((props, ref) => {
  const cameraRef = useRef<Mapbox.Camera>(null);

  // Provide simple flyTo imperative handle
  useImperativeHandle(ref, () => ({
    flyTo: (
      centerCoordinate: [number, number],
      zoomLevel: number,
      heading: number,
      pitch: number,
      animationDuration = 1000
    ) => {
      cameraRef.current?.setCamera({
        centerCoordinate,
        zoomLevel,
        heading,
        pitch,
        animationDuration,
      });
    },
  }));

  return <Mapbox.Camera ref={cameraRef} {...props} />;
});

Camera.displayName = "Camera";

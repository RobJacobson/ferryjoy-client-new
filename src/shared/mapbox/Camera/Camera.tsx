import Mapbox from "@rnmapbox/maps";
import { forwardRef, useImperativeHandle, useRef } from "react";

import type { CameraProps, CameraRef } from "./types";

// Native implementation using @rnmapbox/maps
// Note: @rnmapbox/maps Camera automatically receives map context when used inside MapView
export const Camera = forwardRef<CameraRef, CameraProps>((props, ref) => {
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
    fitBounds: (
      _ne: [number, number],
      _sw: [number, number],
      _paddingConfig?: number | number[],
      _animationDuration?: number
    ) => {
      // Note: fitBounds is not directly supported by @rnmapbox/maps Camera
      // This is a placeholder implementation
      console.warn("fitBounds not implemented for native Camera component");
    },
  }));

  return <Mapbox.Camera ref={cameraRef} {...props} />;
});

Camera.displayName = "Camera";

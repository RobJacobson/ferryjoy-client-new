import { forwardRef, useContext, useEffect, useImperativeHandle } from "react";
import type { MapRef } from "react-map-gl/mapbox";

import { MapContext } from "../MapView/MapView.web";
import { type CameraProps, createFitBoundsHandle } from "./types";

// Web implementation using react-map-gl/mapbox
// Note: This component requires a MapView context to work properly
export const Camera = forwardRef<any, CameraProps>(
  (
    {
      centerCoordinate,
      zoomLevel,
      heading,
      pitch,
      animationDuration = 1000,
      animationMode = "flyTo",
    },
    ref
  ) => {
    const mapInstance = useContext(MapContext);

    // Use shared utility to create fitBounds imperative handle
    useImperativeHandle(ref, () => createFitBoundsHandle(mapInstance), [
      mapInstance,
    ]);

    useEffect(() => {
      if (!mapInstance) return;

      const cameraOptions: {
        center?: [number, number];
        zoom?: number;
        bearing?: number;
        pitch?: number;
        duration?: number;
      } = {};

      if (centerCoordinate !== undefined)
        cameraOptions.center = centerCoordinate;
      if (zoomLevel !== undefined) cameraOptions.zoom = zoomLevel;
      if (heading !== undefined) cameraOptions.bearing = heading;
      if (pitch !== undefined) cameraOptions.pitch = pitch;
      if (animationDuration !== undefined)
        cameraOptions.duration = animationDuration;

      if (Object.keys(cameraOptions).length === 0) return;

      switch (animationMode) {
        case "flyTo":
          mapInstance.flyTo(cameraOptions);
          break;
        case "easeTo":
          mapInstance.easeTo(cameraOptions);
          break;
        case "linearTo":
          if (cameraOptions.center) {
            mapInstance.panTo(cameraOptions.center, {
              duration: animationDuration,
            });
          }
          break;
      }
    }, [
      mapInstance,
      centerCoordinate,
      zoomLevel,
      heading,
      pitch,
      animationDuration,
      animationMode,
    ]);

    // Camera component doesn't render anything on web
    return null;
  }
);

Camera.displayName = "Camera";

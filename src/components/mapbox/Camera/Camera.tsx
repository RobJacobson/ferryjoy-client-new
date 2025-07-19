import Mapbox from "@rnmapbox/maps";
import { forwardRef, useContext, useImperativeHandle } from "react";

import { MapContext } from "../MapView";
import { type CameraProps, createFitBoundsHandle } from "./types";

// Native implementation using @rnmapbox/maps
export const Camera = forwardRef<any, CameraProps>(
  (
    {
      centerCoordinate,
      zoomLevel,
      heading,
      pitch,
      animationDuration,
      animationMode,
    },
    ref
  ) => {
    const mapContext = useContext(MapContext);

    // Use shared utility to create fitBounds imperative handle
    useImperativeHandle(ref, () => createFitBoundsHandle(mapContext), [
      mapContext,
    ]);

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
  }
);

Camera.displayName = "Camera";

import Mapbox from "@rnmapbox/maps";
import { useCallback, useRef } from "react";

import { nativeMapStateToCameraState } from "@/features/refactored-map/components/MapComponent/cameraState";
import { useMapState } from "@/shared/contexts";

import { type MapViewProps, StyleURL } from "./types";

// Set the access token from environment variable
Mapbox.setAccessToken(process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN || "");

// Native implementation using @rnmapbox/maps
export const MapView = ({
  style,
  styleURL,
  scaleBarEnabled,
  onLayout,
  children,
}: MapViewProps & { children?: React.ReactNode }) => {
  const { cameraState, updateCameraState, updateMapDimensions } = useMapState();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleCameraChanged = useCallback(
    (state: Mapbox.MapState) => {
      // Clear previous timeout to debounce rapid camera changes
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Debounce camera state updates to avoid excessive re-renders
      timeoutRef.current = setTimeout(() => {
        const cameraState = nativeMapStateToCameraState(state);
        updateCameraState(cameraState);
      }, 100); // Update state 100ms after camera movement stops
    },
    [updateCameraState]
  );

  const handleLayout = (event: {
    nativeEvent: { layout: { width: number; height: number } };
  }) => {
    const { width, height } = event.nativeEvent.layout;
    updateMapDimensions(width, height);

    // Call the original onLayout if provided
    if (onLayout) {
      onLayout(event);
    }
  };

  return (
    <Mapbox.MapView
      style={style}
      styleURL={styleURL}
      scaleBarEnabled={scaleBarEnabled}
      onCameraChanged={handleCameraChanged}
      onLayout={handleLayout}
    >
      <Mapbox.Camera
        centerCoordinate={[...cameraState.centerCoordinate]}
        zoomLevel={cameraState.zoomLevel}
        heading={cameraState.heading}
        pitch={cameraState.pitch}
        animationDuration={500}
        animationMode="flyTo"
      />
      {children}
    </Mapbox.MapView>
  );
};

export { StyleURL };
export type { MapViewProps };

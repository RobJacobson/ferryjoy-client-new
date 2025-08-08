import Mapbox from "@rnmapbox/maps";

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
  const { updateCameraState, updateMapDimensions } = useMapState();

  const handleCameraChanged = (state: Mapbox.MapState) => {
    // Convert native MapState to CameraState format
    const cameraState = nativeMapStateToCameraState(state);
    updateCameraState(cameraState);
  };

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
      {children}
    </Mapbox.MapView>
  );
};

export { StyleURL };
export type { MapViewProps };

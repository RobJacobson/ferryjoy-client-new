/**
 * Native implementation of Map component
 * Uses @rnmapbox/maps directly without abstraction layers
 */

import MapboxRN from "@rnmapbox/maps";
import { useCallback, useRef } from "react";
import { View } from "react-native";

import { useMapState } from "@/shared/contexts";

import {
  createCameraStateHandler,
  nativeMapStateToCameraState,
} from "./cameraState";
import { DEFAULT_MAP_PROPS, type MapProps, styles } from "./shared";

/**
 * Map component for native platform
 * Uses @rnmapbox/maps MapView with throttled state updates for optimal performance
 */
export const MapComponent = ({
  mapStyle = DEFAULT_MAP_PROPS.mapStyle,
  children,
  onCameraStateChange,
}: MapProps) => {
  const { cameraState, updateCameraState } = useMapState();
  const mapRef = useRef<MapboxRN.MapView>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleCameraStateChange = createCameraStateHandler(
    updateCameraState,
    onCameraStateChange
  );

  // Throttled camera change handler - updates state every 100ms, not every frame
  const handleCameraChanged = useCallback(
    (state: MapboxRN.MapState) => {
      // Clear previous timeout to throttle rapid camera changes
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Throttle camera state updates to avoid excessive re-renders
      timeoutRef.current = setTimeout(() => {
        const cameraState = nativeMapStateToCameraState(state);
        handleCameraStateChange(cameraState);
      }, 100); // Update state every 100ms during camera movement
    },
    [handleCameraStateChange]
  );

  return (
    <View style={styles.container}>
      <MapboxRN.MapView
        ref={mapRef}
        style={styles.map}
        styleURL={mapStyle}
        onCameraChanged={handleCameraChanged}
        scaleBarEnabled={false}
      >
        <MapboxRN.Camera
          centerCoordinate={[...cameraState.centerCoordinate]}
          zoomLevel={cameraState.zoomLevel}
          heading={cameraState.heading}
          pitch={cameraState.pitch}
          animationDuration={500}
          animationMode="flyTo"
        />
        {children}
      </MapboxRN.MapView>
    </View>
  );
};

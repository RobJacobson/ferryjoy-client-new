/**
 * Native implementation of Map component
 * Uses @rnmapbox/maps directly without abstraction layers
 */

import MapboxRN from "@rnmapbox/maps";
import { useRef, useState } from "react";
import { View } from "react-native";

import type { CameraState, MapState } from "../../utils/cameraTranslation";
import { fromNativeMapState } from "../../utils/cameraTranslation";
import {
  DEFAULT_MAP_PROPS,
  type MapProps,
  mergeCameraState,
  styles,
} from "./shared";

/**
 * Map component for native platforms (iOS/Android)
 * Uses @rnmapbox/maps Camera component for view state management
 */
export const MapComponent = ({
  initialCameraState = DEFAULT_MAP_PROPS.initialCameraState,
  mapStyle = DEFAULT_MAP_PROPS.mapStyle,
  children,
  onCameraStateChange,
}: MapProps) => {
  const [currentCameraState, setCurrentCameraState] = useState(
    mergeCameraState(initialCameraState)
  );
  const mapRef = useRef<MapboxRN.MapView>(null);

  // Handle camera changes
  const handleCameraChanged = (state: MapState) => {
    const newCameraState = fromNativeMapState(state);
    setCurrentCameraState(newCameraState);
    onCameraStateChange?.(newCameraState);
  };

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
          centerCoordinate={[...currentCameraState.centerCoordinate]}
          zoomLevel={currentCameraState.zoomLevel}
          heading={currentCameraState.heading}
          pitch={currentCameraState.pitch}
          animationDuration={500}
          animationMode="flyTo"
        />
        {children}
      </MapboxRN.MapView>
    </View>
  );
};

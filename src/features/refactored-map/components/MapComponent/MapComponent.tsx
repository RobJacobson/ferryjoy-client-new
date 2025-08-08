/**
 * Native implementation of Map component
 * Uses @rnmapbox/maps directly without abstraction layers
 */

import MapboxRN from "@rnmapbox/maps";
import { useRef, useState } from "react";
import { View } from "react-native";

import { useMapState } from "@/shared/contexts";

import {
  createCameraStateHandler,
  nativeMapStateToCameraState,
} from "./cameraState";
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
  const [cameraState, setCameraState] = useState(
    mergeCameraState(initialCameraState)
  );
  const mapRef = useRef<MapboxRN.MapView>(null);
  const { updateCameraState } = useMapState();

  const handleCameraStateChange = createCameraStateHandler(
    setCameraState,
    updateCameraState,
    onCameraStateChange
  );

  return (
    <View style={styles.container}>
      <MapboxRN.MapView
        ref={mapRef}
        style={styles.map}
        styleURL={mapStyle}
        onCameraChanged={(state: MapboxRN.MapState) =>
          handleCameraStateChange(nativeMapStateToCameraState(state))
        }
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

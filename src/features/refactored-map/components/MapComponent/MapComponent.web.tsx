/**
 * Web implementation of Map component
 * Uses react-map-gl/mapbox directly without abstraction layers
 */

import { useState } from "react";
import MapboxGL, { type ViewStateChangeEvent } from "react-map-gl/mapbox";
import { View } from "react-native";

import type { CameraState } from "../../utils/cameraTranslation";
import {
  fromWebViewState,
  toWebViewState,
} from "../../utils/cameraTranslation";
import {
  DEFAULT_MAP_PROPS,
  type MapProps,
  mergeCameraState,
  styles,
} from "./shared";

/**
 * Map component for web platform
 * Uses react-map-gl MapGL component with viewState management
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

  // Handle view state changes from react-map-gl and convert to native format
  const handleViewStateChange = (evt: ViewStateChangeEvent) => {
    const newCameraState = fromWebViewState(evt.viewState);
    setCameraState(newCameraState);
    onCameraStateChange?.(newCameraState);
  };

  // Convert native camera state to web format for react-map-gl
  const webViewState = toWebViewState(cameraState);

  return (
    <View style={styles.container}>
      <MapboxGL
        {...webViewState}
        style={styles.map}
        mapStyle={mapStyle}
        onMove={handleViewStateChange}
        reuseMaps
        mapboxAccessToken={process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN}
      >
        {children}
      </MapboxGL>
    </View>
  );
};

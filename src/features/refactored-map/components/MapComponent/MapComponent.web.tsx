/**
 * Web implementation of Map component
 * Uses react-map-gl/mapbox directly without abstraction layers
 */

import { useState } from "react";
import MapboxGL, {
  type MapRef,
  type ViewStateChangeEvent,
} from "react-map-gl/mapbox";
import { View } from "react-native";

import { useMapState } from "@/shared/contexts";

import {
  createCameraStateHandler,
  toWebViewState,
  webViewStateToCameraState,
} from "./cameraState";
import { DEFAULT_MAP_PROPS, type MapProps, styles } from "./shared";

/**
 * Map component for web platform
 * Uses react-map-gl MapGL component with viewState management
 */
export const MapComponent = ({
  mapStyle = DEFAULT_MAP_PROPS.mapStyle,
  children,
  onCameraStateChange,
}: MapProps) => {
  const { cameraState, updateCameraState } = useMapState();
  const [mapInstance, setMapInstance] = useState<MapRef | null>(null);

  const handleCameraStateChange = createCameraStateHandler(
    updateCameraState,
    onCameraStateChange
  );

  // Convert native camera state to web format for react-map-gl
  const webViewState = toWebViewState(cameraState);

  return (
    <View style={styles.container}>
      <MapboxGL
        ref={setMapInstance}
        viewState={webViewState}
        style={styles.map}
        mapStyle={mapStyle}
        projection="mercator"
        onMove={(evt: ViewStateChangeEvent) =>
          handleCameraStateChange(webViewStateToCameraState(evt.viewState))
        }
        reuseMaps
        mapboxAccessToken={process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN}
      >
        {children}
      </MapboxGL>
    </View>
  );
};

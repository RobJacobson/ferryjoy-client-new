/** biome-ignore-all lint/suspicious/noExplicitAny: Some props are not typed */
import { type PropsWithChildren, useState } from "react";
import type { MapRef, ViewStateChangeEvent } from "react-map-gl/mapbox";
import * as ReactMapGL from "react-map-gl/mapbox";
import { Text, View } from "react-native";

import { webViewStateToCameraState } from "@/features/refactored-map/components/MapComponent/cameraState";
import { useMapState } from "@/shared/contexts";
import { SEATTLE_COORDINATES } from "@/shared/lib";

// Import Mapbox CSS only for web
import "mapbox-gl/dist/mapbox-gl.css";

import { type MapViewProps, StyleURL } from "./types";

// Set the access token from environment variable
const MAPBOX_ACCESS_TOKEN = process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN || "";

// Web implementation using react-map-gl/mapbox
export const MapView = ({
  styleURL = "mapbox://styles/mapbox/dark-v11",
  onLayout,
  children,
}: MapViewProps) => {
  const { cameraState, updateCameraState, updateMapDimensions } = useMapState();
  const [mapInstance, setMapInstance] = useState<MapRef | null>(null);

  // Validate Mapbox access token
  if (
    !MAPBOX_ACCESS_TOKEN ||
    MAPBOX_ACCESS_TOKEN === "your_mapbox_access_token"
  ) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-900 text-white">
        <div className="text-center">
          <p>Mapbox access token not configured</p>
        </div>
      </div>
    );
  }

  const handleLayout = (event: React.SyntheticEvent<HTMLDivElement>) => {
    const target = event.currentTarget;
    const width = target.offsetWidth;
    const height = target.offsetHeight;

    updateMapDimensions(width, height);

    // Call the original onLayout if provided
    if (onLayout) {
      onLayout({
        nativeEvent: {
          layout: { width, height },
        },
      });
    }
  };

  const handleViewStateChange = (evt: ViewStateChangeEvent) => {
    // Convert web ViewState to CameraState format
    const cameraState = webViewStateToCameraState(evt.viewState);
    updateCameraState(cameraState);
  };

  return (
    <div
      className="flex-1"
      style={{ position: "relative", width: "100%", height: "100%" }}
      onLoad={handleLayout}
    >
      <ReactMapGL.Map
        ref={setMapInstance}
        mapboxAccessToken={MAPBOX_ACCESS_TOKEN}
        style={{ width: "100%", height: "100%" }}
        mapStyle={styleURL}
        initialViewState={{
          longitude: cameraState.centerCoordinate[0],
          latitude: cameraState.centerCoordinate[1],
          zoom: cameraState.zoomLevel,
          pitch: cameraState.pitch,
          bearing: cameraState.heading,
        }}
        onMove={handleViewStateChange}
      >
        {children}
      </ReactMapGL.Map>
    </div>
  );
};

export { StyleURL };

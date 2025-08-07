/** biome-ignore-all lint/suspicious/noExplicitAny: Some props are not typed */
import { type PropsWithChildren, useState } from "react";
import type { MapRef, ViewStateChangeEvent } from "react-map-gl/mapbox";
import * as ReactMapGL from "react-map-gl/mapbox";
import { Text, View } from "react-native";

// import { useMapState } from "@/shared/contexts";
import { SEATTLE_COORDINATES } from "@/shared/lib";

import { MapContext } from "../MapContext";

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
  // const { updateMapState, updateMapDimensions } = useMapState();
  const [mapInstance, setMapInstance] = useState<MapRef | null>(null);
  const [viewState, setViewState] = useState({
    longitude: SEATTLE_COORDINATES[0],
    latitude: SEATTLE_COORDINATES[1],
    zoom: 10,
    pitch: 45,
    bearing: 0,
  });

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

  const handleLayout = (event: { target: HTMLElement }) => {
    const target = event.target;
    const width = target.offsetWidth;
    const height = target.offsetHeight;

    // updateMapDimensions(width, height);

    // Call the original onLayout if provided
    if (onLayout) {
      onLayout({
        nativeEvent: {
          layout: { width, height },
        },
      });
    }
  };

  return (
    <MapContext.Provider value={mapInstance}>
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
          initialViewState={viewState}
          onMove={(evt: ViewStateChangeEvent) => {
            setViewState(evt.viewState);
            // updateMapState({
            //   latitude: evt.viewState.latitude,
            //   longitude: evt.viewState.longitude,
            //   zoom: evt.viewState.zoom,
            //   pitch: evt.viewState.pitch,
            //   heading: evt.viewState.bearing,
            // });
          }}
        >
          {children}
        </ReactMapGL.Map>
      </div>
    </MapContext.Provider>
  );
};

export { StyleURL };

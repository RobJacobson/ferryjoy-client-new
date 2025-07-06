/** biome-ignore-all lint/suspicious/noExplicitAny: Some props are not typed */
import { createContext, type PropsWithChildren, useState } from "react";
import type { MapRef, ViewStateChangeEvent } from "react-map-gl/mapbox";
import * as ReactMapGL from "react-map-gl/mapbox";

import { SEATTLE_COORDINATES } from "@/lib/utils";

import { type MapViewProps, StyleURL } from "./types";

// Set the access token from environment variable
const MAPBOX_ACCESS_TOKEN = process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN || "";

// Context to share map ref between MapView and Camera
export const MapContext = createContext<MapRef | null>(null);

// Web implementation using react-map-gl/mapbox
export const MapView = ({
  styleURL = "mapbox://styles/mapbox/dark-v11",
  children,
}: MapViewProps) => {
  const [mapInstance, setMapInstance] = useState<MapRef | null>(null);
  const [viewState, setViewState] = useState({
    longitude: SEATTLE_COORDINATES[0],
    latitude: SEATTLE_COORDINATES[1],
    zoom: 4,
    pitch: 0,
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

  return (
    <MapContext.Provider value={mapInstance}>
      <div className="flex-1">
        <ReactMapGL.Map
          ref={setMapInstance}
          mapboxAccessToken={MAPBOX_ACCESS_TOKEN}
          style={{ width: "100%", height: "100%" }}
          mapStyle={styleURL}
          initialViewState={viewState}
          onMove={(evt: ViewStateChangeEvent) => setViewState(evt.viewState)}
        >
          {children}
        </ReactMapGL.Map>
      </div>
    </MapContext.Provider>
  );
};

export { StyleURL };

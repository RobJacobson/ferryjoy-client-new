import {
  createContext,
  type PropsWithChildren,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import type { MapRef, ViewStateChangeEvent } from "react-map-gl/mapbox";
import * as ReactMapGL from "react-map-gl/mapbox";

import { SEATTLE_COORDINATES } from "@/lib/utils";

// Set the access token from environment variable
const MAPBOX_ACCESS_TOKEN = process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN || "";

// Types that match RNMapbox/maps interface
export interface MapViewProps extends PropsWithChildren {
  style?: object;
  styleURL?: string;
  scaleBarEnabled?: boolean;
}

export interface CameraProps extends PropsWithChildren {
  zoomLevel?: number;
  centerCoordinate?: [number, number];
  animationDuration?: number;
  heading?: number;
  pitch?: number;
}

// Context to share map ref between MapView and Camera
const MapContext = createContext<MapRef | null>(null);

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

  const setMapRef = (ref: MapRef | null) => {
    setMapInstance(ref);
  };

  return (
    <MapContext.Provider value={mapInstance}>
      <div className="flex-1">
        <ReactMapGL.Map
          ref={setMapRef}
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

export const Camera = ({
  zoomLevel = 4,
  centerCoordinate = SEATTLE_COORDINATES,
  animationDuration = 0,
  heading = 0,
  pitch = 0,
}: CameraProps) => {
  const mapRef = useContext(MapContext);

  useEffect(() => {
    if (mapRef) {
      const timer = setTimeout(() => {
        mapRef.flyTo({
          center: centerCoordinate,
          zoom: zoomLevel,
          pitch: pitch,
          bearing: heading,
          duration: animationDuration,
        });
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [mapRef, centerCoordinate, zoomLevel, animationDuration, heading, pitch]);

  return null; // Camera is handled by the Map component in web
};

// Export StyleURL constant to match native interface
export const StyleURL = {
  Dark: "mapbox://styles/mapbox/dark-v11",
  Light: "mapbox://styles/mapbox/light-v11",
  Streets: "mapbox://styles/mapbox/streets-v12",
  Outdoors: "mapbox://styles/mapbox/outdoors-v12",
  Satellite: "mapbox://styles/mapbox/satellite-v9",
  SatelliteStreet: "mapbox://styles/mapbox/satellite-streets-v12",
} as const;

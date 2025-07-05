import { useEffect, useRef, useState } from "react";
import type { MapRef, ViewStateChangeEvent } from "react-map-gl/mapbox";
import * as ReactMapGL from "react-map-gl/mapbox";

import { SEATTLE_COORDINATES } from "@/lib/utils";

import VesselLayer from "./VesselLayer";

// Set the access token from environment variable
const MAPBOX_ACCESS_TOKEN = process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN || "";

// Custom hook for map animation
const useMapAnimation = (mapRef: React.RefObject<MapRef | null>) => {
  useEffect(() => {
    // Wait for map to load, then animate to desired position
    const timer = setTimeout(() => {
      mapRef.current?.flyTo({
        center: SEATTLE_COORDINATES,
        zoom: 9,
        pitch: 30,
        duration: 10000,
      });
    }, 100); // Wait 100ms for map to fully load

    return () => clearTimeout(timer);
  }, [mapRef]);
};

const MapComponent = ({
  zoomLevel = 4,
  centerCoordinate = SEATTLE_COORDINATES, // Seattle coordinates
  styleURL = "mapbox://styles/mapbox/dark-v11",
}: {
  style?: object;
  zoomLevel?: number;
  centerCoordinate?: [number, number];
  styleURL?: string;
}) => {
  const mapRef = useRef<MapRef>(null);
  const [viewState, setViewState] = useState({
    longitude: centerCoordinate[0],
    latitude: centerCoordinate[1],
    zoom: zoomLevel,
    pitch: 0,
    bearing: 0,
  });

  useMapAnimation(mapRef);

  return (
    <div className="flex-1">
      <ReactMapGL.Map
        ref={mapRef}
        mapboxAccessToken={MAPBOX_ACCESS_TOKEN}
        style={{ width: "100%", height: "100%" }}
        mapStyle={styleURL}
        initialViewState={viewState}
        onMove={(evt: ViewStateChangeEvent) => setViewState(evt.viewState)}
      >
        <VesselLayer />
      </ReactMapGL.Map>
    </div>
  );
};

export default MapComponent;

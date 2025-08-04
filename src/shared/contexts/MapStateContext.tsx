import type { PropsWithChildren } from "react";
import { createContext, useContext, useState } from "react";

import type { CameraBounds } from "@/shared/mapbox/Camera/types";
import type { Coordinate } from "@/shared/mapbox/types";

/**
 * Map state information including position, zoom, pitch, heading, camera position, and dimensions
 */
type MapState = {
  // Basic map state
  latitude: number;
  longitude: number;
  zoom: number;
  pitch: number;
  heading: number;
  // Camera position for programmatic control
  cameraPosition: {
    centerCoordinate: Coordinate;
    zoomLevel: number;
    bounds?: CameraBounds;
  };
  // Map viewport dimensions
  mapDimensions: {
    width: number;
    height: number;
  };
};

/**
 * Context value providing current map state for read-only access
 */
type MapStateContextType = MapState & {
  updateMapState: (newState: Partial<MapState>) => void;
  updateCameraPosition: (
    centerCoordinate: Coordinate,
    zoomLevel: number,
    bounds?: CameraBounds
  ) => void;
  updateMapDimensions: (width: number, height: number) => void;
};

/**
 * React context for sharing map state data across the app.
 * Provides read-only access to current map position, zoom, pitch, heading, camera position, and dimensions.
 */
const MapStateContext = createContext<MapStateContextType | undefined>(
  undefined
);

/**
 * Provider component that manages map state updates from MapView events.
 * Initializes with default Seattle coordinates and standard map settings.
 */
export const MapStateProvider = ({ children }: PropsWithChildren) => {
  const [mapState, setMapState] = useState<MapState>({
    latitude: 47.6062, // Seattle latitude
    longitude: -122.3321, // Seattle longitude
    zoom: 10,
    pitch: 45,
    heading: 0,
    cameraPosition: {
      centerCoordinate: [-122.3321, 47.6062], // Seattle coordinates
      zoomLevel: 10,
    },
    mapDimensions: {
      width: 800,
      height: 600,
    },
  });

  const updateMapState = (newState: Partial<MapState>) => {
    setMapState((prev) => ({ ...prev, ...newState }));
  };

  const updateCameraPosition = (
    centerCoordinate: Coordinate,
    zoomLevel: number,
    bounds?: CameraBounds
  ) => {
    setMapState((prev) => ({
      ...prev,
      cameraPosition: { centerCoordinate, zoomLevel, bounds },
    }));
  };

  const updateMapDimensions = (width: number, height: number) => {
    setMapState((prev) => ({
      ...prev,
      mapDimensions: { width, height },
    }));
  };

  return (
    <MapStateContext
      value={{
        ...mapState,
        updateMapState,
        updateCameraPosition,
        updateMapDimensions,
      }}
    >
      {children}
    </MapStateContext>
  );
};

/**
 * Hook to access current map state for read-only operations.
 * Provides map position, zoom, pitch, heading, camera position, and dimensions data.
 * Must be used within MapStateProvider.
 */
export const useMapState = () => {
  const context = useContext(MapStateContext);
  if (context === undefined) {
    throw new Error("useMapState must be used within MapStateProvider");
  }
  return context;
};

import type { PropsWithChildren } from "react";
import { createContext, useContext, useState } from "react";

/**
 * Map state information including position, zoom, pitch, and heading
 */
type MapState = {
  latitude: number;
  longitude: number;
  zoom: number;
  pitch: number;
  heading: number;
};

/**
 * Context value providing current map state for read-only access
 */
type MapStateContextType = MapState & {
  updateMapState: (newState: Partial<MapState>) => void;
};

/**
 * React context for sharing map state data across the app.
 * Provides read-only access to current map position, zoom, pitch, and heading.
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
    pitch: 0,
    heading: 0,
  });

  const updateMapState = (newState: Partial<MapState>) => {
    setMapState((prev) => ({ ...prev, ...newState }));
  };

  return (
    <MapStateContext.Provider value={{ ...mapState, updateMapState }}>
      {children}
    </MapStateContext.Provider>
  );
};

/**
 * Hook to access current map state for read-only operations.
 * Provides map position, zoom, pitch, and heading data.
 * Must be used within MapStateProvider.
 */
export const useMapState = () => {
  const context = useContext(MapStateContext);
  if (context === undefined) {
    throw new Error("useMapState must be used within MapStateProvider");
  }
  return context;
};

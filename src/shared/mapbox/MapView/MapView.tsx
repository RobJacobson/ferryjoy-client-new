import Mapbox from "@rnmapbox/maps";
import { createContext, useState } from "react";

import { useMapState } from "@/shared/contexts";

import { type MapViewProps, StyleURL } from "./types";

// Context to share map ref between MapView and Camera (compatibility with web)
export const MapContext = createContext<Mapbox.MapView | null>(null);

// Set the access token from environment variable
Mapbox.setAccessToken(process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN || "");

// Native implementation using @rnmapbox/maps
export const MapView = ({
  style,
  styleURL,
  scaleBarEnabled,
  onMapIdle,
  onRegionDidChange,
  onLayout,
  children,
}: MapViewProps & { children?: React.ReactNode }) => {
  const { updateMapState, updateMapDimensions } = useMapState();
  const [mapInstance, setMapInstance] = useState<Mapbox.MapView | null>(null);

  const handleRegionDidChange = (event: any) => {
    const { center, zoom, pitch, heading } = event.properties;
    updateMapState({
      latitude: center[1],
      longitude: center[0],
      zoom,
      pitch,
      heading,
    });
  };

  const handleLayout = (event: any) => {
    const { width, height } = event.nativeEvent.layout;
    updateMapDimensions(width, height);

    // Call the original onLayout if provided
    if (onLayout) {
      onLayout(event);
    }
  };

  return (
    <MapContext.Provider value={mapInstance}>
      <Mapbox.MapView
        ref={setMapInstance}
        style={style}
        styleURL={styleURL}
        scaleBarEnabled={scaleBarEnabled}
        onMapIdle={onMapIdle}
        onRegionDidChange={onRegionDidChange || handleRegionDidChange}
        onLayout={handleLayout}
      >
        {children}
      </Mapbox.MapView>
    </MapContext.Provider>
  );
};

export { StyleURL };
export type { MapViewProps };

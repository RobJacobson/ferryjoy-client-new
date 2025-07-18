import Mapbox from "@rnmapbox/maps";

import { useMapState } from "@/data/contexts/MapStateContext";

import { type MapViewProps, StyleURL } from "./types";

// Set the access token from environment variable
Mapbox.setAccessToken(process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN || "");

// Native implementation using @rnmapbox/maps
export const MapView = ({
  style,
  styleURL,
  scaleBarEnabled,
  onMapIdle,
  onRegionDidChange,
  children,
}: MapViewProps & { children?: React.ReactNode }) => {
  const { updateMapState } = useMapState();

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

  return (
    <Mapbox.MapView
      style={style}
      styleURL={styleURL}
      scaleBarEnabled={scaleBarEnabled}
      onMapIdle={onMapIdle}
      onRegionDidChange={onRegionDidChange || handleRegionDidChange}
    >
      {children}
    </Mapbox.MapView>
  );
};

export { StyleURL };
export type { MapViewProps };

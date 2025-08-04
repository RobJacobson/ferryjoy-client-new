import Mapbox from "@rnmapbox/maps";

import { useMapState } from "@/shared/contexts";

import { type MapViewProps, StyleURL } from "./types";

// Set the access token from environment variable
Mapbox.setAccessToken(process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN || "");

// Native implementation using @rnmapbox/maps
export const MapView = ({
  style,
  styleURL,
  scaleBarEnabled,
  onMapIdle,
  onRegionIsChanging,
  onLayout,
  children,
}: MapViewProps & { children?: React.ReactNode }) => {
  const { updateMapState, updateMapDimensions } = useMapState();

  const handleMapIdle = (event: any) => {
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
    <Mapbox.MapView
      style={style}
      styleURL={styleURL}
      scaleBarEnabled={scaleBarEnabled}
      onMapIdle={onMapIdle || handleMapIdle}
      onRegionIsChanging={onRegionIsChanging || handleMapIdle}
      onLayout={handleLayout}
    >
      {children}
    </Mapbox.MapView>
  );
};

export { StyleURL };
export type { MapViewProps };

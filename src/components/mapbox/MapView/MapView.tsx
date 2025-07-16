import Mapbox from "@rnmapbox/maps";

import { type MapViewProps, StyleURL } from "./types";

// Set the access token from environment variable
Mapbox.setAccessToken(process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN || "");

// Native implementation using @rnmapbox/maps
export const MapView = ({
  style,
  styleURL,
  scaleBarEnabled,
  children,
}: MapViewProps & { children?: React.ReactNode }) => {
  return (
    <Mapbox.MapView
      style={style}
      styleURL={styleURL}
      scaleBarEnabled={scaleBarEnabled}
    >
      {children}
    </Mapbox.MapView>
  );
};

export { StyleURL };
export type { MapViewProps };

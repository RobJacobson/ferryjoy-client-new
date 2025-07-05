import Mapbox from "@rnmapbox/maps";

// Set the access token from environment variable
Mapbox.setAccessToken(process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN || "");

// Re-export the main components from @rnmapbox/maps
export const MapView = Mapbox.MapView;
export const Camera = Mapbox.Camera;
export const ShapeSource = Mapbox.ShapeSource;
export const CircleLayer = Mapbox.CircleLayer;

// Re-export types and constants
export const StyleURL = Mapbox.StyleURL;
export type MapViewProps = React.ComponentProps<typeof Mapbox.MapView>;
export type CameraProps = React.ComponentProps<typeof Mapbox.Camera>;

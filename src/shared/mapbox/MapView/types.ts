// Common types for MapView component that work across platforms

import type { MapboxExpression } from "../types";

/**
 * Type for map idle event properties
 */
type MapIdleEventProperties = {
  center: [number, number];
  zoom: number;
  pitch: number;
  heading: number;
};

/**
 * Type for map idle event
 */
type MapIdleEvent = {
  properties: MapIdleEventProperties;
};

/**
 * Type for layout event native event
 */
type LayoutNativeEvent = {
  layout: { width: number; height: number };
};

/**
 * Type for layout event
 */
type LayoutEvent = {
  nativeEvent: LayoutNativeEvent;
};

// Common MapView props type
export type MapViewProps = {
  style?: object;
  styleURL?: string;
  scaleBarEnabled?: boolean;
  onMapIdle?: (event: MapIdleEvent) => void;
  onRegionIsChanging?: (event: MapIdleEvent) => void;
  onLayout?: (event: LayoutEvent) => void;
  children?: React.ReactNode;
};

// Style URL constants
export const StyleURL = {
  Dark: "mapbox://styles/mapbox/dark-v11",
  Light: "mapbox://styles/mapbox/light-v11",
  Streets: "mapbox://styles/mapbox/streets-v12",
  Outdoors: "mapbox://styles/mapbox/outdoors-v12",
  Satellite: "mapbox://styles/mapbox/satellite-v9",
  SatelliteStreet: "mapbox://styles/mapbox/satellite-streets-v12",
} as const;

// Example usage:
//
// // Basic map view
// <MapView
//   styleURL={StyleURL.Dark}
//   scaleBarEnabled={false}
// >
//   <Camera centerCoordinate={[-122.3321, 47.6062]} zoomLevel={12} />
// </MapView>
//
// // With custom style
// <MapView
//   styleURL="mapbox://styles/mapbox/light-v11"
//   style={{ flex: 1 }}
// >
//   <Camera centerCoordinate={[-122.3321, 47.6062]} zoomLevel={12} />
// </MapView>

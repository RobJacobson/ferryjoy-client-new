// Common types for MapView component that work across platforms

// Mapbox expression types for style properties
export type MapboxExpression =
  | string
  | number
  | boolean
  | null
  | Array<string | number | boolean | null | MapboxExpression>
  | { [key: string]: MapboxExpression };

// Common MapView props interface
export interface MapViewProps {
  style?: object;
  styleURL?: string;
  scaleBarEnabled?: boolean;
  children?: React.ReactNode;
}

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
//   <Camera centerCoordinate={[47.6062, -122.3321]} zoomLevel={12} />
// </MapView>
//
// // With custom style
// <MapView
//   styleURL="mapbox://styles/mapbox/light-v11"
//   style={{ flex: 1 }}
// >
//   <Camera centerCoordinate={[47.6062, -122.3321]} zoomLevel={12} />
// </MapView>

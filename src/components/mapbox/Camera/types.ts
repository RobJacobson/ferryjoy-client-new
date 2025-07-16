// Common types for Camera component that work across platforms

// Mapbox expression types for style properties
export type MapboxExpression =
  | string
  | number
  | boolean
  | null
  | Array<string | number | boolean | null | MapboxExpression>
  | { [key: string]: MapboxExpression };

// Common Camera props interface
export interface CameraProps {
  centerCoordinate?: [number, number];
  zoomLevel?: number;
  heading?: number;
  pitch?: number;
  animationDuration?: number;
  animationMode?: "flyTo" | "easeTo" | "linearTo";
}

// Example usage:
//
// // Simple camera positioning
// <Camera
//   centerCoordinate={[47.6062, -122.3321]}
//   zoomLevel={12}
//   heading={0}
//   pitch={45}
// />
//
// // With animation
// <Camera
//   centerCoordinate={[47.6062, -122.3321]}
//   zoomLevel={15}
//   animationDuration={2000}
//   animationMode="flyTo"
// />

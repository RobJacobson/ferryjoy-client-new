// Common types for Camera component that work across platforms

import type { AnimationMode, Coordinate, MapboxExpression } from "../types";

// Common Camera props type
export type CameraProps = {
  centerCoordinate?: Coordinate;
  zoomLevel?: number;
  heading?: number;
  pitch?: number;
  animationDuration?: number;
  animationMode?: AnimationMode;
};

// Example usage:
//
// // Simple camera positioning
// <Camera
//   centerCoordinate={[-122.3321, 47.6062]}
//   zoomLevel={12}
//   heading={0}
//   pitch={45}
// />
//
// // With animation
// <Camera
//   centerCoordinate={[-122.3321, 47.6062]}
//   zoomLevel={15}
//   animationDuration={2000}
//   animationMode="flyTo"
// />

// Common types for CircleLayer component that work across platforms

import type {
  BaseLayerProps,
  FilterExpression,
  MapboxExpression,
  StyleTransition,
} from "../types";

// Common CircleLayer style properties with Mapbox expression support
export type CircleLayerStyle = {
  circleSortKey?: number | MapboxExpression;
  circleBlur?: number | MapboxExpression;
  circleColor?: string | MapboxExpression;
  circleEmissiveStrength?: number | MapboxExpression;
  circleOpacity?: number | MapboxExpression;
  circlePitchAlignment?: "map" | "viewport" | MapboxExpression;
  circlePitchScale?: "map" | "viewport" | MapboxExpression;
  circleRadius?: number | MapboxExpression;
  circleRadiusTransition?: StyleTransition;
  circleStrokeColor?: string | MapboxExpression;
  circleStrokeOpacity?: number | MapboxExpression;
  circleStrokeWidth?: number | MapboxExpression;
  circleTranslate?: [number, number] | MapboxExpression;
  circleTranslateAnchor?: "map" | "viewport" | MapboxExpression;
};

// Common CircleLayer props type
export type CircleLayerProps = BaseLayerProps & {
  style?: CircleLayerStyle;
};

// Example usage:
//
// // Simple static values
// <CircleLayer
//   id="vessels"
//   style={{
//     circleRadius: 8,
//     circleColor: "#3B82F6",
//     circleOpacity: 0.8,
//   }}
// />
//
// // With Mapbox expressions
// <CircleLayer
//   id="vessels"
//   style={{
//     circleRadius: ["interpolate", ["linear"], ["zoom"], 10, 4, 15, 12],
//     circleColor: ["case", ["==", ["get", "inService"], true], "#10B981", "#EF4444"],
//     circleOpacity: ["interpolate", ["linear"], ["zoom"], 10, 0.5, 15, 1],
//   }}
// />

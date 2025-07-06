// Common types for CircleLayer component that work across platforms

// Mapbox expression types for style properties
export type MapboxExpression =
  | string
  | number
  | boolean
  | null
  | Array<string | number | boolean | null | MapboxExpression>
  | { [key: string]: MapboxExpression };

// Filter expression type for Mapbox GL JS
export type FilterExpression = Array<
  string | number | boolean | null | FilterExpression
>;

// Common CircleLayer style properties with Mapbox expression support
export interface CircleLayerStyle {
  circleSortKey?: number | MapboxExpression;
  circleBlur?: number | MapboxExpression;
  circleColor?: string | MapboxExpression;
  circleEmissiveStrength?: number | MapboxExpression;
  circleOpacity?: number | MapboxExpression;
  circlePitchAlignment?: "map" | "viewport" | MapboxExpression;
  circlePitchScale?: "map" | "viewport" | MapboxExpression;
  circleRadius?: number | MapboxExpression;
  circleRadiusTransition?: {
    duration?: number;
    delay?: number;
  };
  circleStrokeColor?: string | MapboxExpression;
  circleStrokeOpacity?: number | MapboxExpression;
  circleStrokeWidth?: number | MapboxExpression;
  circleTranslate?: [number, number] | MapboxExpression;
  circleTranslateAnchor?: "map" | "viewport" | MapboxExpression;
}

// Common CircleLayer props interface
export interface CircleLayerProps {
  id: string;
  sourceID?: string;
  sourceLayerID?: string;
  // Note: Layer positioning is handled by component order in both platforms
  filter?: FilterExpression;
  minZoomLevel?: number;
  maxZoomLevel?: number;
  style?: CircleLayerStyle;
}

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

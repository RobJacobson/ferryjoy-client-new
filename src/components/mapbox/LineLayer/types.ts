// Common types for LineLayer component that work across platforms

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

// Common LineLayer style properties with Mapbox expression support
export interface LineLayerStyle {
  // Paint properties
  lineBlur?: number | MapboxExpression;
  lineBlurTransition?: {
    duration?: number;
    delay?: number;
  };
  lineColor?: string | MapboxExpression;
  lineColorTransition?: {
    duration?: number;
    delay?: number;
  };
  lineDasharray?: Array<number> | MapboxExpression;
  lineDasharrayTransition?: {
    duration?: number;
    delay?: number;
  };
  lineGapWidth?: number | MapboxExpression;
  lineGapWidthTransition?: {
    duration?: number;
    delay?: number;
  };
  lineGradient?: string | MapboxExpression;
  lineJoin?: "bevel" | "round" | "miter" | MapboxExpression;
  lineCap?: "butt" | "round" | "square" | MapboxExpression;
  lineMiterLimit?: number | MapboxExpression;
  lineOffset?: number | MapboxExpression;
  lineOffsetTransition?: {
    duration?: number;
    delay?: number;
  };
  lineOpacity?: number | MapboxExpression;
  lineOpacityTransition?: {
    duration?: number;
    delay?: number;
  };
  linePattern?: string | MapboxExpression;
  linePatternTransition?: {
    duration?: number;
    delay?: number;
  };
  lineRoundLimit?: number | MapboxExpression;
  lineSortKey?: number | MapboxExpression;
  lineTranslate?: [number, number] | MapboxExpression;
  lineTranslateAnchor?: "map" | "viewport" | MapboxExpression;
  lineTranslateTransition?: {
    duration?: number;
    delay?: number;
  };
  lineWidth?: number | MapboxExpression;
  lineWidthTransition?: {
    duration?: number;
    delay?: number;
  };
}

// Common LineLayer props interface
export interface LineLayerProps {
  id: string;
  sourceID?: string;
  sourceLayerID?: string;
  // Note: Layer positioning is handled by component order in both platforms
  filter?: FilterExpression;
  minZoomLevel?: number;
  maxZoomLevel?: number;
  style?: LineLayerStyle;
}

// Example usage:
//
// // Simple static values
// <LineLayer
//   id="routes"
//   style={{
//     lineWidth: 3,
//     lineColor: "#3B82F6",
//     lineOpacity: 0.8,
//   }}
// />
//
// // With Mapbox expressions
// <LineLayer
//   id="routes"
//   style={{
//     lineWidth: ["interpolate", ["linear"], ["zoom"], 10, 2, 15, 6],
//     lineColor: ["case", ["==", ["get", "active"], true], "#10B981", "#6B7280"],
//     lineOpacity: ["interpolate", ["linear"], ["zoom"], 10, 0.5, 15, 1],
//   }}
// />
//
// // With dashed lines
// <LineLayer
//   id="routes"
//   style={{
//     lineWidth: 2,
//     lineColor: "#EF4444",
//     lineDasharray: [2, 2],
//   }}
// />

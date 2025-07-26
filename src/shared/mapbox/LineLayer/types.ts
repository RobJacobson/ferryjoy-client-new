// Common types for LineLayer component that work across platforms

import type {
  BaseLayerProps,
  FilterExpression,
  LineCap,
  LineJoin,
  MapboxExpression,
  StyleTransition,
} from "../types";

// Common LineLayer style properties with Mapbox expression support
export type LineLayerStyle = {
  // Paint properties
  lineBlur?: number | MapboxExpression;
  lineBlurTransition?: StyleTransition;
  lineColor?: string | MapboxExpression;
  lineColorTransition?: StyleTransition;
  lineDasharray?: Array<number> | MapboxExpression;
  lineDasharrayTransition?: StyleTransition;
  lineGapWidth?: number | MapboxExpression;
  lineGapWidthTransition?: StyleTransition;
  lineGradient?: string | MapboxExpression;
  lineJoin?: LineJoin | MapboxExpression;
  lineCap?: LineCap | MapboxExpression;
  lineMiterLimit?: number | MapboxExpression;
  lineOffset?: number | MapboxExpression;
  lineOffsetTransition?: StyleTransition;
  lineOpacity?: number | MapboxExpression;
  lineOpacityTransition?: StyleTransition;
  linePattern?: string | MapboxExpression;
  linePatternTransition?: StyleTransition;
  lineRoundLimit?: number | MapboxExpression;
  lineSortKey?: number | MapboxExpression;
  lineTranslate?: [number, number] | MapboxExpression;
  lineTranslateAnchor?: "map" | "viewport" | MapboxExpression;
  lineTranslateTransition?: StyleTransition;
  lineWidth?: number | MapboxExpression;
  lineWidthTransition?: StyleTransition;
};

// Common LineLayer props type
export type LineLayerProps = BaseLayerProps & {
  style?: LineLayerStyle;
};

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

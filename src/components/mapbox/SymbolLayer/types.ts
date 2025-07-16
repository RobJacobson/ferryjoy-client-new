// Common types for SymbolLayer component that work across platforms

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

// Common SymbolLayer style properties with Mapbox expression support
export interface SymbolLayerStyle {
  // Icon properties
  iconAllowOverlap?: boolean | MapboxExpression;
  iconAnchor?:
    | "center"
    | "left"
    | "right"
    | "top"
    | "bottom"
    | "top-left"
    | "top-right"
    | "bottom-left"
    | "bottom-right"
    | MapboxExpression;
  iconColor?: string | MapboxExpression;
  iconColorTransition?: {
    duration?: number;
    delay?: number;
  };
  iconEmissiveStrength?: number | MapboxExpression;
  iconEmissiveStrengthTransition?: {
    duration?: number;
    delay?: number;
  };
  iconHaloBlur?: number | MapboxExpression;
  iconHaloBlurTransition?: {
    duration?: number;
    delay?: number;
  };
  iconHaloColor?: string | MapboxExpression;
  iconHaloColorTransition?: {
    duration?: number;
    delay?: number;
  };
  iconHaloWidth?: number | MapboxExpression;
  iconHaloWidthTransition?: {
    duration?: number;
    delay?: number;
  };
  iconIgnorePlacement?: boolean | MapboxExpression;
  iconImage?: string | MapboxExpression;
  iconImageTransition?: {
    duration?: number;
    delay?: number;
  };
  iconKeepUpright?: boolean | MapboxExpression;
  iconOffset?: [number, number] | MapboxExpression;
  iconOffsetTransition?: {
    duration?: number;
    delay?: number;
  };
  iconOpacity?: number | MapboxExpression;
  iconOpacityTransition?: {
    duration?: number;
    delay?: number;
  };
  iconOptional?: boolean | MapboxExpression;
  iconOverlap?: "never" | "always" | "cooperative" | MapboxExpression;
  iconPadding?: number | MapboxExpression;
  iconPitchAlignment?: "map" | "viewport" | "auto" | MapboxExpression;
  iconRotate?: number | MapboxExpression;
  iconRotateTransition?: {
    duration?: number;
    delay?: number;
  };
  iconRotationAlignment?: "map" | "viewport" | "auto" | MapboxExpression;
  iconSize?: number | MapboxExpression;
  iconSizeTransition?: {
    duration?: number;
    delay?: number;
  };
  iconTextFit?: "none" | "width" | "height" | "both" | MapboxExpression;
  iconTextFitPadding?: [number, number, number, number] | MapboxExpression;
  iconTranslate?: [number, number] | MapboxExpression;
  iconTranslateAnchor?: "map" | "viewport" | MapboxExpression;
  iconTranslateTransition?: {
    duration?: number;
    delay?: number;
  };

  // Text properties
  textAllowOverlap?: boolean | MapboxExpression;
  textAnchor?:
    | "center"
    | "left"
    | "right"
    | "top"
    | "bottom"
    | "top-left"
    | "top-right"
    | "bottom-left"
    | "bottom-right"
    | MapboxExpression;
  textColor?: string | MapboxExpression;
  textColorTransition?: {
    duration?: number;
    delay?: number;
  };
  textEmissiveStrength?: number | MapboxExpression;
  textEmissiveStrengthTransition?: {
    duration?: number;
    delay?: number;
  };
  textField?: string | MapboxExpression;
  textFont?: Array<string> | MapboxExpression;
  textHaloBlur?: number | MapboxExpression;
  textHaloBlurTransition?: {
    duration?: number;
    delay?: number;
  };
  textHaloColor?: string | MapboxExpression;
  textHaloColorTransition?: {
    duration?: number;
    delay?: number;
  };
  textHaloWidth?: number | MapboxExpression;
  textHaloWidthTransition?: {
    duration?: number;
    delay?: number;
  };
  textIgnorePlacement?: boolean | MapboxExpression;
  textJustify?: "auto" | "left" | "center" | "right" | MapboxExpression;
  textKeepUpright?: boolean | MapboxExpression;
  textLetterSpacing?: number | MapboxExpression;
  textLetterSpacingTransition?: {
    duration?: number;
    delay?: number;
  };
  textLineHeight?: number | MapboxExpression;
  textMaxAngle?: number | MapboxExpression;
  textMaxWidth?: number | MapboxExpression;
  textOffset?: [number, number] | MapboxExpression;
  textOffsetTransition?: {
    duration?: number;
    delay?: number;
  };
  textOpacity?: number | MapboxExpression;
  textOpacityTransition?: {
    duration?: number;
    delay?: number;
  };
  textOptional?: boolean | MapboxExpression;
  textOverlap?: "never" | "always" | "cooperative" | MapboxExpression;
  textPadding?: number | MapboxExpression;
  textPitchAlignment?: "map" | "viewport" | "auto" | MapboxExpression;
  textRadialOffset?: number | MapboxExpression;
  textRadialOffsetTransition?: {
    duration?: number;
    delay?: number;
  };
  textRotate?: number | MapboxExpression;
  textRotateTransition?: {
    duration?: number;
    delay?: number;
  };
  textRotationAlignment?: "map" | "viewport" | "auto" | MapboxExpression;
  textSize?: number | MapboxExpression;
  textSizeTransition?: {
    duration?: number;
    delay?: number;
  };
  textTransform?: "none" | "uppercase" | "lowercase" | MapboxExpression;
  textTranslate?: [number, number] | MapboxExpression;
  textTranslateAnchor?: "map" | "viewport" | MapboxExpression;
  textTranslateTransition?: {
    duration?: number;
    delay?: number;
  };
  textVariableAnchor?:
    | Array<
        | "center"
        | "left"
        | "right"
        | "top"
        | "bottom"
        | "top-left"
        | "top-right"
        | "bottom-left"
        | "bottom-right"
      >
    | MapboxExpression;
  textWritingMode?: Array<"horizontal" | "vertical"> | MapboxExpression;

  // Symbol properties
  symbolAvoidEdges?: boolean | MapboxExpression;
  symbolPlacement?: "point" | "line" | "line-center" | MapboxExpression;
  symbolSortKey?: number | MapboxExpression;
  symbolSpacing?: number | MapboxExpression;
  symbolTextSpacing?: number | MapboxExpression;
  symbolZOrder?: "auto" | "source" | "viewport-y" | MapboxExpression;
}

// Common SymbolLayer props interface
export interface SymbolLayerProps {
  id: string;
  sourceID?: string;
  sourceLayerID?: string;
  // Note: Layer positioning is handled by component order in both platforms
  filter?: FilterExpression;
  minZoomLevel?: number;
  maxZoomLevel?: number;
  style?: SymbolLayerStyle;
}

// Example usage:
//
// // Simple text label
// <SymbolLayer
//   id="vessel-labels"
//   style={{
//     textField: ["get", "name"],
//     textSize: 12,
//     textColor: "#374151",
//     textHaloColor: "white",
//     textHaloWidth: 1,
//   }}
// />
//
// // Icon with text
// <SymbolLayer
//   id="terminals"
//   style={{
//     iconImage: "ferry-terminal",
//     iconSize: ["interpolate", ["linear"], ["zoom"], 10, 0.5, 15, 1],
//     textField: ["get", "terminalName"],
//     textSize: 10,
//     textColor: "#1F2937",
//     textOffset: [0, 1.5],
//   }}
// />
//
// // Conditional styling
// <SymbolLayer
//   id="vessels"
//   style={{
//     iconImage: ["case", ["get", "inService"], "ferry-active", "ferry-inactive"],
//     iconSize: ["interpolate", ["linear"], ["zoom"], 8, 0.3, 15, 1],
//     textField: ["get", "vesselName"],
//     textColor: ["case", ["get", "inService"], "#10B981", "#6B7280"],
//     textSize: ["interpolate", ["linear"], ["zoom"], 10, 8, 15, 12],
//   }}
// />

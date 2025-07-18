// Common types for SymbolLayer component that work across platforms

import type {
  BaseLayerProps,
  FilterExpression,
  IconAnchor,
  IconTextFit,
  MapboxExpression,
  Overlap,
  PitchAlignment,
  RotationAlignment,
  StyleTransition,
  SymbolPlacement,
  SymbolZOrder,
  TextAnchor,
  TextJustify,
  TextTransform,
  TextWritingMode,
} from "../types";

// Common SymbolLayer style properties with Mapbox expression support
export type SymbolLayerStyle = {
  // Icon properties
  iconAllowOverlap?: boolean | MapboxExpression;
  iconAnchor?: IconAnchor | MapboxExpression;
  iconColor?: string | MapboxExpression;
  iconColorTransition?: StyleTransition;
  iconEmissiveStrength?: number | MapboxExpression;
  iconEmissiveStrengthTransition?: StyleTransition;
  iconHaloBlur?: number | MapboxExpression;
  iconHaloBlurTransition?: StyleTransition;
  iconHaloColor?: string | MapboxExpression;
  iconHaloColorTransition?: StyleTransition;
  iconHaloWidth?: number | MapboxExpression;
  iconHaloWidthTransition?: StyleTransition;
  iconIgnorePlacement?: boolean | MapboxExpression;
  iconImage?: string | MapboxExpression;
  iconImageTransition?: StyleTransition;
  iconKeepUpright?: boolean | MapboxExpression;
  iconOffset?: [number, number] | MapboxExpression;
  iconOffsetTransition?: StyleTransition;
  iconOpacity?: number | MapboxExpression;
  iconOpacityTransition?: StyleTransition;
  iconOptional?: boolean | MapboxExpression;
  iconOverlap?: Overlap | MapboxExpression;
  iconPadding?: number | MapboxExpression;
  iconPitchAlignment?: PitchAlignment | MapboxExpression;
  iconRotate?: number | MapboxExpression;
  iconRotateTransition?: StyleTransition;
  iconRotationAlignment?: RotationAlignment | MapboxExpression;
  iconSize?: number | MapboxExpression;
  iconSizeTransition?: StyleTransition;
  iconTextFit?: IconTextFit | MapboxExpression;
  iconTextFitPadding?: [number, number, number, number] | MapboxExpression;
  iconTranslate?: [number, number] | MapboxExpression;
  iconTranslateAnchor?: "map" | "viewport" | MapboxExpression;
  iconTranslateTransition?: StyleTransition;

  // Text properties
  textAllowOverlap?: boolean | MapboxExpression;
  textAnchor?: TextAnchor | MapboxExpression;
  textColor?: string | MapboxExpression;
  textColorTransition?: StyleTransition;
  textEmissiveStrength?: number | MapboxExpression;
  textEmissiveStrengthTransition?: StyleTransition;
  textField?: string | MapboxExpression;
  textFont?: Array<string> | MapboxExpression;
  textHaloBlur?: number | MapboxExpression;
  textHaloBlurTransition?: StyleTransition;
  textHaloColor?: string | MapboxExpression;
  textHaloColorTransition?: StyleTransition;
  textHaloWidth?: number | MapboxExpression;
  textHaloWidthTransition?: StyleTransition;
  textIgnorePlacement?: boolean | MapboxExpression;
  textJustify?: TextJustify | MapboxExpression;
  textKeepUpright?: boolean | MapboxExpression;
  textLetterSpacing?: number | MapboxExpression;
  textLetterSpacingTransition?: StyleTransition;
  textLineHeight?: number | MapboxExpression;
  textMaxAngle?: number | MapboxExpression;
  textMaxWidth?: number | MapboxExpression;
  textOffset?: [number, number] | MapboxExpression;
  textOffsetTransition?: StyleTransition;
  textOpacity?: number | MapboxExpression;
  textOpacityTransition?: StyleTransition;
  textOptional?: boolean | MapboxExpression;
  textOverlap?: Overlap | MapboxExpression;
  textPadding?: number | MapboxExpression;
  textPitchAlignment?: PitchAlignment | MapboxExpression;
  textRadialOffset?: number | MapboxExpression;
  textRadialOffsetTransition?: StyleTransition;
  textRotate?: number | MapboxExpression;
  textRotateTransition?: StyleTransition;
  textRotationAlignment?: RotationAlignment | MapboxExpression;
  textSize?: number | MapboxExpression;
  textSizeTransition?: StyleTransition;
  textTransform?: TextTransform | MapboxExpression;
  textTranslate?: [number, number] | MapboxExpression;
  textTranslateAnchor?: "map" | "viewport" | MapboxExpression;
  textTranslateTransition?: StyleTransition;
  textVariableAnchor?: Array<IconAnchor> | MapboxExpression;
  textWritingMode?: Array<TextWritingMode> | MapboxExpression;

  // Symbol properties
  symbolAvoidEdges?: boolean | MapboxExpression;
  symbolPlacement?: SymbolPlacement | MapboxExpression;
  symbolSortKey?: number | MapboxExpression;
  symbolSpacing?: number | MapboxExpression;
  symbolTextSpacing?: number | MapboxExpression;
  symbolZOrder?: SymbolZOrder | MapboxExpression;
};

// Common SymbolLayer props type
export type SymbolLayerProps = BaseLayerProps & {
  style?: SymbolLayerStyle;
};

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
//     iconImage: ["case", ["==", ["get", "inService"], true], "vessel-active", "vessel-inactive"],
//     iconSize: ["interpolate", ["linear"], ["zoom"], 10, 0.5, 15, 1.5],
//     textField: ["get", "vesselName"],
//     textSize: ["interpolate", ["linear"], ["zoom"], 10, 8, 15, 12],
//     textColor: ["case", ["==", ["get", "inService"], true], "#10B981", "#6B7280"],
//   }}
// />

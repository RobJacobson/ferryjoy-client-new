/** biome-ignore-all lint/suspicious/noExplicitAny: Some props are not typed */
import { Layer } from "react-map-gl/mapbox";

import { filterUndefined } from "@/lib";

import type { SymbolLayerProps } from "./types";

// Web implementation using react-map-gl/mapbox
export const SymbolLayer = ({
  id,
  sourceID,
  sourceLayerID,
  filter,
  minZoomLevel,
  maxZoomLevel,
  style,
}: SymbolLayerProps) => {
  // Validate required props
  if (!id || id.trim() === "" || !sourceID || sourceID.trim() === "") {
    console.error("SymbolLayer: id and sourcreID are required");
    return null;
  }

  // Build the paint properties from style using destructuring with aliases
  const paint: Record<string, any> = {
    // Icon paint properties (only color, opacity, halo, emissive, translate)
    "icon-color": style?.iconColor,
    "icon-color-transition": style?.iconColorTransition,
    "icon-emissive-strength": style?.iconEmissiveStrength,
    "icon-emissive-strength-transition": style?.iconEmissiveStrengthTransition,
    "icon-halo-blur": style?.iconHaloBlur,
    "icon-halo-blur-transition": style?.iconHaloBlurTransition,
    "icon-halo-color": style?.iconHaloColor,
    "icon-halo-color-transition": style?.iconHaloColorTransition,
    "icon-halo-width": style?.iconHaloWidth,
    "icon-halo-width-transition": style?.iconHaloWidthTransition,
    "icon-image-transition": style?.iconImageTransition,
    "icon-opacity": style?.iconOpacity,
    "icon-opacity-transition": style?.iconOpacityTransition,
    "icon-translate": style?.iconTranslate,
    "icon-translate-transition": style?.iconTranslateTransition,

    // Text paint properties (only color, opacity, halo, emissive, translate)
    "text-color": style?.textColor,
    "text-color-transition": style?.textColorTransition,
    "text-emissive-strength": style?.textEmissiveStrength,
    "text-emissive-strength-transition": style?.textEmissiveStrengthTransition,
    "text-halo-blur": style?.textHaloBlur,
    "text-halo-blur-transition": style?.textHaloBlurTransition,
    "text-halo-color": style?.textHaloColor,
    "text-halo-color-transition": style?.textHaloColorTransition,
    "text-halo-width": style?.textHaloWidth,
    "text-halo-width-transition": style?.textHaloWidthTransition,
    "text-letter-spacing-transition": style?.textLetterSpacingTransition,
    "text-opacity": style?.textOpacity,
    "text-opacity-transition": style?.textOpacityTransition,

    "text-translate": style?.textTranslate,
    "text-translate-transition": style?.textTranslateTransition,
  };

  // Build the layout properties using destructuring with aliases
  const layout: Record<string, any> = {
    "source-layer": sourceLayerID,
    filter,
    minzoom: minZoomLevel,
    maxzoom: maxZoomLevel,

    // Icon layout properties
    "icon-allow-overlap": style?.iconAllowOverlap,
    "icon-anchor": style?.iconAnchor,
    "icon-ignore-placement": style?.iconIgnorePlacement,
    "icon-image": style?.iconImage,
    "icon-keep-upright": style?.iconKeepUpright,
    "icon-offset": style?.iconOffset,
    "icon-offset-transition": style?.iconOffsetTransition,
    "icon-optional": style?.iconOptional,
    "icon-overlap": style?.iconOverlap,
    "icon-padding": style?.iconPadding,
    "icon-pitch-alignment": style?.iconPitchAlignment,
    "icon-rotate": style?.iconRotate,
    "icon-rotate-transition": style?.iconRotateTransition,
    "icon-rotation-alignment": style?.iconRotationAlignment,
    "icon-size": style?.iconSize,
    "icon-size-transition": style?.iconSizeTransition,
    "icon-text-fit": style?.iconTextFit,
    "icon-text-fit-padding": style?.iconTextFitPadding,
    "icon-translate-anchor": style?.iconTranslateAnchor,

    // Text layout properties
    "text-allow-overlap": style?.textAllowOverlap,
    "text-anchor": style?.textAnchor,
    "text-field": style?.textField,
    "text-font": style?.textFont,
    "text-ignore-placement": style?.textIgnorePlacement,
    "text-justify": style?.textJustify,
    "text-keep-upright": style?.textKeepUpright,
    "text-letter-spacing": style?.textLetterSpacing,
    "text-line-height": style?.textLineHeight,
    "text-max-angle": style?.textMaxAngle,
    "text-max-width": style?.textMaxWidth,
    "text-optional": style?.textOptional,
    "text-overlap": style?.textOverlap,
    "text-padding": style?.textPadding,
    "text-pitch-alignment": style?.textPitchAlignment,
    "text-radial-offset": style?.textRadialOffset,
    "text-radial-offset-transition": style?.textRadialOffsetTransition,

    "text-rotation-alignment": style?.textRotationAlignment,
    "text-rotate": style?.textRotate,
    "text-rotate-transition": style?.textRotateTransition,
    "text-offset": style?.textOffset,
    "text-offset-transition": style?.textOffsetTransition,
    "text-size": style?.textSize,
    "text-size-transition": style?.textSizeTransition,
    "text-transform": style?.textTransform,
    "text-translate-anchor": style?.textTranslateAnchor,
    "text-variable-anchor": style?.textVariableAnchor,
    "text-writing-mode": style?.textWritingMode,

    // Symbol layout properties
    "symbol-avoid-edges": style?.symbolAvoidEdges,
    "symbol-placement": style?.symbolPlacement,
    "symbol-sort-key": style?.symbolSortKey,
    "symbol-spacing": style?.symbolSpacing,
    "symbol-text-spacing": style?.symbolTextSpacing,
    "symbol-z-order": style?.symbolZOrder,
  };

  return (
    <Layer
      id={id}
      type="symbol"
      source={sourceID}
      paint={filterUndefined(paint)}
      layout={filterUndefined(layout)}
    />
  );
};

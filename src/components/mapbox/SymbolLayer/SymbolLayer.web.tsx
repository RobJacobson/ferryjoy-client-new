/** biome-ignore-all lint/suspicious/noExplicitAny: Some props are not typed */
import { Layer } from "react-map-gl/mapbox";

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
    console.error("SymbolLayer: id and sourceID are required");
    return null;
  }

  // Build the paint properties from style
  const paint: Record<string, any> = {};

  // Icon paint properties
  if (style?.iconAllowOverlap !== undefined)
    paint["icon-allow-overlap"] = style.iconAllowOverlap;
  if (style?.iconAnchor !== undefined) paint["icon-anchor"] = style.iconAnchor;
  if (style?.iconColor !== undefined) paint["icon-color"] = style.iconColor;
  if (style?.iconColorTransition !== undefined) {
    paint["icon-color-transition"] = style.iconColorTransition;
  }
  if (style?.iconEmissiveStrength !== undefined)
    paint["icon-emissive-strength"] = style.iconEmissiveStrength;
  if (style?.iconEmissiveStrengthTransition !== undefined) {
    paint["icon-emissive-strength-transition"] =
      style.iconEmissiveStrengthTransition;
  }
  if (style?.iconHaloBlur !== undefined)
    paint["icon-halo-blur"] = style.iconHaloBlur;
  if (style?.iconHaloBlurTransition !== undefined) {
    paint["icon-halo-blur-transition"] = style.iconHaloBlurTransition;
  }
  if (style?.iconHaloColor !== undefined)
    paint["icon-halo-color"] = style.iconHaloColor;
  if (style?.iconHaloColorTransition !== undefined) {
    paint["icon-halo-color-transition"] = style.iconHaloColorTransition;
  }
  if (style?.iconHaloWidth !== undefined)
    paint["icon-halo-width"] = style.iconHaloWidth;
  if (style?.iconHaloWidthTransition !== undefined) {
    paint["icon-halo-width-transition"] = style.iconHaloWidthTransition;
  }
  if (style?.iconIgnorePlacement !== undefined)
    paint["icon-ignore-placement"] = style.iconIgnorePlacement;
  if (style?.iconImage !== undefined) paint["icon-image"] = style.iconImage;
  if (style?.iconImageTransition !== undefined) {
    paint["icon-image-transition"] = style.iconImageTransition;
  }
  if (style?.iconKeepUpright !== undefined)
    paint["icon-keep-upright"] = style.iconKeepUpright;
  if (style?.iconOffset !== undefined) paint["icon-offset"] = style.iconOffset;
  if (style?.iconOffsetTransition !== undefined) {
    paint["icon-offset-transition"] = style.iconOffsetTransition;
  }
  if (style?.iconOpacity !== undefined)
    paint["icon-opacity"] = style.iconOpacity;
  if (style?.iconOpacityTransition !== undefined) {
    paint["icon-opacity-transition"] = style.iconOpacityTransition;
  }
  if (style?.iconOptional !== undefined)
    paint["icon-optional"] = style.iconOptional;
  if (style?.iconOverlap !== undefined)
    paint["icon-overlap"] = style.iconOverlap;
  if (style?.iconPadding !== undefined)
    paint["icon-padding"] = style.iconPadding;
  if (style?.iconPitchAlignment !== undefined)
    paint["icon-pitch-alignment"] = style.iconPitchAlignment;
  if (style?.iconRotate !== undefined) paint["icon-rotate"] = style.iconRotate;
  if (style?.iconRotateTransition !== undefined) {
    paint["icon-rotate-transition"] = style.iconRotateTransition;
  }
  if (style?.iconRotationAlignment !== undefined)
    paint["icon-rotation-alignment"] = style.iconRotationAlignment;
  if (style?.iconSize !== undefined) paint["icon-size"] = style.iconSize;
  if (style?.iconSizeTransition !== undefined) {
    paint["icon-size-transition"] = style.iconSizeTransition;
  }
  if (style?.iconTextFit !== undefined)
    paint["icon-text-fit"] = style.iconTextFit;
  if (style?.iconTextFitPadding !== undefined)
    paint["icon-text-fit-padding"] = style.iconTextFitPadding;
  if (style?.iconTranslate !== undefined)
    paint["icon-translate"] = style.iconTranslate;
  if (style?.iconTranslateAnchor !== undefined)
    paint["icon-translate-anchor"] = style.iconTranslateAnchor;
  if (style?.iconTranslateTransition !== undefined) {
    paint["icon-translate-transition"] = style.iconTranslateTransition;
  }

  // Text paint properties
  if (style?.textAllowOverlap !== undefined)
    paint["text-allow-overlap"] = style.textAllowOverlap;
  if (style?.textAnchor !== undefined) paint["text-anchor"] = style.textAnchor;
  if (style?.textColor !== undefined) paint["text-color"] = style.textColor;
  if (style?.textColorTransition !== undefined) {
    paint["text-color-transition"] = style.textColorTransition;
  }
  if (style?.textEmissiveStrength !== undefined)
    paint["text-emissive-strength"] = style.textEmissiveStrength;
  if (style?.textEmissiveStrengthTransition !== undefined) {
    paint["text-emissive-strength-transition"] =
      style.textEmissiveStrengthTransition;
  }
  if (style?.textField !== undefined) paint["text-field"] = style.textField;
  if (style?.textFont !== undefined) paint["text-font"] = style.textFont;
  if (style?.textHaloBlur !== undefined)
    paint["text-halo-blur"] = style.textHaloBlur;
  if (style?.textHaloBlurTransition !== undefined) {
    paint["text-halo-blur-transition"] = style.textHaloBlurTransition;
  }
  if (style?.textHaloColor !== undefined)
    paint["text-halo-color"] = style.textHaloColor;
  if (style?.textHaloColorTransition !== undefined) {
    paint["text-halo-color-transition"] = style.textHaloColorTransition;
  }
  if (style?.textHaloWidth !== undefined)
    paint["text-halo-width"] = style.textHaloWidth;
  if (style?.textHaloWidthTransition !== undefined) {
    paint["text-halo-width-transition"] = style.textHaloWidthTransition;
  }
  if (style?.textIgnorePlacement !== undefined)
    paint["text-ignore-placement"] = style.textIgnorePlacement;
  if (style?.textJustify !== undefined)
    paint["text-justify"] = style.textJustify;
  if (style?.textKeepUpright !== undefined)
    paint["text-keep-upright"] = style.textKeepUpright;
  if (style?.textLetterSpacing !== undefined)
    paint["text-letter-spacing"] = style.textLetterSpacing;
  if (style?.textLetterSpacingTransition !== undefined) {
    paint["text-letter-spacing-transition"] = style.textLetterSpacingTransition;
  }
  if (style?.textLineHeight !== undefined)
    paint["text-line-height"] = style.textLineHeight;
  if (style?.textMaxAngle !== undefined)
    paint["text-max-angle"] = style.textMaxAngle;
  if (style?.textMaxWidth !== undefined)
    paint["text-max-width"] = style.textMaxWidth;
  if (style?.textOffset !== undefined) paint["text-offset"] = style.textOffset;
  if (style?.textOffsetTransition !== undefined) {
    paint["text-offset-transition"] = style.textOffsetTransition;
  }
  if (style?.textOpacity !== undefined)
    paint["text-opacity"] = style.textOpacity;
  if (style?.textOpacityTransition !== undefined) {
    paint["text-opacity-transition"] = style.textOpacityTransition;
  }
  if (style?.textOptional !== undefined)
    paint["text-optional"] = style.textOptional;
  if (style?.textOverlap !== undefined)
    paint["text-overlap"] = style.textOverlap;
  if (style?.textPadding !== undefined)
    paint["text-padding"] = style.textPadding;
  if (style?.textPitchAlignment !== undefined)
    paint["text-pitch-alignment"] = style.textPitchAlignment;
  if (style?.textRadialOffset !== undefined)
    paint["text-radial-offset"] = style.textRadialOffset;
  if (style?.textRadialOffsetTransition !== undefined) {
    paint["text-radial-offset-transition"] = style.textRadialOffsetTransition;
  }
  if (style?.textRotate !== undefined) paint["text-rotate"] = style.textRotate;
  if (style?.textRotateTransition !== undefined) {
    paint["text-rotate-transition"] = style.textRotateTransition;
  }
  if (style?.textRotationAlignment !== undefined)
    paint["text-rotation-alignment"] = style.textRotationAlignment;
  if (style?.textSize !== undefined) paint["text-size"] = style.textSize;
  if (style?.textSizeTransition !== undefined) {
    paint["text-size-transition"] = style.textSizeTransition;
  }
  if (style?.textTransform !== undefined)
    paint["text-transform"] = style.textTransform;
  if (style?.textTranslate !== undefined)
    paint["text-translate"] = style.textTranslate;
  if (style?.textTranslateAnchor !== undefined)
    paint["text-translate-anchor"] = style.textTranslateAnchor;
  if (style?.textTranslateTransition !== undefined) {
    paint["text-translate-transition"] = style.textTranslateTransition;
  }
  if (style?.textVariableAnchor !== undefined)
    paint["text-variable-anchor"] = style.textVariableAnchor;
  if (style?.textWritingMode !== undefined)
    paint["text-writing-mode"] = style.textWritingMode;

  // Symbol paint properties
  if (style?.symbolAvoidEdges !== undefined)
    paint["symbol-avoid-edges"] = style.symbolAvoidEdges;
  if (style?.symbolPlacement !== undefined)
    paint["symbol-placement"] = style.symbolPlacement;
  if (style?.symbolSortKey !== undefined)
    paint["symbol-sort-key"] = style.symbolSortKey;
  if (style?.symbolSpacing !== undefined)
    paint["symbol-spacing"] = style.symbolSpacing;
  if (style?.symbolTextSpacing !== undefined)
    paint["symbol-text-spacing"] = style.symbolTextSpacing;
  if (style?.symbolZOrder !== undefined)
    paint["symbol-z-order"] = style.symbolZOrder;

  // Build the layout properties
  const layout: Record<string, any> = {};

  if (sourceLayerID !== undefined) layout["source-layer"] = sourceLayerID;
  if (filter !== undefined) layout.filter = filter;
  if (minZoomLevel !== undefined) layout.minzoom = minZoomLevel;
  if (maxZoomLevel !== undefined) layout.maxzoom = maxZoomLevel;

  return (
    <Layer
      id={id}
      type="symbol"
      source={sourceID}
      paint={paint}
      layout={layout}
    />
  );
};

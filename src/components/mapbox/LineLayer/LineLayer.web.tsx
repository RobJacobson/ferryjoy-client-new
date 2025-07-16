/** biome-ignore-all lint/suspicious/noExplicitAny: Some props are not typed */
import { Layer } from "react-map-gl/mapbox";

import type { LineLayerProps } from "./types";

// Web implementation using react-map-gl/mapbox
export const LineLayer = ({
  id,
  sourceID,
  sourceLayerID,
  filter,
  minZoomLevel,
  maxZoomLevel,
  style,
}: LineLayerProps) => {
  // Validate required props
  if (!id || id.trim() === "" || !sourceID || sourceID.trim() === "") {
    console.error("LineLayer: id and sourceID are required");
    return null;
  }

  console.log(`LineLayer ${id}: Rendering with sourceID ${sourceID}`, {
    style,
    filter,
  });

  // Build the paint properties from style
  const paint: Record<string, any> = {};

  if (style?.lineBlur !== undefined) paint["line-blur"] = style.lineBlur;
  if (style?.lineBlurTransition !== undefined) {
    paint["line-blur-transition"] = style.lineBlurTransition;
  }
  if (style?.lineColor !== undefined) paint["line-color"] = style.lineColor;
  if (style?.lineColorTransition !== undefined) {
    paint["line-color-transition"] = style.lineColorTransition;
  }
  if (style?.lineDasharray !== undefined)
    paint["line-dasharray"] = style.lineDasharray;
  if (style?.lineDasharrayTransition !== undefined) {
    paint["line-dasharray-transition"] = style.lineDasharrayTransition;
  }
  if (style?.lineGapWidth !== undefined)
    paint["line-gap-width"] = style.lineGapWidth;
  if (style?.lineGapWidthTransition !== undefined) {
    paint["line-gap-width-transition"] = style.lineGapWidthTransition;
  }
  if (style?.lineGradient !== undefined)
    paint["line-gradient"] = style.lineGradient;
  if (style?.lineJoin !== undefined) paint["line-join"] = style.lineJoin;
  if (style?.lineCap !== undefined) paint["line-cap"] = style.lineCap;
  if (style?.lineMiterLimit !== undefined)
    paint["line-miter-limit"] = style.lineMiterLimit;
  if (style?.lineOffset !== undefined) paint["line-offset"] = style.lineOffset;
  if (style?.lineOffsetTransition !== undefined) {
    paint["line-offset-transition"] = style.lineOffsetTransition;
  }
  if (style?.lineOpacity !== undefined)
    paint["line-opacity"] = style.lineOpacity;
  if (style?.lineOpacityTransition !== undefined) {
    paint["line-opacity-transition"] = style.lineOpacityTransition;
  }
  if (style?.linePattern !== undefined)
    paint["line-pattern"] = style.linePattern;
  if (style?.linePatternTransition !== undefined) {
    paint["line-pattern-transition"] = style.linePatternTransition;
  }
  if (style?.lineRoundLimit !== undefined)
    paint["line-round-limit"] = style.lineRoundLimit;
  if (style?.lineSortKey !== undefined)
    paint["line-sort-key"] = style.lineSortKey;
  if (style?.lineTranslate !== undefined)
    paint["line-translate"] = style.lineTranslate;
  if (style?.lineTranslateAnchor !== undefined) {
    paint["line-translate-anchor"] = style.lineTranslateAnchor;
  }
  if (style?.lineTranslateTransition !== undefined) {
    paint["line-translate-transition"] = style.lineTranslateTransition;
  }
  if (style?.lineWidth !== undefined) paint["line-width"] = style.lineWidth;
  if (style?.lineWidthTransition !== undefined) {
    paint["line-width-transition"] = style.lineWidthTransition;
  }

  // Build the layout properties
  const layout: Record<string, any> = {};

  if (sourceLayerID !== undefined) layout["source-layer"] = sourceLayerID;
  if (filter !== undefined) layout.filter = filter;
  if (minZoomLevel !== undefined) layout.minzoom = minZoomLevel;
  if (maxZoomLevel !== undefined) layout.maxzoom = maxZoomLevel;

  return (
    <Layer
      id={id}
      type="line"
      source={sourceID}
      paint={paint}
      layout={layout}
    />
  );
};

/** biome-ignore-all lint/suspicious/noExplicitAny: Some props are not typed */
import { Layer } from "react-map-gl/mapbox";

import { filterUndefined } from "@/shared/lib/utils/mapbox";

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

  const paint: Record<string, any> = {
    "line-blur": style?.lineBlur,
    "line-blur-transition": style?.lineBlurTransition,
    "line-color": style?.lineColor,
    "line-color-transition": style?.lineColorTransition,
    "line-dasharray": style?.lineDasharray,
    "line-dasharray-transition": style?.lineDasharrayTransition,
    "line-gap-width": style?.lineGapWidth,
    "line-gap-width-transition": style?.lineGapWidthTransition,
    "line-gradient": style?.lineGradient,
    "line-offset": style?.lineOffset,
    "line-offset-transition": style?.lineOffsetTransition,
    "line-opacity": style?.lineOpacity,
    "line-opacity-transition": style?.lineOpacityTransition,
    "line-pattern": style?.linePattern,
    "line-pattern-transition": style?.linePatternTransition,
    "line-translate": style?.lineTranslate,
    "line-translate-anchor": style?.lineTranslateAnchor,
    "line-translate-transition": style?.lineTranslateTransition,
    "line-width": style?.lineWidth,
    "line-width-transition": style?.lineWidthTransition,
  };

  // Build the layout properties - these control line geometry structure
  const layout: Record<string, any> = {
    "line-cap": style?.lineCap,
    "line-join": style?.lineJoin,
    "line-miter-limit": style?.lineMiterLimit,
    "line-round-limit": style?.lineRoundLimit,
    "line-sort-key": style?.lineSortKey,
    "source-layer": sourceLayerID,
    filter,
    minzoom: minZoomLevel,
    maxzoom: maxZoomLevel,
  };

  const finalPaint = filterUndefined(paint);
  const finalLayout = filterUndefined(layout);

  return (
    <Layer
      id={id}
      type="line"
      source={sourceID}
      paint={finalPaint}
      layout={finalLayout}
    />
  );
};

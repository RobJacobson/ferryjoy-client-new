/** biome-ignore-all lint/suspicious/noExplicitAny: Some props are not typed */
import { Layer } from "react-map-gl/mapbox";

import { filterUndefined } from "@/lib";

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
    "line-join": style?.lineJoin,
    "line-cap": style?.lineCap,
    "line-miter-limit": style?.lineMiterLimit,
    "line-offset": style?.lineOffset,
    "line-offset-transition": style?.lineOffsetTransition,
    "line-opacity": style?.lineOpacity,
    "line-opacity-transition": style?.lineOpacityTransition,
    "line-pattern": style?.linePattern,
    "line-pattern-transition": style?.linePatternTransition,
    "line-round-limit": style?.lineRoundLimit,
    "line-sort-key": style?.lineSortKey,
    "line-translate": style?.lineTranslate,
    "line-translate-anchor": style?.lineTranslateAnchor,
    "line-translate-transition": style?.lineTranslateTransition,
    "line-width": style?.lineWidth,
    "line-width-transition": style?.lineWidthTransition,
  };

  // Build the layout properties
  const layout: Record<string, any> = {
    "source-layer": sourceLayerID,
    filter,
    minzoom: minZoomLevel,
    maxzoom: maxZoomLevel,
  };

  return (
    <Layer
      id={id}
      type="line"
      source={sourceID}
      paint={filterUndefined(paint)}
      layout={filterUndefined(layout)}
    />
  );
};

/** biome-ignore-all lint/suspicious/noExplicitAny: Some props are not typed */
import { Layer } from "react-map-gl/mapbox";

import type { CircleLayerProps } from "./types";

// Web implementation using react-map-gl/mapbox
export const CircleLayer = ({
  id,
  sourceID,
  sourceLayerID,
  filter,
  minZoomLevel,
  maxZoomLevel,
  style,
}: CircleLayerProps) => {
  // Validate required props
  if (!id || id.trim() === "" || !sourceID || sourceID.trim() === "") {
    console.error("CircleLayer: id and sourceID are required");
    return null;
  }

  // Build the paint properties from style
  const paint: Record<string, any> = {};

  if (style?.circleSortKey !== undefined)
    paint["circle-sort-key"] = style.circleSortKey;
  if (style?.circleBlur !== undefined) paint["circle-blur"] = style.circleBlur;
  if (style?.circleColor !== undefined)
    paint["circle-color"] = style.circleColor;
  if (style?.circleEmissiveStrength !== undefined)
    paint["circle-emissive-strength"] = style.circleEmissiveStrength;
  if (style?.circleOpacity !== undefined)
    paint["circle-opacity"] = style.circleOpacity;
  if (style?.circlePitchAlignment !== undefined)
    paint["circle-pitch-alignment"] = style.circlePitchAlignment;
  if (style?.circlePitchScale !== undefined)
    paint["circle-pitch-scale"] = style.circlePitchScale;
  if (style?.circleRadius !== undefined)
    paint["circle-radius"] = style.circleRadius;
  if (style?.circleRadiusTransition !== undefined) {
    paint["circle-radius-transition"] = style.circleRadiusTransition;
  }
  if (style?.circleStrokeColor !== undefined)
    paint["circle-stroke-color"] = style.circleStrokeColor;
  if (style?.circleStrokeOpacity !== undefined)
    paint["circle-stroke-opacity"] = style.circleStrokeOpacity;
  if (style?.circleStrokeWidth !== undefined)
    paint["circle-stroke-width"] = style.circleStrokeWidth;
  if (style?.circleTranslate !== undefined)
    paint["circle-translate"] = style.circleTranslate;
  if (style?.circleTranslateAnchor !== undefined)
    paint["circle-translate-anchor"] = style.circleTranslateAnchor;

  // Build the layout properties
  const layout: Record<string, any> = {};

  if (sourceLayerID !== undefined) layout["source-layer"] = sourceLayerID;
  if (filter !== undefined) layout.filter = filter;
  if (minZoomLevel !== undefined) layout.minzoom = minZoomLevel;
  if (maxZoomLevel !== undefined) layout.maxzoom = maxZoomLevel;

  return (
    <Layer
      id={id}
      type="circle"
      source={sourceID}
      paint={paint}
      layout={layout}
    />
  );
};

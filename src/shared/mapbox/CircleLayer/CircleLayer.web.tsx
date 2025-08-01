/** biome-ignore-all lint/suspicious/noExplicitAny: Some props are not typed */
import { Layer } from "react-map-gl/mapbox";

import { filterUndefined } from "@/shared/lib/utils/mapbox";

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
  const paint: Record<string, any> = {
    "circle-sort-key": style?.circleSortKey,
    "circle-blur": style?.circleBlur,
    "circle-color": style?.circleColor,
    "circle-emissive-strength": style?.circleEmissiveStrength,
    "circle-opacity": style?.circleOpacity,
    "circle-pitch-alignment": style?.circlePitchAlignment,
    "circle-pitch-scale": style?.circlePitchScale,
    "circle-radius": style?.circleRadius,
    "circle-radius-transition": style?.circleRadiusTransition,
    "circle-stroke-color": style?.circleStrokeColor,
    "circle-stroke-opacity": style?.circleStrokeOpacity,
    "circle-stroke-width": style?.circleStrokeWidth,
    "circle-translate": style?.circleTranslate,
    "circle-translate-anchor": style?.circleTranslateAnchor,
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
      type="circle"
      source={sourceID}
      paint={filterUndefined(paint)}
      layout={filterUndefined(layout)}
    />
  );
};

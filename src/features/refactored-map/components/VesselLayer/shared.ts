/**
 * Shared constants and types for VesselLayer component
 * Contains vessel styling constants used by both native and web implementations
 */

import { useVesselLocations } from "@/data/contexts";
import type { MapboxExpression } from "@/shared/mapbox/types";
import { locationsToFeatureCollection } from "@/shared/utils/geoJson";

export const VESSEL_COLORS = {
  WHITE: "rgb(255, 255, 255)",
  PINK_300: "rgb(249, 168, 212)",
  SHADOW: "rgba(0, 0, 0, 1)",
  RED: "red",
} as const;

export const VESSEL_SHADOW_PAINT: Record<string, MapboxExpression> = {
  circleRadius: ["interpolate", ["linear"], ["zoom"], 6, 0, 21, 50],
  circleColor: VESSEL_COLORS.SHADOW,
  circleOpacity: [
    "case",
    ["get", "InService", ["get", "feature"]],
    0.25, // Active vessels: shadow opacity
    0.1, // Inactive vessels: reduced shadow opacity
  ],
  circlePitchAlignment: "map",
  circleTranslate: [
    "interpolate",
    ["linear"],
    ["zoom"],
    8,
    ["literal", [0, 0]],
    21,
    ["literal", [6, 12]],
  ],
};

export const VESSEL_CIRCLES_PAINT: Record<string, MapboxExpression> = {
  circleRadius: ["interpolate", ["linear"], ["zoom"], 6, 0, 21, 50],
  circleColor: VESSEL_COLORS.PINK_300,
  circleOpacity: [
    "case",
    ["get", "InService", ["get", "feature"]],
    1, // Active vessels: full opacity
    0.25, // Inactive vessels: reduced opacity
  ],
  circleStrokeColor: VESSEL_COLORS.WHITE,
  circleStrokeOpacity: [
    "case",
    ["get", "InService", ["get", "feature"]],
    1, // Active vessels: full opacity
    0.25, // Inactive vessels: reduced opacity
  ],
  circleStrokeWidth: ["interpolate", ["linear"], ["zoom"], 6, 0, 21, 10],
  circlePitchAlignment: "map",
};

export const VESSEL_DIRECTION_PAINT: Record<string, MapboxExpression> = {
  textColor: VESSEL_COLORS.RED,
  textOpacity: [
    "case",
    ["get", "InService", ["get", "feature"]],
    1, // Active vessels: full opacity
    0.1, // Inactive vessels: reduced opacity
  ],
};

export const VESSEL_DIRECTION_LAYOUT: Record<string, MapboxExpression> = {
  textField: "   ▶", // Simple triangle arrow with nonbreaking spaces
  textSize: ["interpolate", ["linear"], ["zoom"], 8, 0, 21, 120],
  textAllowOverlap: true,
  textIgnorePlacement: true,
  textPitchAlignment: "map",
  textRotationAlignment: "map", // Keep aligned with map for proper heading display
  textRotate: ["-", ["get", "Heading", ["get", "feature"]], 90], // Rotate based on vessel heading, adjusted 90° counterclockwise
};

export const SOURCE_ID = "refactored-vessels-source";
export const SHADOW_LAYER_ID = "refactored-vessel-shadow";
export const CIRCLES_LAYER_ID = "refactored-vessel-circles";
export const DIRECTION_LAYER_ID = "refactored-vessel-direction";

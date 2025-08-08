/**
 * Shared constants and types for VesselLines component
 * Contains vessel line styling constants used by both native and web implementations
 */

import type { MapboxExpression } from "@/shared/mapbox/types";

export const VESSEL_LINE_COLORS = {
  WHITE: "white",
  WHITE_TRANSPARENT: "rgba(255, 255, 255, 0)",
  WHITE_SEMI_TRANSPARENT: "rgba(255, 255, 255, 0.3)",
} as const;

export const VESSEL_LINE_PAINT: Record<string, MapboxExpression> = {
  lineColor: VESSEL_LINE_COLORS.WHITE,
  lineBlur: 0,
  lineWidth: ["interpolate", ["linear"], ["zoom"], 0, 0, 21, 16],
  lineGradient: [
    "interpolate",
    ["linear"],
    ["line-progress"],
    0,
    VESSEL_LINE_COLORS.WHITE_TRANSPARENT,
    1,
    VESSEL_LINE_COLORS.WHITE_SEMI_TRANSPARENT,
  ],
};

export const VESSEL_LINE_LAYOUT: Record<string, MapboxExpression> = {
  lineJoin: "round",
  lineCap: "round",
};

export const SOURCE_ID = "refactored-vessel-lines-source";
export const LAYER_ID = "refactored-vessel-lines-layer";

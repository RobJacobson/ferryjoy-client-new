/**
 * Shared constants and types for RoutesLayer component
 * Contains route styling constants used by both native and web implementations
 */

import type { MapboxExpression } from "@/shared/mapbox/types";

export const ROUTE_COLORS = {
  LIME_300: "rgb(190, 242, 100)",
  LIME_700: "rgb(77, 124, 15)",
} as const;

export const ROUTE_LINE_PAINT: Record<string, MapboxExpression> = {
  lineColor: "white",
  lineDasharray: [
    "step",
    ["zoom"],
    [1000, 0], // Default: solid line
    8,
    [0, 2], // At zoom 8+: small dashes
    12,
    [0, 4], // At zoom 12+: medium dashes
    16,
    [0, 6], // At zoom 16+: large dashes
  ],
  lineOpacity: [
    "case",
    ["any", ["==", ["get", "OBJECTID"], 30], ["==", ["get", "OBJECTID"], 31]],
    0.1, // 10% opacity for routes with OBJECTID 30 or 31
    0.5, // 50% opacity for other routes
  ],
  lineWidth: ["interpolate", ["linear"], ["zoom"], 0, 0, 21, 8],
  lineCap: "round",
};

export const SOURCE_ID = "refactored-routes-source";
export const LAYER_ID = "refactored-routes-layer";

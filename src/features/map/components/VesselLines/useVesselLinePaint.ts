/**
 * Hook for providing zoom-reactive vessel line paint and layout properties
 * Returns separate paint and layout properties that dynamically adjust based on map zoom level
 */

import { useMapState } from "@/shared/contexts";
import type { MapboxExpression } from "@/shared/mapbox/types";

const VESSEL_LINE_COLORS = {
  WHITE: "white",
  TRANSPARENT: "rgba(255, 255, 255, 0)",
  WHITE_50: "rgba(255, 255, 255, 0.5)",
} as const;

export const useVesselLinePaint = () => {
  const { zoom } = useMapState();

  const paint: Record<string, MapboxExpression> = {
    // lineColor: VESSEL_LINE_COLORS.RED,
    lineBlur: 8,
    lineWidth: ["interpolate", ["linear"], ["zoom"], 4, 0, 21, 48],
    lineGradient: [
      "interpolate",
      ["linear"],
      ["line-progress"],
      0,
      VESSEL_LINE_COLORS.TRANSPARENT,
      1,
      VESSEL_LINE_COLORS.WHITE_50,
    ],
  };

  const layout: Record<string, MapboxExpression> = {
    lineJoin: "round",
    lineCap: "round",
  };

  // Return separate paint and layout properties
  return { paint, layout };
};

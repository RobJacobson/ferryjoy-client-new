/**
 * Hook for providing zoom-reactive vessel line paint and layout properties
 * Returns separate paint and layout properties that dynamically adjust based on map zoom level
 */

import { useMemo } from "react";

import { useMapState } from "@/shared/contexts";
import { lerp } from "@/shared/lib/utils/";
import type { MapboxExpression } from "@/shared/mapbox/types";

const VESSEL_LINE_COLORS = {
  WHITE: "white",
  WHITE_TRANSPARENT: "rgba(255, 255, 255, 0)",
  WHITE_SEMI_TRANSPARENT: "rgba(255, 255, 255, 0.5)",
} as const;

const MIN_ZOOM = 6;
const MAX_ZOOM = 22;
const MIN_PIVOT = 0.95;
const MAX_PIVOT = 1;

export const useVesselLinePaint = () => {
  const { zoom } = useMapState();

  return useMemo(() => {
    const linePivot = lerp(zoom, MIN_ZOOM, MAX_ZOOM, MIN_PIVOT, MAX_PIVOT);
    // console.log("zoom", zoom, linePivot);

    const paint: Record<string, MapboxExpression> = {
      // lineColor: VESSEL_LINE_COLORS.RED,
      lineBlur: 0,
      lineWidth: ["interpolate", ["linear"], ["zoom"], 4, 0, 21, 32],
      lineGradient: [
        "interpolate",
        ["linear"],
        ["line-progress"],
        0,
        VESSEL_LINE_COLORS.WHITE_TRANSPARENT,
        linePivot,
        VESSEL_LINE_COLORS.WHITE_SEMI_TRANSPARENT,
        1,
        VESSEL_LINE_COLORS.WHITE_TRANSPARENT,
      ],
    };

    const layout: Record<string, MapboxExpression> = {
      lineJoin: "round",
      lineCap: "round",
    };

    // Return separate paint and layout properties
    return { paint, layout };
  }, [zoom]);
};

import { LineLayer } from "@/shared/mapbox/LineLayer";
import { ShapeSource } from "@/shared/mapbox/ShapeSource";

import { useVesselLines } from "../hooks/useVesselLines";

/**
 * VesselTrails component displays vessel ping data as smooth line trails on the map.
 * Each vessel's trail has linearly interpolated opacity from 1 (first ping) to 0 (last ping).
 */
export const VesselLines = () => {
  const vesselLinesGeoJson = useVesselLines();

  return (
    <ShapeSource
      id="vessel-lines-source"
      shape={vesselLinesGeoJson}
      lineMetrics={true}
    >
      <LineLayer
        id="vessel-lines"
        sourceID="vessel-lines-source"
        style={{
          lineColor: "white",
          // lineWidth: 8,
          lineBlur: 2,
          lineWidth: ["interpolate", ["linear"], ["zoom"], 0, 0, 21, 16],
          lineGradient: [
            "interpolate",
            ["linear"],
            ["line-progress"],
            0,
            "rgba(255, 255, 255, 0)",
            1,
            "rgba(255, 255, 255, 0.25)",
          ],
          lineJoin: "round",
          lineCap: "round",
        }}
      />
    </ShapeSource>
  );
};

import { useVesselPositions } from "@/data/contexts/VesselPositionsContext";
import { useVesselsGeoJson } from "@/hooks/useVesselsGeoJson";

import { CircleLayer } from "../mapbox/CircleLayer";
import { ShapeSource } from "../mapbox/ShapeSource";
import { SymbolLayer } from "../mapbox/SymbolLayer";

const PINK_500 = "rgb(236, 72, 153)"; // pink-500

const VesselLayer = () => {
  const { animatedVessels: smoothedVessels } = useVesselPositions();
  const vesselGeoJSON = useVesselsGeoJson(smoothedVessels);

  // Don't render if there are no features or if the GeoJSON is invalid
  if (!vesselGeoJSON?.features || vesselGeoJSON.features.length === 0) {
    return null;
  }

  return (
    <ShapeSource id="vessels" shape={vesselGeoJSON}>
      <CircleLayer
        key={`vessel-circles-${vesselGeoJSON.features.length}`}
        id="vessel-circles"
        sourceID="vessels"
        style={{
          circleRadius: ["interpolate", ["linear"], ["zoom"], 8, 0, 21, 50],
          circleColor: "white",
          circleOpacity: [
            "case",
            ["get", "InService", ["get", "vessel"]],
            0.1, // Active vessels: 80% opacity
            0.05, // Inactive vessels: 25% opacity
          ],
          circleStrokeWidth: 2,
          circleStrokeColor: PINK_500,
          circleStrokeOpacity: [
            "case",
            ["get", "InService", ["get", "vessel"]],
            1, // Active vessels: 100% stroke opacity
            0.5, // Inactive vessels: 25% stroke opacity
          ],
          circlePitchAlignment: "map",
        }}
      />
      <CircleLayer
        key={`vessel-circles-fill-${vesselGeoJSON.features.length}`}
        id="vessel-circles-fill"
        sourceID="vessels"
        style={{
          circleRadius: ["interpolate", ["linear"], ["zoom"], 8, 0, 21, 100],
          circleColor: "pink",
          circleBlur: 1,
          circleOpacity: [
            "case",
            ["get", "InService", ["get", "vessel"]],
            0.25, // Active vessels: 80% opacity
            0.0, // Inactive vessels: 25% opacity
          ],
          circlePitchAlignment: "map",
        }}
      />
      <SymbolLayer
        key={`vessel-eta-labels-${vesselGeoJSON.features.length}`}
        id="vessel-eta-labels"
        sourceID="vessels"
        style={{
          textField: [
            "case",
            ["get", "InService", ["get", "vessel"]],
            [
              "case",
              ["get", "etaMinutes", ["get", "vessel"]],
              ["to-string", ["get", "etaMinutes", ["get", "vessel"]]],
              "--",
            ],
            "--",
          ],
          textSize: ["interpolate", ["linear"], ["zoom"], 8, 8, 21, 14],
          textColor: PINK_500,
          textHaloColor: "white",
          textHaloWidth: 1,
          textAnchor: "center",
          textOffset: [0, 0],
          textOpacity: [
            "case",
            ["get", "InService", ["get", "vessel"]],
            1, // Active vessels: 100% opacity
            0.5, // Inactive vessels: 50% opacity
          ],
          textPitchAlignment: "map",
        }}
      />
    </ShapeSource>
  );
};

export default VesselLayer;

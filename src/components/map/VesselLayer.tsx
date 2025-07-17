import { CircleLayer } from "@/components/mapbox/CircleLayer";
import { ShapeSource } from "@/components/mapbox/ShapeSource";
import { SymbolLayer } from "@/components/mapbox/SymbolLayer";
import { useVesselPositions } from "@/data/contexts/VesselPositionsContext";
import { useVesselFeatures } from "@/hooks/useVesselFeatures";

const PINK_300 = "rgb(249, 168, 212)"; // pink-300
const PINK_500 = "rgb(236, 72, 153)"; // pink-500
const PINK_600 = "rgb(219, 39, 119)"; // pink-600
const PINK_700 = "rgb(190, 24, 93)"; // pink-700
const PINK_800 = "rgb(157, 23, 77)"; // pink-800

/**
 * VesselLayer displays vessel positions as circles with ETA labels and direction indicators
 * Combines vessel visualization, ETA information, and heading direction in multiple layers
 */
const VesselLayer = () => {
  const { animatedVessels: smoothedVessels } = useVesselPositions();
  const vesselGeoJSON = useVesselFeatures(smoothedVessels);

  // Don't render if there are no features or if the GeoJSON is invalid
  if (!vesselGeoJSON?.features || vesselGeoJSON.features.length === 0) {
    return null;
  }

  return (
    <ShapeSource id="vessels" shape={vesselGeoJSON}>
      {/* Vessel direction indicators layer */}
      <SymbolLayer
        key={`vessel-direction-${vesselGeoJSON.features.length}`}
        id="vessel-direction"
        sourceID="vessels"
        style={{
          textField: "   ▶", // Simple triangle arrow with nonbreaking spaces
          textSize: ["interpolate", ["linear"], ["zoom"], 8, 0, 21, 120],
          textColor: "red",
          textOpacity: [
            "case",
            ["get", "InService", ["get", "vessel"]],
            1, // Active vessels: full opacity
            0.1, // Inactive vessels: reduced opacity
          ],
          // textAnchor: "left", // Align arrow to the left side of its position
          textAllowOverlap: true,
          textIgnorePlacement: true,
          textPitchAlignment: "map",
          // textAnchor: "left",
          textRotationAlignment: "map", // Keep aligned with map for proper heading display
          textRotate: ["-", ["get", "Heading", ["get", "vessel"]], 90], // Rotate based on vessel heading, adjusted 90° counterclockwise
          // textRadialOffset: 50, // Simple offset to place arrow above vessel
        }}
      />
      {/* Vessel circles layer */}
      <CircleLayer
        key={`vessel-circles-${vesselGeoJSON.features.length}`}
        id="vessel-circles"
        sourceID="vessels"
        style={{
          circleRadius: ["interpolate", ["linear"], ["zoom"], 8, 0, 21, 50],
          circleColor: PINK_300,
          circleOpacity: [
            "case",
            ["get", "InService", ["get", "vessel"]],
            1, // Active vessels: 10% opacity
            0.25, // Inactive vessels: 5% opacity
          ],
          circleStrokeColor: PINK_600,
          circleStrokeOpacity: [
            "case",
            ["get", "InService", ["get", "vessel"]],
            1, // Active vessels: 10% opacity
            0.25, // Inactive vessels: 5% opacity
          ],
          circleStrokeWidth: ["interpolate", ["linear"], ["zoom"], 8, 0, 21, 5],
          circlePitchAlignment: "map",
        }}
      />
      {/* Vessel ETA labels layer */}
      <SymbolLayer
        key={`vessel-eta-labels-${vesselGeoJSON.features.length}`}
        id="vessel-eta-labels"
        sourceID="vessels"
        style={{
          textField: ["get", "etaMinutes", ["get", "vessel"]],
          textSize: ["interpolate", ["linear"], ["zoom"], 8, 0, 21, 60],
          textColor: PINK_800,
          textOpacity: 1,
          textHaloColor: "white",
          textHaloWidth: 0,
          textAnchor: "center",
          textAllowOverlap: true,
          textIgnorePlacement: true,
          textPitchAlignment: "map",
          // textFont: ["Inter", "Open Sans Bold", "Arial Bold"], // Try Inter first, fallback to built-in fonts
        }}
      />
    </ShapeSource>
  );
};

export default VesselLayer;

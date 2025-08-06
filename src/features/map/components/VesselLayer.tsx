import { useVesselAnimation } from "@/shared/contexts";
import { CircleLayer } from "@/shared/mapbox/CircleLayer";
import { ShapeSource } from "@/shared/mapbox/ShapeSource";
import { SymbolLayer } from "@/shared/mapbox/SymbolLayer";
import { featuresToFeatureCollection } from "@/shared/utils/geoJson";

const WHITE = "rgb(255, 255, 255)";
const PINK_300 = "rgb(249, 168, 212)"; // pink-300
const SHADOW_COLOR = "rgba(0, 0, 0, 1)"; // Semi-transparent black for shadow

/**
 * VesselLayer displays vessel positions as circles with direction indicators
 * Handles vessel visualization and heading direction
 */
const VesselLayer = () => {
  const animatedVessels = useVesselAnimation();
  const vesselGeoJSON = featuresToFeatureCollection(animatedVessels);

  // Don't render if there are no features or if the GeoJSON is invalid
  if (!vesselGeoJSON?.features || vesselGeoJSON.features.length === 0) {
    return null;
  }

  return (
    <ShapeSource id="vessels" shape={vesselGeoJSON}>
      {/* Vessel shadow layer - positioned first so it appears behind */}
      <CircleLayer
        key={`vessel-shadow-${vesselGeoJSON.features.length}`}
        id="vessel-shadow"
        sourceID="vessels"
        style={{
          circleRadius: ["interpolate", ["linear"], ["zoom"], 6, 0, 21, 50],
          circleColor: SHADOW_COLOR,
          circleOpacity: [
            "case",
            ["get", "InService", ["get", "feature"]],
            0.25, // Active vessels: shadow opacity
            0.1, // Inactive vessels: reduced shadow opacity
          ],
          circlePitchAlignment: "map",
          // Offset shadow down and to the right
          circleTranslate: [
            "interpolate",
            ["linear"],
            ["zoom"],
            8,
            ["literal", [0, 0]],
            21,
            ["literal", [6, 12]],
          ],
        }}
      />
      {/* Vessel circles layer */}
      <CircleLayer
        key={`vessel-circles-${vesselGeoJSON.features.length}`}
        id="vessel-circles"
        sourceID="vessels"
        style={{
          circleRadius: ["interpolate", ["linear"], ["zoom"], 6, 0, 21, 50],
          circleColor: PINK_300,
          circleOpacity: [
            "case",
            ["get", "InService", ["get", "feature"]],
            1, // Active vessels: full opacity
            0.25, // Inactive vessels: reduced opacity
          ],
          circleStrokeColor: WHITE,
          circleStrokeOpacity: [
            "case",
            ["get", "InService", ["get", "feature"]],
            1, // Active vessels: full opacity
            0.25, // Inactive vessels: reduced opacity
          ],
          circleStrokeWidth: [
            "interpolate",
            ["linear"],
            ["zoom"],
            6,
            0,
            21,
            10,
          ],
          circlePitchAlignment: "map",
        }}
      />
      {/* Vessel direction indicators layer */}
      <SymbolLayer
        key={`vessel-direction-${vesselGeoJSON.features.length}`}
        id="vessel-direction"
        sourceID="vessels"
        style={{
          textField: "   ▶", // Simple triangle arrow with nonbreaking spaces
          textSize: ["interpolate", ["linear"], ["zoom"], 8, 0, 21, 120],
          textColor: "red",
          textOpacity: [
            "case",
            ["get", "InService", ["get", "feature"]],
            1, // Active vessels: full opacity
            0.1, // Inactive vessels: reduced opacity
          ],
          textAllowOverlap: true,
          textIgnorePlacement: true,
          textPitchAlignment: "map",
          textRotationAlignment: "map", // Keep aligned with map for proper heading display
          textRotate: ["-", ["get", "Heading", ["get", "feature"]], 90], // Rotate based on vessel heading, adjusted 90° counterclockwise
        }}
      />
    </ShapeSource>
  );
};

export default VesselLayer;

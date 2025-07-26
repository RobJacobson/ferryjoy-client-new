import { useVesselFeatures } from "@/features/map/hooks/useVesselFeatures";
import { useVesselLocation } from "@/shared/contexts/VesselLocationContext";
import { CircleLayer } from "@/shared/mapbox/CircleLayer";
import { ShapeSource } from "@/shared/mapbox/ShapeSource";
import { SymbolLayer } from "@/shared/mapbox/SymbolLayer";

const PINK_300 = "rgb(249, 168, 212)"; // pink-300
const PINK_600 = "rgb(219, 39, 119)"; // pink-600

/**
 * VesselLayer displays vessel positions as circles with direction indicators
 * Handles vessel visualization and heading direction
 */
const VesselLayer = () => {
  const { vesselLocations: smoothedVessels } = useVesselLocation();
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
          textField: "   ▶", // Simple triangle arrow with nonbreaking spaces
          textSize: ["interpolate", ["linear"], ["zoom"], 8, 0, 21, 120],
          textColor: "red",
          textOpacity: [
            "case",
            ["get", "InService", ["get", "vessel"]],
            1, // Active vessels: full opacity
            0.1, // Inactive vessels: reduced opacity
          ],
          textAllowOverlap: true,
          textIgnorePlacement: true,
          textPitchAlignment: "map",
          textRotationAlignment: "map", // Keep aligned with map for proper heading display
          textRotate: ["-", ["get", "Heading", ["get", "vessel"]], 90], // Rotate based on vessel heading, adjusted 90° counterclockwise
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
            1, // Active vessels: full opacity
            0.25, // Inactive vessels: reduced opacity
          ],
          circleStrokeColor: PINK_600,
          circleStrokeOpacity: [
            "case",
            ["get", "InService", ["get", "vessel"]],
            1, // Active vessels: full opacity
            0.25, // Inactive vessels: reduced opacity
          ],
          circleStrokeWidth: ["interpolate", ["linear"], ["zoom"], 8, 0, 21, 5],
          circlePitchAlignment: "map",
        }}
      />
    </ShapeSource>
  );
};

export default VesselLayer;

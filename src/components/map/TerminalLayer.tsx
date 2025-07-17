// Import the JSON file directly - this is handled natively by the bundler
import terminalsGeoJson from "@assets/wsf/wsf-terminals.json";

import { CircleLayer } from "@/components/mapbox/CircleLayer";
import { ShapeSource } from "@/components/mapbox/ShapeSource";

const TERMINAL_COLOR = "rgb(29, 78, 216)"; // blue-700

/**
 * TerminalLayer displays all WSF ferry terminals as blue circles with 80% opacity and radius 6.
 * Terminals are shown as points representing ferry terminal locations.
 */
export const TerminalLayer = () => {
  const sourceId = "terminals-source";

  return (
    <ShapeSource
      id={sourceId}
      shape={terminalsGeoJson as GeoJSON.FeatureCollection}
    >
      <CircleLayer
        id="terminals-layer-blur"
        sourceID={sourceId}
        style={{
          circleColor: "white",
          circleOpacity: 0.25,
          circleRadius: ["interpolate", ["linear"], ["zoom"], 8, 0, 21, 200],
          circlePitchAlignment: "map",
          circleBlur: 1,
        }}
      />
      <CircleLayer
        id="terminals-layer"
        sourceID={sourceId}
        style={{
          circleColor: TERMINAL_COLOR,
          circleOpacity: 0.1,
          circleRadius: ["interpolate", ["linear"], ["zoom"], 8, 0, 21, 100],
          circleStrokeColor: TERMINAL_COLOR,
          circleStrokeWidth: 1,
          circleStrokeOpacity: 0.5,
          circlePitchAlignment: "map",
        }}
      />
    </ShapeSource>
  );
};

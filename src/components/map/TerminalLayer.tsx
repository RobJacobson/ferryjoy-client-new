// Import the JSON file directly - this is handled natively by the bundler
import terminalsGeoJson from "@assets/wsf/wsf-terminals.json";
import { useMemo } from "react";

import { CircleLayer } from "../mapbox/CircleLayer";
import { ShapeSource } from "../mapbox/ShapeSource";

const TERMINAL_COLOR = "rgb(29, 78, 216)"; // blue-700

/**
 * TerminalLayer displays all WSF ferry terminals as blue circles with 80% opacity and radius 6.
 * Terminals are shown as points representing ferry terminal locations.
 */
export const TerminalLayer = () => {
  const sourceId = "terminals-source";

  // Memoize the GeoJSON to avoid unnecessary re-renders
  const geoJson = useMemo(
    () => terminalsGeoJson as GeoJSON.FeatureCollection,
    []
  );

  return (
    <ShapeSource id={sourceId} shape={geoJson}>
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

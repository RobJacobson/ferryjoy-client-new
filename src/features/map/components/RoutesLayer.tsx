// Import the JSON file directly - this is handled natively by the bundler

import routesGeoJson from "@assets/wsdot/wsdot-routes.json";

import { LineLayer } from "@/shared/mapbox/LineLayer";
import { ShapeSource } from "@/shared/mapbox/ShapeSource";

const LIME_300 = "rgb(190, 242, 100)";
const LIME_700 = "rgb(77, 124, 15)";

/**
 * RoutesLayer displays all WSF ferry routes as white lines with 50% opacity and width 2.
 * Routes with OBJECTID 30 or 31 are shown at 10% opacity.
 */
export const RoutesLayer = () => {
  const sourceId = "routes-source";

  const geoJson = routesGeoJson as GeoJSON.FeatureCollection;

  return (
    <ShapeSource id={sourceId} shape={geoJson}>
      <LineLayer
        id="routes-layer"
        sourceID={sourceId}
        style={{
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
            [
              "any",
              ["==", ["get", "OBJECTID"], 30],
              ["==", ["get", "OBJECTID"], 31],
            ],
            0.1, // 10% opacity for routes with OBJECTID 30 or 31
            0.5, // 50% opacity for other routes
          ],
          lineWidth: ["interpolate", ["linear"], ["zoom"], 0, 0, 21, 8],
          lineCap: "round",
        }}
      />
    </ShapeSource>
  );
};

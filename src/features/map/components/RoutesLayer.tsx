// Import the JSON file directly - this is handled natively by the bundler

import { useMemo } from "react";

import { LineLayer } from "@/shared/mapbox/LineLayer";
import { ShapeSource } from "@/shared/mapbox/ShapeSource";

import routesGeoJson from "../../../assets/wsdot/wsdot-routes.json";

const LIME_300 = "rgb(190, 242, 100)";
const LIME_700 = "rgb(77, 124, 15)";

/**
 * RoutesLayer displays all WSF ferry routes as white lines with 50% opacity and width 2.
 * Routes with OBJECTID 30 or 31 are shown at 10% opacity.
 */
export const RoutesLayer = () => {
  const sourceId = "routes-source";

  // Memoize the GeoJSON to avoid unnecessary re-renders
  const geoJson = useMemo(() => routesGeoJson as GeoJSON.FeatureCollection, []);

  return (
    <ShapeSource id={sourceId} shape={geoJson}>
      <LineLayer
        id="routes-layer"
        sourceID={sourceId}
        style={{
          lineColor: "white",
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
          lineWidth: 2,
          // lineDasharray: [4, 4], // Dashed line pattern
        }}
      />
    </ShapeSource>
  );
};

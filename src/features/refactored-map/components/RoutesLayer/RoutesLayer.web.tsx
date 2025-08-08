/**
 * RoutesLayer web implementation using react-map-gl/mapbox
 * Displays WSF ferry routes as styled lines with conditional opacity
 */

import routesGeoJson from "@assets/wsdot/wsdot-routes.json";
import { Layer, Source } from "react-map-gl/mapbox";

import { toWebStyleProps } from "@/features/refactored-map/utils/propTranslation";
import type { MapboxExpression } from "@/shared/mapbox/types";

import { LAYER_ID, ROUTE_LINE_PAINT, SOURCE_ID } from "./shared";

export const RoutesLayer = () => {
  const geoJson = routesGeoJson as GeoJSON.FeatureCollection;

  // Convert shared styles to web format using translation utility
  const webStyles = toWebStyleProps(ROUTE_LINE_PAINT) as Record<
    string,
    MapboxExpression
  >;

  return (
    <Source id={SOURCE_ID} type="geojson" data={geoJson}>
      <Layer
        id={LAYER_ID}
        type="line"
        paint={webStyles}
        layout={{
          "line-join": "round",
          "line-cap": "round",
        }}
      />
    </Source>
  );
};

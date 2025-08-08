/**
 * RoutesLayer native implementation using @rnmapbox/maps
 * Displays WSF ferry routes as styled lines with conditional opacity
 */

import routesGeoJson from "@assets/wsdot/wsdot-routes.json";
import Mapbox from "@rnmapbox/maps";

import { LAYER_ID, ROUTE_LINE_PAINT, SOURCE_ID } from "./shared";

export const RoutesLayer = () => {
  const geoJson = routesGeoJson as GeoJSON.FeatureCollection;

  return (
    <Mapbox.ShapeSource id={SOURCE_ID} shape={geoJson}>
      <Mapbox.LineLayer
        id={LAYER_ID}
        sourceID={SOURCE_ID}
        style={ROUTE_LINE_PAINT} // Native uses camelCase directly
      />
    </Mapbox.ShapeSource>
  );
};

/**
 * RoutesLayer native implementation using @rnmapbox/maps
 * Displays WSF ferry routes as styled lines with conditional opacity
 */

import MapboxRN from "@rnmapbox/maps";

import {
  LAYER_ID,
  ROUTE_LINE_LAYOUT,
  ROUTE_LINE_PAINT,
  ROUTES_DATA,
  SOURCE_ID,
} from "./shared";

export const RoutesLayer = () => {
  return (
    <MapboxRN.ShapeSource id={SOURCE_ID} shape={ROUTES_DATA}>
      <MapboxRN.LineLayer
        id={LAYER_ID}
        sourceID={SOURCE_ID}
        style={{ ...ROUTE_LINE_PAINT, ...ROUTE_LINE_LAYOUT }} // Native combines paint and layout
      />
    </MapboxRN.ShapeSource>
  );
};

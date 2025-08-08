/**
 * RoutesLayer web implementation using react-map-gl/mapbox
 * Displays WSF ferry routes as styled lines with conditional opacity
 */

import { Layer, Source } from "react-map-gl/mapbox";

import { toWebStyleProps } from "@/features/refactored-map/utils/propTranslation";
import type { MapboxExpression } from "@/shared/mapbox/types";

import {
  LAYER_ID,
  ROUTE_LINE_LAYOUT,
  ROUTE_LINE_PAINT,
  ROUTES_DATA,
  SOURCE_ID,
} from "./shared";

export const RoutesLayer = () => {
  // Convert shared styles to web format using translation utility
  const webStyles = toWebStyleProps(ROUTE_LINE_PAINT) as Record<
    string,
    MapboxExpression
  >;

  return (
    <Source id={SOURCE_ID} type="geojson" data={ROUTES_DATA}>
      <Layer
        id={LAYER_ID}
        type="line"
        paint={
          toWebStyleProps(ROUTE_LINE_PAINT) as Record<string, MapboxExpression>
        }
        layout={
          toWebStyleProps(ROUTE_LINE_LAYOUT) as Record<string, MapboxExpression>
        }
      />
    </Source>
  );
};

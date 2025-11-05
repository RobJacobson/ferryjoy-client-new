/**
 * RoutesLayer web implementation using react-map-gl/mapbox
 * Displays WSF ferry routes as styled lines with conditional opacity
 */

import { Layer, Source } from "react-map-gl/mapbox";

import { toWebStyleProps } from "@/features/map/utils/propTranslation";
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
    <Source data={ROUTES_DATA} id={SOURCE_ID} type="geojson">
      <Layer
        id={LAYER_ID}
        layout={
          toWebStyleProps(ROUTE_LINE_LAYOUT) as Record<string, MapboxExpression>
        }
        paint={
          toWebStyleProps(ROUTE_LINE_PAINT) as Record<string, MapboxExpression>
        }
        type="line"
      />
    </Source>
  );
};

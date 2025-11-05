/** biome-ignore-all lint/suspicious/noExplicitAny: Exotic Mapbox types */

import { Layer, Source } from "react-map-gl/mapbox";
import type { VesselLocation } from "ws-dottie";

import { toWebStyleProps } from "@/features/map/utils/propTranslation";
import { locationsToFeatureCollection } from "@/shared/utils/geoJson";

import {
  CIRCLES_LAYER_ID,
  DIRECTION_LAYER_ID,
  SHADOW_LAYER_ID,
  SOURCE_ID,
  VESSEL_CIRCLES_PAINT,
  VESSEL_DIRECTION_LAYOUT,
  VESSEL_DIRECTION_PAINT,
  VESSEL_SHADOW_PAINT,
} from "./shared";

/**
 * VesselLayer displays vessel positions as circles with direction indicators
 * Handles vessel visualization and heading direction
 */
export const VesselLayer = ({
  vesselLocations,
}: {
  vesselLocations: VesselLocation[];
}) => {
  if (!vesselLocations?.length) {
    return null;
  }

  const vesselsFeatureCollection =
    locationsToFeatureCollection(vesselLocations);

  return (
    <Source data={vesselsFeatureCollection} id={SOURCE_ID} type="geojson">
      {/* Vessel shadow layer - positioned first so it appears behind */}
      <Layer
        id={SHADOW_LAYER_ID}
        paint={toWebStyleProps(VESSEL_SHADOW_PAINT) as any}
        type="circle"
      />
      {/* Vessel circles layer */}
      <Layer
        id={CIRCLES_LAYER_ID}
        paint={toWebStyleProps(VESSEL_CIRCLES_PAINT) as any}
        type="circle"
      />
      {/* Vessel direction indicators layer */}
      <Layer
        id={DIRECTION_LAYER_ID}
        layout={toWebStyleProps(VESSEL_DIRECTION_LAYOUT) as any}
        paint={toWebStyleProps(VESSEL_DIRECTION_PAINT) as any}
        type="symbol"
      />
    </Source>
  );
};

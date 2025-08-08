/** biome-ignore-all lint/suspicious/noExplicitAny: Exotic Mapbox types */

import { Layer, Source } from "react-map-gl/mapbox";
import type { VesselLocation } from "ws-dottie";

import { toWebStyleProps } from "@/features/refactored-map/utils/propTranslation";
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
    <Source id={SOURCE_ID} type="geojson" data={vesselsFeatureCollection}>
      {/* Vessel shadow layer - positioned first so it appears behind */}
      <Layer
        id={SHADOW_LAYER_ID}
        type="circle"
        paint={toWebStyleProps(VESSEL_SHADOW_PAINT) as any}
      />
      {/* Vessel circles layer */}
      <Layer
        id={CIRCLES_LAYER_ID}
        type="circle"
        paint={toWebStyleProps(VESSEL_CIRCLES_PAINT) as any}
      />
      {/* Vessel direction indicators layer */}
      <Layer
        id={DIRECTION_LAYER_ID}
        type="symbol"
        paint={toWebStyleProps(VESSEL_DIRECTION_PAINT) as any}
        layout={toWebStyleProps(VESSEL_DIRECTION_LAYOUT) as any}
      />
    </Source>
  );
};

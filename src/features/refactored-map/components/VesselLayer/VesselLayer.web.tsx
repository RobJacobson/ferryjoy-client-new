import { Layer, Source } from "react-map-gl/mapbox";

import { toWebStyleProps } from "@/features/refactored-map/utils/propTranslation";

import {
  CIRCLES_LAYER_ID,
  DIRECTION_LAYER_ID,
  SHADOW_LAYER_ID,
  SOURCE_ID,
  useVesselData,
  VESSEL_CIRCLES_PAINT,
  VESSEL_DIRECTION_PAINT,
  VESSEL_SHADOW_PAINT,
} from "./shared";

/**
 * VesselLayer displays vessel positions as circles with direction indicators
 * Handles vessel visualization and heading direction
 */
export const VesselLayer = () => {
  const { vesselsFeatureCollection, shouldRender } = useVesselData();

  if (!shouldRender) {
    return null;
  }

  return (
    <Source id={SOURCE_ID} type="geojson" data={vesselsFeatureCollection}>
      {/* Vessel shadow layer - positioned first so it appears behind */}
      <Layer
        id={SHADOW_LAYER_ID}
        type="circle"
        paint={toWebStyleProps(VESSEL_SHADOW_PAINT)}
      />
      {/* Vessel circles layer */}
      <Layer
        id={CIRCLES_LAYER_ID}
        type="circle"
        paint={toWebStyleProps(VESSEL_CIRCLES_PAINT)}
      />
      {/* Vessel direction indicators layer */}
      <Layer
        id={DIRECTION_LAYER_ID}
        type="symbol"
        layout={
          toWebStyleProps(VESSEL_DIRECTION_PAINT) as Record<string, unknown>
        }
      />
    </Source>
  );
};

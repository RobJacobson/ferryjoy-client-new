import MapboxRN from "@rnmapbox/maps";

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
    <MapboxRN.ShapeSource id={SOURCE_ID} shape={vesselsFeatureCollection}>
      {/* Vessel shadow layer - positioned first so it appears behind */}
      <MapboxRN.CircleLayer
        id={SHADOW_LAYER_ID}
        sourceID={SOURCE_ID}
        style={VESSEL_SHADOW_PAINT}
      />
      {/* Vessel circles layer */}
      <MapboxRN.CircleLayer
        id={CIRCLES_LAYER_ID}
        sourceID={SOURCE_ID}
        style={VESSEL_CIRCLES_PAINT}
      />
      {/* Vessel direction indicators layer */}
      <MapboxRN.SymbolLayer
        id={DIRECTION_LAYER_ID}
        sourceID={SOURCE_ID}
        style={VESSEL_DIRECTION_PAINT}
      />
    </MapboxRN.ShapeSource>
  );
};

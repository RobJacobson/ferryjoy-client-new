import MapboxRN from "@rnmapbox/maps";
import type { VesselLocation } from "ws-dottie";

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
        style={{ ...VESSEL_DIRECTION_PAINT, ...VESSEL_DIRECTION_LAYOUT }} // Native combines paint and layout
      />
    </MapboxRN.ShapeSource>
  );
};

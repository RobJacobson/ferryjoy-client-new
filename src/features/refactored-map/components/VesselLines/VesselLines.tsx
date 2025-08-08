/**
 * VesselLines native implementation using @rnmapbox/maps
 * Displays vessel ping data as smooth line trails with gradient opacity
 */

import MapboxRN from "@rnmapbox/maps";
import React from "react";
import type { VesselLocation } from "ws-dottie";

import {
  LAYER_ID,
  SOURCE_ID,
  VESSEL_LINE_LAYOUT,
  VESSEL_LINE_PAINT,
} from "./shared";
import { useVesselLinesData } from "./useVesselLinesData";

type VesselLinesProps = {
  vesselLocations: VesselLocation[];
};

export const VesselLines = ({ vesselLocations }: VesselLinesProps) => {
  const vesselLinesGeoJson = useVesselLinesData(vesselLocations);

  // Early return if no data available
  if (!vesselLinesGeoJson || !vesselLocations.length) {
    return null;
  }

  return (
    <MapboxRN.ShapeSource
      id={SOURCE_ID}
      shape={vesselLinesGeoJson}
      // @ts-expect-error - @rnmapbox/maps types are incorrect, runtime expects number not boolean
      lineMetrics={1} // Native @rnmapbox/maps expects 1 for true, undefined for false
    >
      <MapboxRN.LineLayer
        id={LAYER_ID}
        sourceID={SOURCE_ID}
        style={{ ...VESSEL_LINE_PAINT, ...VESSEL_LINE_LAYOUT }} // Native combines paint and layout
      />
    </MapboxRN.ShapeSource>
  );
};

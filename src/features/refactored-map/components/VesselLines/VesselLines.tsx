/**
 * VesselLines native implementation using @rnmapbox/maps
 * Displays vessel ping data as smooth line trails with gradient opacity
 */

import MapboxRN from "@rnmapbox/maps";
import type { VesselLocation } from "ws-dottie";

import { LAYER_ID, SOURCE_ID } from "./shared";
import { useVesselLinePaint } from "./useVesselLinePaint";
import { useVesselLinesData } from "./useVesselLinesData";

type VesselLinesProps = {
  vesselLocations: VesselLocation[];
};

export const VesselLines = ({ vesselLocations }: VesselLinesProps) => {
  const vesselLinesGeoJson = useVesselLinesData(vesselLocations);
  const { paint, layout } = useVesselLinePaint();

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
        style={{ ...paint, ...layout }}
      />
    </MapboxRN.ShapeSource>
  );
};

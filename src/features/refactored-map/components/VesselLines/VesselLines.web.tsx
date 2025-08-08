/**
 * VesselLines web implementation using react-map-gl/mapbox
 * Displays vessel ping data as smooth line trails with gradient opacity
 */

import { Layer, Source } from "react-map-gl/mapbox";
import type { VesselLocation } from "ws-dottie";

import { toWebStyleProps } from "@/features/refactored-map/utils/propTranslation";
import type { MapboxExpression } from "@/shared/mapbox/types";

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

  // Convert shared styles to web format using translation utility
  const paintLayer = toWebStyleProps(VESSEL_LINE_PAINT) as Record<
    string,
    MapboxExpression
  >;

  return (
    <Source
      id={SOURCE_ID}
      type="geojson"
      data={vesselLinesGeoJson}
      lineMetrics={true}
    >
      <Layer
        id={LAYER_ID}
        type="line"
        paint={paintLayer}
        layout={
          toWebStyleProps(VESSEL_LINE_LAYOUT) as Record<
            string,
            MapboxExpression
          >
        }
      />
    </Source>
  );
};

/**
 * VesselLines web implementation using react-map-gl/mapbox
 * Displays vessel ping data as smooth line trails with gradient opacity
 */

import { Layer, Source } from "react-map-gl/mapbox";
import type { VesselLocation } from "ws-dottie";

import { toWebStyleProps } from "@/features/refactored-map/utils/propTranslation";
import type { MapboxExpression } from "@/shared/mapbox/types";

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

  // Convert paint and layout properties to web format separately
  const paintLayer = toWebStyleProps(paint) as Record<string, MapboxExpression>;
  const layoutLayer = toWebStyleProps(layout) as Record<
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
        layout={layoutLayer}
      />
    </Source>
  );
};

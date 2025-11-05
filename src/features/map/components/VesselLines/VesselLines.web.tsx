/**
 * VesselLines web implementation using react-map-gl/mapbox
 * Displays vessel ping data as smooth line trails with gradient opacity
 */

import { Layer, Source } from "react-map-gl/mapbox";
import type { VesselLocation as VesselLocationDottie } from "ws-dottie";

import type { VesselLocation } from "@/data/types/VesselLocation";
import { toVesselLocation } from "@/data/types/VesselLocation";
import { toWebStyleProps } from "@/features/map/utils/propTranslation";
import type { MapboxExpression } from "@/shared/mapbox/types";

import { LAYER_ID, SOURCE_ID } from "./shared";
import { useVesselLinePaint } from "./useVesselLinePaint";
import { useVesselLinesData } from "./useVesselLinesData";

type VesselLinesProps = {
  vesselLocations: VesselLocationDottie[];
};

export const VesselLines = ({ vesselLocations }: VesselLinesProps) => {
  const convertedLocations = vesselLocations.map(toVesselLocation);
  const vesselLinesGeoJson = useVesselLinesData(convertedLocations);
  const { paint, layout } = useVesselLinePaint();

  // Early return if no data available
  if (!(vesselLinesGeoJson && vesselLocations.length)) {
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
      data={vesselLinesGeoJson}
      id={SOURCE_ID}
      lineMetrics={true}
      type="geojson"
    >
      <Layer
        id={LAYER_ID}
        layout={layoutLayer}
        paint={paintLayer}
        type="line"
      />
    </Source>
  );
};

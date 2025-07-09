import { useVesselPositionsSmoothed } from "@/data/contexts/VesselPositionsSmoothed";
import { useVesselsGeoJson } from "@/hooks/useVesselsGeoJson";

import { CircleLayer } from "./CircleLayer/CircleLayer";
import { ShapeSource } from "./ShapeSource/ShapeSource";

const VesselLayer = () => {
  const { smoothedVessels } = useVesselPositionsSmoothed();
  const vesselGeoJSON = useVesselsGeoJson(smoothedVessels);

  // Don't render if there are no features or if the GeoJSON is invalid
  if (!vesselGeoJSON?.features || vesselGeoJSON.features.length === 0) {
    return null;
  }

  return (
    <ShapeSource id="vessels" shape={vesselGeoJSON}>
      <CircleLayer
        key={`vessel-circles-${vesselGeoJSON.features.length}`}
        id="vessel-circles"
        sourceID="vessels"
        style={{
          circleRadius: 8,
          circleColor: "#3B82F6",
          circleOpacity: 0.8,
          circleStrokeWidth: 2,
          circleStrokeColor: "#FFFFFF",
          circleStrokeOpacity: 1,
        }}
      />
    </ShapeSource>
  );
};

export default VesselLayer;

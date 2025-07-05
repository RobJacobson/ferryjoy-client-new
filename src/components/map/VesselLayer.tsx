import Mapbox from "@rnmapbox/maps";
import { Platform } from "react-native";

import { useVesselPositionsSmoothed } from "@/data/contexts/VesselPositionsSmoothed";
import type { VesselLocation } from "@/data/shared/VesselLocation";

// Convert vessel positions to GeoJSON format
const vesselsToGeoJSON = (vessels: VesselLocation[]) => {
  return {
    type: "FeatureCollection" as const,
    features: vessels.map(toVesselFeature),
  };
};

const toVesselFeature = (vessel: VesselLocation) => ({
  type: "Feature" as const,
  geometry: {
    type: "Point" as const,
    coordinates: [vessel.lon, vessel.lat],
  },
  properties: {
    vessel,
  },
});

const VesselLayer = () => {
  const { smoothedVessels } = useVesselPositionsSmoothed();
  const hasVessels = smoothedVessels.length > 0;

  // Only render on platforms that support ShapeSource and CircleLayer
  if (!Mapbox.ShapeSource || !Mapbox.CircleLayer) {
    console.log(!Mapbox.ShapeSource, !Mapbox.CircleLayer);
    return null;
  }

  if (!hasVessels) {
    return null;
  }

  const vesselGeoJSON = vesselsToGeoJSON(smoothedVessels);

  return (
    <Mapbox.ShapeSource id="vessels" shape={vesselGeoJSON}>
      <Mapbox.CircleLayer
        key={`vessel-circles-${smoothedVessels.length}`}
        id="vessel-circles"
        style={{
          circleRadius: 8,
          circleColor: "#3B82F6",
          circleOpacity: 0.8,
          circleStrokeWidth: 2,
          circleStrokeColor: "#FFFFFF",
          circleStrokeOpacity: 1,
        }}
      />
    </Mapbox.ShapeSource>
  );
};

export default VesselLayer;

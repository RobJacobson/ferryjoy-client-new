import Mapbox from "@rnmapbox/maps";

import { useVesselsGeoJson } from "@/hooks/useVesselsGeoJson";

const VesselLayer = () => {
  const vesselGeoJSON = useVesselsGeoJson();

  // Only render on platforms that support ShapeSource and CircleLayer
  if (!Mapbox.ShapeSource || !Mapbox.CircleLayer) {
    console.log(!Mapbox.ShapeSource, !Mapbox.CircleLayer);
    return null;
  }

  return (
    <Mapbox.ShapeSource id="vessels" shape={vesselGeoJSON}>
      <Mapbox.CircleLayer
        key={`vessel-circles-${vesselGeoJSON.features.length}`}
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

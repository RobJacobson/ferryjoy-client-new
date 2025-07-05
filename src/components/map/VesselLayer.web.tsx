import { Layer, Source } from "react-map-gl/mapbox";

import { useVesselsGeoJson } from "@/hooks/useVesselsGeoJson";

const VesselLayer = () => {
  const vesselGeoJSON = useVesselsGeoJson();

  return (
    <Source id="vessels" type="geojson" data={vesselGeoJSON}>
      <Layer
        key={`vessel-circles-${vesselGeoJSON.features.length}`}
        id="vessel-circles"
        type="circle"
        paint={{
          "circle-radius": 8,
          "circle-color": "#3B82F6",
          "circle-opacity": 0.8,
          "circle-stroke-width": 2,
          "circle-stroke-color": "#FFFFFF",
          "circle-stroke-opacity": 1,
        }}
      />
    </Source>
  );
};

export default VesselLayer;

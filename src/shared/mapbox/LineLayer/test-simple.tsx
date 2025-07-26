import { Camera, LineLayer, MapView, ShapeSource } from "@/shared/mapbox";

// Simple test GeoJSON with one line
const testGeoJson = {
  type: "FeatureCollection" as const,
  features: [
    {
      type: "Feature" as const,
      geometry: {
        type: "LineString" as const,
        coordinates: [
          [-122.3321, 47.6062], // Seattle
          [-122.3351, 47.6097], // Slightly north
        ],
      },
      properties: {
        test: true,
      },
    },
  ],
};

/**
 * Simple test component for LineLayer debugging
 */
export const SimpleLineLayerTest = () => {
  return (
    <MapView>
      <Camera centerCoordinate={[-122.3321, 47.6062]} zoomLevel={12} />
      <ShapeSource id="test-source" shape={testGeoJson}>
        <LineLayer
          id="test-line"
          sourceID="test-source"
          style={{
            lineWidth: 10,
            lineColor: "#FF0000",
            lineOpacity: 1,
          }}
        />
      </ShapeSource>
    </MapView>
  );
};

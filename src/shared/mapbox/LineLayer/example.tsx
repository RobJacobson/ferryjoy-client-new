import { Camera, LineLayer, MapView, ShapeSource } from "@/shared/mapbox";

// Example GeoJSON route data
const routeGeoJson = {
  type: "FeatureCollection" as const,
  features: [
    {
      type: "Feature" as const,
      geometry: {
        type: "LineString" as const,
        coordinates: [
          [-122.4194, 47.6062], // Seattle
          [-122.3351, 47.6097], // Bainbridge Island
        ],
      },
      properties: {
        routeId: "SEA-BI",
        active: true,
        priority: "high",
      },
    },
    {
      type: "Feature" as const,
      geometry: {
        type: "LineString" as const,
        coordinates: [
          [-122.4194, 47.6062], // Seattle
          [-122.4751, 47.6097], // Bremerton
        ],
      },
      properties: {
        routeId: "SEA-BRE",
        active: false,
        priority: "medium",
      },
    },
  ],
};

/**
 * Example component demonstrating LineLayer usage
 */
export const LineLayerExample = () => {
  return (
    <MapView>
      <Camera centerCoordinate={[-122.4194, 47.6062]} zoomLevel={10} />
      <ShapeSource id="routes" shape={routeGeoJson}>
        {/* Basic route lines */}
        <LineLayer
          id="route-lines"
          style={{
            lineWidth: 3,
            lineColor: "#3B82F6",
            lineOpacity: 0.8,
            lineJoin: "round",
            lineCap: "round",
          }}
        />

        {/* Highlighted active routes */}
        <LineLayer
          id="active-routes"
          filter={["==", ["get", "active"], true]}
          style={{
            lineWidth: 6,
            lineColor: "#10B981",
            lineOpacity: 1,
          }}
        />
      </ShapeSource>
    </MapView>
  );
};

/**
 * Example with dynamic styling using Mapbox expressions
 */
export const DynamicLineLayerExample = () => {
  return (
    <MapView>
      <Camera centerCoordinate={[-122.4194, 47.6062]} zoomLevel={10} />
      <ShapeSource id="routes" shape={routeGeoJson}>
        <LineLayer
          id="dynamic-routes"
          style={{
            lineWidth: ["interpolate", ["linear"], ["zoom"], 8, 2, 12, 6],
            lineColor: [
              "case",
              ["==", ["get", "active"], true],
              "#10B981",
              ["==", ["get", "priority"], "high"],
              "#F59E0B",
              "#6B7280",
            ],
            lineOpacity: ["interpolate", ["linear"], ["zoom"], 8, 0.5, 12, 1],
            lineDasharray: [
              "case",
              ["==", ["get", "active"], true],
              ["literal", [0]],
              ["literal", [2, 2]],
            ],
          }}
        />
      </ShapeSource>
    </MapView>
  );
};

/**
 * Example with dashed lines and gradients
 */
export const StyledLineLayerExample = () => {
  return (
    <MapView>
      <Camera centerCoordinate={[-122.4194, 47.6062]} zoomLevel={10} />
      <ShapeSource id="routes" shape={routeGeoJson}>
        {/* Dashed lines for inactive routes */}
        <LineLayer
          id="dashed-routes"
          filter={["==", ["get", "active"], false]}
          style={{
            lineWidth: 2,
            lineColor: "#6B7280",
            lineDasharray: [4, 4],
            lineOpacity: 0.6,
          }}
        />

        {/* Gradient lines for active routes */}
        <LineLayer
          id="gradient-routes"
          filter={["==", ["get", "active"], true]}
          style={{
            lineWidth: 4,
            lineGradient: [
              "interpolate",
              ["linear"],
              ["line-progress"],
              0,
              "#3B82F6",
              0.5,
              "#10B981",
              1,
              "#EF4444",
            ],
            lineOpacity: 0.9,
          }}
        />
      </ShapeSource>
    </MapView>
  );
};

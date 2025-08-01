import { ShapeSource } from "../ShapeSource";
import { SymbolLayer } from "./SymbolLayer";

// Example GeoJSON data for testing
const exampleGeoJSON = {
  type: "FeatureCollection" as const,
  features: [
    {
      type: "Feature" as const,
      geometry: {
        type: "Point" as const,
        coordinates: [-122.4194, 37.7749], // San Francisco
      },
      properties: {
        name: "San Francisco",
        type: "city",
        population: 873965,
      },
    },
    {
      type: "Feature" as const,
      geometry: {
        type: "Point" as const,
        coordinates: [-122.3321, 47.6062], // Seattle
      },
      properties: {
        name: "Seattle",
        type: "city",
        population: 744955,
      },
    },
  ],
};

// Example component demonstrating SymbolLayer usage
export const SymbolLayerExample = () => {
  return (
    <ShapeSource id="example-source" shape={exampleGeoJSON}>
      {/* Basic text labels */}
      <SymbolLayer
        id="city-labels"
        sourceID="example-source"
        style={{
          textField: ["get", "name"],
          textSize: 14,
          textColor: "#1F2937",
          textHaloColor: "white",
          textHaloWidth: 1,
          textAnchor: "center",
        }}
      />

      {/* Icons with conditional styling */}
      <SymbolLayer
        id="city-icons"
        sourceID="example-source"
        style={{
          iconImage: [
            "case",
            ["==", ["get", "type"], "city"],
            "city",
            "default",
          ],
          iconSize: ["interpolate", ["linear"], ["zoom"], 8, 0.5, 15, 1.5],
          iconColor: "#3B82F6",
          iconAllowOverlap: true,
        }}
      />

      {/* Zoom-based text sizing */}
      <SymbolLayer
        id="population-labels"
        sourceID="example-source"
        style={{
          textField: [
            "concat",
            ["get", "name"],
            " (",
            ["number-format", ["get", "population"], {}],
            ")",
          ],
          textSize: ["interpolate", ["linear"], ["zoom"], 10, 8, 15, 12],
          textColor: "#6B7280",
          textOffset: [0, 2],
          textAnchor: "center",
        }}
      />
    </ShapeSource>
  );
};

// Example for vessel labels (similar to what might be used in the main app)
export const VesselLabelsExample = () => {
  const vesselGeoJSON = {
    type: "FeatureCollection" as const,
    features: [
      {
        type: "Feature" as const,
        geometry: {
          type: "Point" as const,
          coordinates: [-122.4194, 37.7749],
        },
        properties: {
          vesselName: "MV Wenatchee",
          inService: true,
          heading: 45,
        },
      },
    ],
  };

  return (
    <ShapeSource id="vessels" shape={vesselGeoJSON}>
      {/* Vessel icons */}
      <SymbolLayer
        id="vessel-icons"
        sourceID="vessels"
        style={{
          iconImage: [
            "case",
            ["get", "inService"],
            "ferry-active",
            "ferry-inactive",
          ],
          iconSize: ["interpolate", ["linear"], ["zoom"], 8, 0.3, 15, 1],
          iconRotate: ["get", "heading"],
          iconColor: ["case", ["get", "inService"], "#10B981", "#6B7280"],
          iconAllowOverlap: true,
        }}
      />

      {/* Vessel labels */}
      <SymbolLayer
        id="vessel-labels"
        sourceID="vessels"
        style={{
          textField: ["get", "vesselName"],
          textSize: ["interpolate", ["linear"], ["zoom"], 10, 8, 15, 12],
          textColor: ["case", ["get", "inService"], "#1F2937", "#9CA3AF"],
          textHaloColor: "white",
          textHaloWidth: 1,
          textOffset: [0, 1.5],
          textAnchor: "center",
          textAllowOverlap: false,
        }}
      />
    </ShapeSource>
  );
};

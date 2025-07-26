import { useMemo } from "react";

import { LineLayer } from "@/shared/mapbox/LineLayer";
import { ShapeSource } from "@/shared/mapbox/ShapeSource";

// Try using a different approach - create a simple line instead of a polygon

type BoundingBox = {
  minLatitude: number;
  maxLatitude: number;
  minLongitude: number;
  maxLongitude: number;
};

type BoundingBoxLayerProps = {
  boundingBox: BoundingBox | null;
};

/**
 * BoundingBoxLayer displays the computed bounding box as a red rectangle overlay
 * Used for debugging and visualizing the calculated bounding box area
 */
export const BoundingBoxLayer = ({ boundingBox }: BoundingBoxLayerProps) => {
  const sourceId = "bounding-box-source";

  // Create GeoJSON for the bounding box rectangle
  const geoJson = useMemo(() => {
    if (!boundingBox) {
      return {
        type: "FeatureCollection" as const,
        features: [],
      };
    }

    const { minLatitude, maxLatitude, minLongitude, maxLongitude } =
      boundingBox;

    // Create a simple line around the bounding box to verify the layer is working
    const feature = {
      type: "Feature" as const,
      geometry: {
        type: "LineString" as const,
        coordinates: [
          [minLongitude, minLatitude],
          [maxLongitude, minLatitude],
          [maxLongitude, maxLatitude],
          [minLongitude, maxLatitude],
          [minLongitude, minLatitude], // Close the rectangle
        ],
      },
      properties: {},
    };

    const result = {
      type: "FeatureCollection" as const,
      features: [feature],
    };

    return result;
  }, [boundingBox]);

  if (!boundingBox) {
    return null;
  }

  return (
    <ShapeSource id={sourceId} shape={geoJson}>
      <LineLayer
        id="bounding-box-layer"
        sourceID={sourceId}
        style={{
          lineColor: "red",
          lineOpacity: 1.0, // Full opacity
          lineWidth: 5, // Thicker line
          lineDasharray: [6, 3], // Dashed line pattern
          lineTranslateAnchor: "viewport", // Align to viewport instead of map
        }}
      />
    </ShapeSource>
  );
};

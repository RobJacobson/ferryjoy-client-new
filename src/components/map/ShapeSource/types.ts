// Common types for ShapeSource component that work across platforms

// Import GeoJSON types from the geojson package for proper typing
import type { Feature, FeatureCollection, Geometry } from "geojson";

// Mapbox expression types for style properties
export type MapboxExpression =
  | string
  | number
  | boolean
  | null
  | Array<string | number | boolean | null | MapboxExpression>
  | { [key: string]: MapboxExpression };

// Filter expression type for Mapbox GL JS
export type FilterExpression = Array<
  string | number | boolean | null | FilterExpression
>;

// GeoJSON shape type using proper GeoJSON types
export type GeoJSONShape = Feature | FeatureCollection | Geometry;

// Common props for both platforms
export interface ShapeSourceBaseProps {
  id: string;
  shape?: GeoJSONShape;
  cluster?: boolean;
  clusterRadius?: number;
  buffer?: number;
  tolerance?: number;
  lineMetrics?: boolean;
  generateId?: boolean;
  children?: React.ReactElement | React.ReactElement[];
}

// Web-only props
export interface ShapeSourceWebProps extends ShapeSourceBaseProps {
  url?: string;
  clusterMaxZoom?: number;
  clusterProperties?: Record<string, [string, MapboxExpression]>;
  maxzoom?: number;
  promoteId?: string;
  filter?: FilterExpression;
  prefetch?: number;
  ttl?: number;
  update?: {
    data?: GeoJSONShape;
    coordinates?: [number, number];
    [key: string]: unknown;
  };
  attribution?: string;
}

// Native-only props (just the base)
export type ShapeSourceProps = ShapeSourceBaseProps;

// Example usage:
//
// // Simple GeoJSON source
// <ShapeSource
//   id="vessels"
//   shape={vesselGeoJSON}
// >
//   <CircleLayer id="vessel-circles" />
// </ShapeSource>
//
// // With clustering
// <ShapeSource
//   id="vessels"
//   shape={vesselGeoJSON}
//   cluster={true}
//   clusterRadius={50}
//   clusterMaxZoom={14}
// >
//   <CircleLayer id="vessel-circles" />
// </ShapeSource>

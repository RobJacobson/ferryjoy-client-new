// Common types for ShapeSource component that work across platforms

import type {
  FilterExpression,
  GeoJSONShape,
  MapboxExpression,
} from "../types";

// Common props for both platforms
export type ShapeSourceBaseProps = {
  id: string;
  shape?: GeoJSONShape;
  cluster?: boolean;
  clusterRadius?: number;
  buffer?: number;
  tolerance?: number;
  lineMetrics?: boolean;
  generateId?: boolean;
  children?: React.ReactElement | React.ReactElement[];
};

// Web-only props
export type ShapeSourceWebProps = ShapeSourceBaseProps & {
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
};

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

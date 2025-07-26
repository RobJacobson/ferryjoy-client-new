// Shared types for Mapbox components that work across platforms

// Import GeoJSON types from the geojson package for proper typing
import type { Feature, FeatureCollection, Geometry } from "geojson";

/**
 * Mapbox expression types for style properties
 * Used across all layer components for dynamic styling
 */
export type MapboxExpression =
  | string
  | number
  | boolean
  | null
  | Array<string | number | boolean | null | MapboxExpression>
  | { [key: string]: MapboxExpression };

/**
 * Filter expression type for Mapbox GL JS
 * Used for filtering features in layers
 */
export type FilterExpression = Array<
  string | number | boolean | null | FilterExpression
>;

/**
 * GeoJSON shape type using proper GeoJSON types
 * Used for ShapeSource component
 */
export type GeoJSONShape = Feature | FeatureCollection | Geometry;

/**
 * Anchor type that works for both platforms
 * Used for MarkerView component positioning
 */
export type Anchor =
  | "center"
  | "top"
  | "bottom"
  | "left"
  | "right"
  | "top-left"
  | "top-right"
  | "bottom-left"
  | "bottom-right"
  | { x: number; y: number };

/**
 * Common transition properties for style properties
 * Used across layer components for animated style changes
 */
export type StyleTransition = {
  duration?: number;
  delay?: number;
};

/**
 * Common layer props type
 * Base type for all layer components
 */
export type BaseLayerProps = {
  id: string;
  sourceID?: string;
  sourceLayerID?: string;
  filter?: FilterExpression;
  minZoomLevel?: number;
  maxZoomLevel?: number;
};

/**
 * Common coordinate type
 * Used for camera positioning and marker coordinates
 * Format: [longitude, latitude] - longitude first, then latitude
 * Example: [-122.3321, 47.6062] for Seattle, WA
 */
export type Coordinate = [number, number]; // [longitude, latitude]

/**
 * Common animation modes for camera
 * Used for Camera component animations
 */
export type AnimationMode = "flyTo" | "easeTo" | "linearTo";

/**
 * Common alignment types for layer properties
 * Used across various layer style properties
 */
export type Alignment = "map" | "viewport" | "auto";

/**
 * Common icon anchor types
 * Used for SymbolLayer icon positioning
 */
export type IconAnchor =
  | "center"
  | "left"
  | "right"
  | "top"
  | "bottom"
  | "top-left"
  | "top-right"
  | "bottom-left"
  | "bottom-right";

/**
 * Common text anchor types
 * Used for SymbolLayer text positioning
 */
export type TextAnchor = IconAnchor;

/**
 * Common line join types
 * Used for LineLayer styling
 */
export type LineJoin = "bevel" | "round" | "miter";

/**
 * Common line cap types
 * Used for LineLayer styling
 */
export type LineCap = "butt" | "round" | "square";

/**
 * Common text justify types
 * Used for SymbolLayer text alignment
 */
export type TextJustify = "auto" | "left" | "center" | "right";

/**
 * Common text transform types
 * Used for SymbolLayer text transformation
 */
export type TextTransform = "none" | "uppercase" | "lowercase";

/**
 * Common symbol placement types
 * Used for SymbolLayer placement
 */
export type SymbolPlacement = "point" | "line" | "line-center";

/**
 * Common symbol z-order types
 * Used for SymbolLayer z-ordering
 */
export type SymbolZOrder = "auto" | "source" | "viewport-y";

/**
 * Common overlap types
 * Used for layer overlap behavior
 */
export type Overlap = "never" | "always" | "cooperative";

/**
 * Common icon text fit types
 * Used for SymbolLayer icon text fitting
 */
export type IconTextFit = "none" | "width" | "height" | "both";

/**
 * Common text writing mode types
 * Used for SymbolLayer text writing direction
 */
export type TextWritingMode = "horizontal" | "vertical";

/**
 * Common pitch alignment types
 * Used for layer pitch alignment
 */
export type PitchAlignment = "map" | "viewport" | "auto";

/**
 * Common rotation alignment types
 * Used for layer rotation alignment
 */
export type RotationAlignment = "map" | "viewport" | "auto" | "horizon";

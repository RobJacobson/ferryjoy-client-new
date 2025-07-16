import { Source } from "react-map-gl/mapbox";

import type { ShapeSourceWebProps } from "./types";

// Web implementation using react-map-gl/mapbox
export const ShapeSource = ({
  id,
  shape,
  url,
  cluster = false,
  clusterRadius = 50,
  clusterMaxZoom = 14,
  clusterProperties,
  maxzoom,
  buffer,
  tolerance,
  lineMetrics = false,
  generateId = false,
  promoteId,
  filter,
  prefetch,
  ttl,
  update,
  attribution,
  children,
}: ShapeSourceWebProps) => {
  // Validate required props
  if (!id || id.trim() === "") {
    return null;
  }

  console.log(`ShapeSource ${id}: Rendering with data`, {
    shape,
    url,
    childrenCount: Array.isArray(children) ? children.length : children ? 1 : 0,
  });

  // Determine the source type based on props
  const sourceType = "geojson";

  // Build the source data object
  const sourceData = url || shape;

  // Build the source options
  const sourceOptions: Record<string, unknown> = {};

  if (cluster) {
    sourceOptions.cluster = cluster;
    sourceOptions.clusterRadius = clusterRadius;
    sourceOptions.clusterMaxZoom = clusterMaxZoom;
    if (clusterProperties !== undefined) {
      sourceOptions.clusterProperties = clusterProperties;
    }
  }

  if (maxzoom !== undefined) sourceOptions.maxzoom = maxzoom;
  if (buffer !== undefined) sourceOptions.buffer = buffer;
  if (tolerance !== undefined) sourceOptions.tolerance = tolerance;
  if (lineMetrics !== undefined) sourceOptions.lineMetrics = lineMetrics;
  if (generateId !== undefined) sourceOptions.generateId = generateId;
  if (promoteId !== undefined) sourceOptions.promoteId = promoteId;
  if (filter !== undefined) sourceOptions.filter = filter;
  if (prefetch !== undefined) sourceOptions.prefetch = prefetch;
  if (ttl !== undefined) sourceOptions.ttl = ttl;
  if (update !== undefined) sourceOptions.update = update;
  if (attribution !== undefined) sourceOptions.attribution = attribution;

  return (
    <Source id={id} type={sourceType} data={sourceData} {...sourceOptions}>
      {children}
    </Source>
  );
};

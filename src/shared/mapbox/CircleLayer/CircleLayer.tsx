import Mapbox from "@rnmapbox/maps";

import type { CircleLayerProps } from "./types";

// Native implementation using @rnmapbox/maps
export const CircleLayer = ({
  id,
  sourceID,
  sourceLayerID,
  filter,
  minZoomLevel,
  maxZoomLevel,
  style,
}: CircleLayerProps) => {
  return (
    <Mapbox.CircleLayer
      id={id}
      sourceID={sourceID}
      sourceLayerID={sourceLayerID}
      filter={filter}
      minZoomLevel={minZoomLevel}
      maxZoomLevel={maxZoomLevel}
      style={style}
    />
  );
};

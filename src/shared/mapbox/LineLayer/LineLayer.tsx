import Mapbox from "@rnmapbox/maps";

import type { LineLayerProps } from "./types";

// Native implementation using @rnmapbox/maps
export const LineLayer = ({
  id,
  sourceID,
  sourceLayerID,
  filter,
  minZoomLevel,
  maxZoomLevel,
  style,
}: LineLayerProps) => {
  return (
    <Mapbox.LineLayer
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

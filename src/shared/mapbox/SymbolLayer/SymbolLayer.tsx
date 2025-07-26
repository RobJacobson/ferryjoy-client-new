import Mapbox from "@rnmapbox/maps";

import type { SymbolLayerProps } from "./types";

// Native implementation using @rnmapbox/maps
export const SymbolLayer = ({
  id,
  sourceID,
  sourceLayerID,
  filter,
  minZoomLevel,
  maxZoomLevel,
  style,
}: SymbolLayerProps) => {
  return (
    <Mapbox.SymbolLayer
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

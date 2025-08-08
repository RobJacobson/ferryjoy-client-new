/** biome-ignore lint/suspicious/noExplicitAny: @rnmapbox/maps typing issue */
import Mapbox from "@rnmapbox/maps";

import type { ShapeSourceProps } from "./types";

// Native implementation using @rnmapbox/maps
export const ShapeSource = ({
  id,
  shape,
  cluster,
  clusterRadius,
  buffer,
  tolerance,
  lineMetrics,
  children,
}: ShapeSourceProps) => {
  return (
    <Mapbox.ShapeSource
      id={id}
      shape={shape}
      cluster={cluster}
      clusterRadius={clusterRadius}
      buffer={buffer}
      tolerance={tolerance}
      // @ts-ignore: @rnmapbox/maps typing issue
      lineMetrics={lineMetrics ? 1 : undefined}
    >
      {children}
    </Mapbox.ShapeSource>
  );
};

import type { Marker as MapboxMarker } from "mapbox-gl";
import { type PropsWithChildren, useEffect, useRef } from "react";
import * as ReactMapGL from "react-map-gl/mapbox";
import { View } from "react-native";

import type { Anchor } from "../types";
import type { MarkerViewProps } from "./types";

/**
 * Converts anchor object to string for web compatibility
 */
const convertAnchorToString = (anchor?: Anchor): string => {
  if (!anchor) return "center";
  if (typeof anchor === "string") return anchor;

  // Convert object anchor to string
  const { x, y } = anchor;
  if (x === 0.5 && y === 0.5) return "center";
  if (x === 0.5 && y === 0) return "top";
  if (x === 0.5 && y === 1) return "bottom";
  if (x === 0 && y === 0.5) return "left";
  if (x === 1 && y === 0.5) return "right";
  if (x === 0 && y === 0) return "top-left";
  if (x === 1 && y === 0) return "top-right";
  if (x === 0 && y === 1) return "bottom-left";
  if (x === 1 && y === 1) return "bottom-right";

  // Default to center for unknown combinations
  return "center";
};

/**
 * Web implementation using react-map-gl/mapbox Marker
 * Provides marker functionality for web platforms
 */
export const MarkerView = ({
  coordinate,
  anchor = "center",
  allowOverlap = false,
  allowOverlapWithPuck = false,
  isSelected = false,
  children,
}: PropsWithChildren<MarkerViewProps>) => {
  const markerRef = useRef<MapboxMarker>(null);

  useEffect(() => {
    if (markerRef.current) {
      // Update marker properties when props change
      // Note: react-map-gl Marker doesn't have direct allowOverlap/allowOverlapWithPuck/isSelected props
      // These would need to be handled at the map level or through custom logic
    }
  }, [allowOverlap, allowOverlapWithPuck, isSelected]);

  const anchorString = convertAnchorToString(anchor);

  return (
    <ReactMapGL.Marker
      ref={markerRef}
      longitude={coordinate[0]}
      latitude={coordinate[1]}
    >
      <View className="relative">{children}</View>
    </ReactMapGL.Marker>
  );
};

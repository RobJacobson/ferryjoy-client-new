import Mapbox from "@rnmapbox/maps";
import type { PropsWithChildren } from "react";

import type { Anchor } from "../types";
import type { MarkerViewProps } from "./types";

/**
 * Converts string anchor to object format for React Native compatibility
 */
const convertAnchorToObject = (anchor?: Anchor): { x: number; y: number } => {
  if (!anchor) return { x: 0.5, y: 0.5 };
  if (typeof anchor === "object") return anchor;

  // Convert string anchor to object
  switch (anchor) {
    case "center":
      return { x: 0.5, y: 0.5 };
    case "top":
      return { x: 0.5, y: 0 };
    case "bottom":
      return { x: 0.5, y: 1 };
    case "left":
      return { x: 0, y: 0.5 };
    case "right":
      return { x: 1, y: 0.5 };
    case "top-left":
      return { x: 0, y: 0 };
    case "top-right":
      return { x: 1, y: 0 };
    case "bottom-left":
      return { x: 0, y: 1 };
    case "bottom-right":
      return { x: 1, y: 1 };
    default:
      return { x: 0.5, y: 0.5 };
  }
};

/**
 * Native implementation using @rnmapbox/maps MarkerView
 * Provides marker functionality for React Native platforms
 */
export const MarkerView = ({
  coordinate,
  anchor = "center",
  allowOverlap = false,
  allowOverlapWithPuck = false,
  isSelected = false,
  children,
}: PropsWithChildren<MarkerViewProps>) => {
  const anchorObject = convertAnchorToObject(anchor);

  return (
    <Mapbox.MarkerView
      coordinate={coordinate}
      anchor={anchorObject}
      allowOverlap={allowOverlap}
      allowOverlapWithPuck={allowOverlapWithPuck}
      isSelected={isSelected}
    >
      {children}
    </Mapbox.MarkerView>
  );
};

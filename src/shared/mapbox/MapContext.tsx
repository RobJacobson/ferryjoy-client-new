import { createContext } from "react";

/**
 * Type for map instance with camera control methods
 */
type MapInstance = {
  flyTo?: (options: {
    center: [number, number];
    zoom: number;
    bearing: number;
    pitch: number;
    duration: number;
  }) => void;
  fitBounds?: (
    bounds: [number, number][],
    options?: { padding?: number; duration?: number }
  ) => void;
};

/**
 * Internal context for mapbox components to share map instance.
 * This is internal implementation detail, not for external use.
 */
export const MapContext = createContext<MapInstance | null>(null);

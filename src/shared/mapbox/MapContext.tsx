import { createContext } from "react";

/**
 * Internal context for mapbox components to share map instance.
 * This is internal implementation detail, not for external use.
 */
export const MapContext = createContext<any>(null);

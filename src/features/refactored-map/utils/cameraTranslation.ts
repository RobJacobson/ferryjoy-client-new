/**
 * Camera translation utilities for mapbox APIs
 * Handles conversion between native camera state and web view state formats
 */

// Import and re-export ViewState type from react-map-gl
import type { ViewState } from "react-map-gl/mapbox";
export type { ViewState };

// Import and re-export MapState type from @rnmapbox/maps
import type { MapState } from "@rnmapbox/maps";
export type { MapState };

/**
 * Native camera state type (canonical format)
 * Used as the standard format across the application
 */
export type CameraState = {
  centerCoordinate: NativeCoordinates;
  zoomLevel: number;
  heading: number;
  pitch: number;
};

/**
 * Coordinate type definitions
 * NativeCoordinates is the canonical format used throughout the application
 */
export type NativeCoordinates = readonly [number, number];

export type ApiCoordinates = {
  Longitude: number;
  Latitude: number;
};

/**
 * Convert coordinate format from API to native
 * API: { Longitude, Latitude } as object
 * Native: [longitude, latitude] as array
 */
export const toNativeCoordinates = (
  coords: ApiCoordinates
): NativeCoordinates => [coords.Longitude, coords.Latitude];

/**
 * Convert native camera state to web view state format for react-map-gl
 */
export const toWebViewState = (cameraState: CameraState) => ({
  longitude: cameraState.centerCoordinate[0],
  latitude: cameraState.centerCoordinate[1],
  zoom: cameraState.zoomLevel,
  bearing: cameraState.heading,
  pitch: cameraState.pitch,
});

/**
 * Convert @rnmapbox/maps camera change event to CameraState
 * Uses the MapState type from @rnmapbox/maps
 */
export const fromNativeMapState = (state: MapState): CameraState => ({
  centerCoordinate: [state.properties.center[0], state.properties.center[1]],
  zoomLevel: state.properties.zoom,
  heading: state.properties.heading,
  pitch: state.properties.pitch,
});

/**
 * Convert react-map-gl ViewState to CameraState
 * Uses the ViewState type from react-map-gl
 */
export const fromWebViewState = (viewState: ViewState): CameraState => ({
  centerCoordinate: [viewState.longitude, viewState.latitude],
  zoomLevel: viewState.zoom,
  heading: viewState.bearing || 0,
  pitch: viewState.pitch || 0,
});

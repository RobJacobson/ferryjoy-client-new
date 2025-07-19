// Common types for Camera component that work across platforms

import type { ForwardedRef } from "react";

/**
 * Camera bounds for fitBounds operations
 */
export type CameraBounds = {
  ne: [number, number];
  sw: [number, number];
};

/**
 * Props for the Camera component
 */
export type CameraProps = {
  centerCoordinate?: [number, number];
  zoomLevel?: number;
  heading?: number;
  pitch?: number;
  animationDuration?: number;
  animationMode?: "flyTo" | "easeTo" | "linearTo";
};

/**
 * Ref interface for Camera component
 */
export type CameraRef = {
  fitBounds: (
    ne: [number, number],
    sw: [number, number],
    paddingConfig?: number | number[],
    animationDuration?: number
  ) => void;
  flyTo: (
    centerCoordinate: [number, number],
    zoomLevel: number,
    heading: number,
    pitch: number,
    animationDuration?: number
  ) => void;
};

/**
 * Shared utility to create fitBounds imperative handle
 * Reduces code duplication between web and native Camera components
 */
export const createFitBoundsHandle = (mapInstance: any) => ({
  fitBounds: (
    ne: [number, number],
    sw: [number, number],
    paddingConfig?: number | number[],
    animationDuration?: number
  ) => {
    if (mapInstance?.fitBounds) {
      mapInstance.fitBounds([sw, ne], {
        padding: typeof paddingConfig === "number" ? paddingConfig : undefined,
        duration: animationDuration,
      });
    }
  },
  flyTo: (
    centerCoordinate: [number, number],
    zoomLevel: number,
    heading: number,
    pitch: number,
    animationDuration?: number
  ) => {
    if (mapInstance?.flyTo) {
      mapInstance.flyTo({
        center: centerCoordinate,
        zoom: zoomLevel,
        bearing: heading,
        pitch: pitch,
        duration: animationDuration,
      });
    }
  },
});

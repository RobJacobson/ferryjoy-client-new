/**
 * Web implementation of Map component
 * Uses react-map-gl/mapbox directly without abstraction layers
 */

import { useEffect, useRef, useState } from "react";
import MapboxGL, {
  type MapRef,
  type ViewStateChangeEvent,
} from "react-map-gl/mapbox";

import { useMapState } from "@/shared/contexts";

import {
  createCameraStateHandler,
  toWebViewState,
  webViewStateToCameraState,
} from "./cameraState";
import { DEFAULT_MAP_PROPS, type MapProps, styles } from "./shared";

/**
 * Map component for web platform
 * Uses react-map-gl MapGL component with viewState management
 */
export const MapComponent = ({
  mapStyle = DEFAULT_MAP_PROPS.mapStyle,
  children,
  onCameraStateChange,
}: MapProps) => {
  const { cameraState, updateCameraState, updateMapDimensions } = useMapState();
  const [mapInstance, setMapInstance] = useState<MapRef | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleCameraStateChange = createCameraStateHandler(
    updateCameraState,
    onCameraStateChange
  );

  // Convert native camera state to web format for react-map-gl
  const webViewState = toWebViewState(cameraState);

  // Set up ResizeObserver to track container size changes
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Initial measurement
    const updateDimensions = () => {
      const width = container.offsetWidth;
      const height = container.offsetHeight;
      updateMapDimensions(width, height);
    };

    // Measure immediately
    updateDimensions();

    // Set up ResizeObserver for future changes
    const resizeObserver = new ResizeObserver(() => {
      updateDimensions();
    });

    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
    };
  }, [updateMapDimensions]);

  return (
    <div ref={containerRef} style={{ flex: 1, position: "relative" }}>
      <MapboxGL
        ref={setMapInstance}
        viewState={webViewState}
        style={{ width: "100%", height: "100%" }}
        mapStyle={mapStyle}
        projection="mercator"
        onMove={(evt: ViewStateChangeEvent) =>
          handleCameraStateChange(webViewStateToCameraState(evt.viewState))
        }
        reuseMaps
        mapboxAccessToken={process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN}
      >
        {children}
      </MapboxGL>
    </div>
  );
};

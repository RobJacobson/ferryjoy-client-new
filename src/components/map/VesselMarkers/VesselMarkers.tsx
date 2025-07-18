import { useMemo } from "react";
import { Text, View } from "react-native";
import type { VesselLocation } from "wsdot-api-client";

import { MarkerView } from "@/components/mapbox/MarkerView";
import { useMapState } from "@/data/contexts/MapStateContext";
import { useVesselPositions } from "@/data/contexts/VesselPositionsContext";
import { cn } from "@/lib/utils";

import {
  MARKER_DIMENSIONS,
  Z_INDEX,
  ZOOM_CONFIG,
} from "./vesselMarkerConstants";
import {
  calculateEtaMinutes,
  calculatePerspectiveFactor,
  getVesselAccessibilityLabel,
  getVesselZIndex,
  lerpZoom,
} from "./vesselMarkerUtils";

/**
 * Displays vessel positions as individual markers with ETA labels and direction indicators
 */
const VesselMarkers = () => {
  const { animatedVessels: smoothedVessels } = useVesselPositions();
  const {
    pitch,
    zoom,
    latitude: centerLatitude,
    longitude: centerLongitude,
  } = useMapState();

  const scale = useMemo(() => {
    const zoomScale = lerpZoom(
      zoom,
      ZOOM_CONFIG.MIN_ZOOM,
      ZOOM_CONFIG.MAX_ZOOM,
      ZOOM_CONFIG.MAX_SCALE
    );
    return zoomScale;
  }, [zoom]);

  // Sort vessels by z-index to ensure proper layering
  // Mapbox markers are rendered in the order they're added to the map,
  // not based on React Native's z-index values. This sorting ensures
  // that lower-priority vessels (OUT_OF_SERVICE) are added first (behind)
  // and higher-priority vessels (IN_TRANSIT) are added last (on top).
  const sortedVessels = useMemo(() => {
    if (!smoothedVessels?.length) return [];

    return [...smoothedVessels].sort(
      (a, b) => getVesselZIndex(a) - getVesselZIndex(b)
    );
  }, [smoothedVessels]);

  // Don't render if there are no vessels
  if (!sortedVessels?.length) {
    return null;
  }

  return sortedVessels.map((vessel) => (
    <VesselMarker
      key={`vessel-${vessel.VesselID}`}
      vessel={vessel}
      scale={scale}
      pitch={pitch}
    />
  ));
};

/**
 * Single vessel marker with circle and direction indicator
 */
const VesselMarker = ({
  vessel,
  scale,
  pitch,
}: {
  vessel: VesselLocation;
  scale: number;
  pitch: number;
}) => {
  const {
    heading: mapHeading,
    latitude: centerLatitude,
    longitude: centerLongitude,
  } = useMapState();

  // Calculate perspective factor for this specific vessel
  const perspectiveFactor = calculatePerspectiveFactor(
    pitch,
    vessel.Latitude,
    vessel.Longitude,
    centerLatitude,
    centerLongitude,
    mapHeading
  );

  // Apply perspective scaling to the base zoom scale
  const finalScale = scale * perspectiveFactor;

  return (
    <MarkerView
      coordinate={[vessel.Longitude, vessel.Latitude]}
      anchor={{ x: 0.5, y: 0.5 }}
      allowOverlap={true}
      allowOverlapWithPuck={false}
    >
      <View
        className="items-center justify-center relative"
        style={{
          transform: [
            { rotateX: `${pitch.toFixed(2)}deg` },
            { scale: finalScale },
          ],
          width: MARKER_DIMENSIONS.CONTAINER_SIZE,
          height: MARKER_DIMENSIONS.CONTAINER_SIZE,
        }}
        accessibilityRole="image"
        accessibilityLabel={getVesselAccessibilityLabel(vessel)}
        accessibilityHint="Double tap to get more information about this ferry"
      >
        <DirectionIndicator vessel={vessel} mapHeading={mapHeading} />
        <VesselCircle vessel={vessel} />
      </View>
    </MarkerView>
  );
};

/**
 * Vessel circle with ETA display
 */
const VesselCircle = ({ vessel }: { vessel: VesselLocation }) => (
  <View
    className={cn(
      "rounded-full border bg-pink-200 border-pink-500 items-center justify-center",
      vessel.InService ? "opacity-100" : "opacity-25"
    )}
    style={{
      width: MARKER_DIMENSIONS.VESSEL_CIRCLE_SIZE,
      height: MARKER_DIMENSIONS.VESSEL_CIRCLE_SIZE,
    }}
  >
    <EtaLabel vessel={vessel} />
  </View>
);

/**
 * ETA label component
 */
const EtaLabel = ({ vessel }: { vessel: VesselLocation }) => {
  const etaMinutes = calculateEtaMinutes(vessel.Eta);

  if (etaMinutes === null) return null;

  return (
    <Text className="text-5xl font-bold text-center text-pink-500">
      {etaMinutes}
    </Text>
  );
};

/**
 * Direction arrow indicator
 */
const DirectionIndicator = ({
  vessel,
  mapHeading,
}: {
  vessel: VesselLocation;
  mapHeading: number;
}) => (
  <View
    className="absolute items-center"
    style={{
      width: MARKER_DIMENSIONS.DIRECTION_INDICATOR_SIZE,
      height: MARKER_DIMENSIONS.DIRECTION_INDICATOR_SIZE,
      transform: [{ rotate: `${vessel.Heading - mapHeading}deg` }],
    }}
  >
    <View
      className={cn(
        "bg-pink-600 rounded-lg rotate-45 mt-0",
        vessel.InService ? "visible" : "invisible"
      )}
      style={{
        width: MARKER_DIMENSIONS.ARROW_SIZE,
        height: MARKER_DIMENSIONS.ARROW_SIZE,
      }}
    />
  </View>
);

export default VesselMarkers;

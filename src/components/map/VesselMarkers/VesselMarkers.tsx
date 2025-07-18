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
  getVesselAccessibilityLabel,
  getVesselZIndex,
  lerpZoom,
} from "./vesselMarkerUtils";

/**
 * Displays vessel positions as individual markers with ETA labels and direction indicators
 */
const VesselMarkers = () => {
  const { animatedVessels: smoothedVessels } = useVesselPositions();
  const { pitch, zoom } = useMapState();

  const scale = useMemo(() => {
    return lerpZoom(
      zoom,
      ZOOM_CONFIG.MIN_ZOOM,
      ZOOM_CONFIG.MAX_ZOOM,
      ZOOM_CONFIG.MAX_SCALE
    );
  }, [zoom]);

  // Don't render if there are no vessels
  if (!smoothedVessels?.length) {
    return null;
  }

  return (
    <>
      {smoothedVessels.map((vessel) => (
        <VesselMarker
          key={`vessel-${vessel.VesselID}`}
          vessel={vessel}
          scale={scale}
          pitch={pitch}
        />
      ))}
    </>
  );
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
  const { heading: mapHeading } = useMapState();
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
          transform: [{ rotateX: `${pitch.toFixed(2)}deg` }, { scale }],
          width: MARKER_DIMENSIONS.CONTAINER_SIZE,
          height: MARKER_DIMENSIONS.CONTAINER_SIZE,
          zIndex: getVesselZIndex(vessel),
        }}
        accessibilityRole="image"
        accessibilityLabel={getVesselAccessibilityLabel(vessel)}
        accessibilityHint="Double tap to get more information about this ferry"
      >
        <VesselCircle vessel={vessel} />
        <DirectionIndicator vessel={vessel} mapHeading={mapHeading} />
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
      "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border bg-pink-200 border-pink-500",
      vessel.InService ? "opacity-100" : "opacity-25"
    )}
    style={{
      width: MARKER_DIMENSIONS.VESSEL_CIRCLE_SIZE,
      height: MARKER_DIMENSIONS.VESSEL_CIRCLE_SIZE,
      zIndex: Z_INDEX.VESSEL_CIRCLE,
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
    <Text className="text-4xl absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-bold text-center text-pink-500">
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

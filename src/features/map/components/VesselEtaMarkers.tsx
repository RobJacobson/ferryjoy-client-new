import { useMemo } from "react";
import { Text } from "react-native";
import type { VesselLocation } from "ws-dottie";

import { useMapState } from "@/shared/contexts/MapStateContext";
import { useVesselLocation } from "@/shared/contexts/VesselLocationContext";
import { calculateEtaMinutes } from "@/shared/lib/utils/eta";
import { MarkerView } from "@/shared/mapbox/MarkerView";

/**
 * Component that renders ETA labels for vessels on the map
 * Only shows labels for vessels with valid ETA information
 */
const VesselEtaMarkers = () => {
  const { zoom } = useMapState();
  const { vesselLocations } = useVesselLocation();

  // Only show ETA labels when zoomed in enough
  const shouldShowEtaLabels = zoom >= 10;

  const etaMarkers = useMemo(() => {
    if (!shouldShowEtaLabels || !vesselLocations.length) return [];

    return vesselLocations
      .map((vessel: VesselLocation) => {
        const etaMinutes = calculateEtaMinutes(vessel);
        if (!etaMinutes) return null;

        return (
          <MarkerView
            key={`eta-${vessel.VesselID}`}
            coordinate={[vessel.Longitude, vessel.Latitude]}
            anchor={{ x: 0.5, y: -0.5 }}
          >
            <Text className="text-xs font-bold text-pink-800 bg-white/90 px-1 py-0.5 rounded">
              {etaMinutes}
            </Text>
          </MarkerView>
        );
      })
      .filter(Boolean);
  }, [vesselLocations, shouldShowEtaLabels]);

  if (!shouldShowEtaLabels) return null;

  return <>{etaMarkers}</>;
};

export default VesselEtaMarkers;

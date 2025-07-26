import { useMemo } from "react";
import { Text, View } from "react-native";
import type { VesselLocation } from "ws-dottie";

import { useMapState } from "@/shared/contexts/MapStateContext";
import { useVesselLocation } from "@/shared/contexts/VesselLocationContext";
import { cn } from "@/shared/lib/utils/cn";
import { MarkerView } from "@/shared/mapbox/MarkerView";

/**
 * Component that renders vessel markers on the map
 * Uses smoothed vessel data for fluid animations
 */
const VesselMarkers = () => {
  const { zoom } = useMapState();
  const { vesselLocations } = useVesselLocation();

  // Only show vessels when zoomed in enough
  const shouldShowVessels = zoom >= 8;

  const vesselMarkers = useMemo(() => {
    if (!shouldShowVessels || !vesselLocations.length) return [];

    return vesselLocations.map((vessel: VesselLocation) => {
      return (
        <MarkerView
          key={vessel.VesselID}
          coordinate={[vessel.Longitude, vessel.Latitude]}
          anchor={{ x: 0.5, y: 0.5 }}
        >
          <View
            className={cn(
              "w-3 h-3 rounded-full border-2 border-white shadow-sm",
              vessel.InService ? "bg-pink-200" : "bg-gray-300"
            )}
          />
        </MarkerView>
      );
    });
  }, [vesselLocations, shouldShowVessels]);

  if (!shouldShowVessels) return null;

  return <>{vesselMarkers}</>;
};

export default VesselMarkers;

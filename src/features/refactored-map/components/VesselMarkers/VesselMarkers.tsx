import { TouchableOpacity } from "react-native";
import type { VesselLocation } from "ws-dottie";

import { useBottomSheet, useMapState } from "@/shared/contexts";
import { log } from "@/shared/lib/logger";
import { cn } from "@/shared/lib/utils/cn";
import { MarkerView } from "@/shared/mapbox/MarkerView";

/**
 * Component that renders vessel markers on the map
 */
const VesselMarkers = ({
  vesselLocations,
}: {
  vesselLocations: VesselLocation[];
}) => {
  const { zoom, pitch } = useMapState();
  const { openBottomSheet } = useBottomSheet();

  // Only show vessels when zoomed in enough
  const shouldShowVessels = zoom >= 8;
  if (!shouldShowVessels) return null;

  return vesselLocations.map((vessel: VesselLocation) => {
    const handleVesselPress = () => {
      openBottomSheet({
        id: vessel.VesselID.toString(),
        name: vessel.VesselName || `Vessel ${vessel.VesselID}`,
        type: "vessel",
        data: vessel,
      });
    };

    log.info("vessel", { vessel });

    return (
      <MarkerView
        key={`${vessel.VesselID}`}
        coordinate={[vessel.Longitude, vessel.Latitude]}
        anchor="bottom"
        allowOverlap={true}
      >
        <TouchableOpacity
          onPress={handleVesselPress}
          // style={{
          //   transform: [{ scale: 1 }, { rotateX: `${-pitch}deg` }],
          // }}
          className={cn(
            "w-6 h-6 rounded-full border-2 border-white shadow-sm",
            vessel.InService ? "bg-pink-200" : "bg-gray-300"
          )}
        />
      </MarkerView>
    );
  });
};

export default VesselMarkers;

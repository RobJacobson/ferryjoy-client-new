import React, { useCallback } from "react";
import { TouchableOpacity } from "react-native";
import type { VesselLocation } from "ws-dottie";

import { useBottomSheet, useMapState } from "@/shared/contexts";
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
  const { zoom } = useMapState();
  const { openBottomSheet } = useBottomSheet();

  const handleVesselPress = useCallback(
    (vessel: VesselLocation) => () => {
      openBottomSheet({
        id: vessel.VesselID.toString(),
        name: vessel.VesselName || `Vessel ${vessel.VesselID}`,
        type: "vessel",
        data: vessel,
      });
    },
    [openBottomSheet]
  );

  // Only show vessels when zoomed in enough
  const shouldShowVessels = zoom >= 8;
  if (!shouldShowVessels) return null;

  return vesselLocations.map((vessel: VesselLocation) => {
    return (
      <MarkerView
        key={`${vessel.VesselID}`}
        coordinate={[vessel.Longitude, vessel.Latitude]}
        anchor="bottom"
        allowOverlap={true}
      >
        <TouchableOpacity
          onPress={handleVesselPress(vessel)}
          className={cn(
            "w-6 h-6 rounded-full border-2 border-white shadow-sm",
            vessel.InService ? "bg-pink-200" : "bg-gray-300"
          )}
        />
      </MarkerView>
    );
  });
};

export default React.memo(VesselMarkers);

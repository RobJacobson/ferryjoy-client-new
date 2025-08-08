import type { VesselLocation } from "ws-dottie";

import { useBottomSheet, useMapState } from "@/shared/contexts";
import { MarkerView } from "@/shared/mapbox/MarkerView";

import { Marker } from "./Marker";
import { createVesselPressHandler, shouldShowVessels } from "./shared";

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

  // Only show vessels when zoomed in enough
  if (!shouldShowVessels(zoom)) return null;

  return vesselLocations.map((vessel: VesselLocation) => {
    const handleVesselPress = createVesselPressHandler(vessel, openBottomSheet);

    return (
      <MarkerView
        key={`${vessel.VesselID}`}
        coordinate={[vessel.Longitude, vessel.Latitude]}
        anchor="bottom"
        allowOverlap={true}
      >
        <Marker vessel={vessel} onPress={handleVesselPress} />
      </MarkerView>
    );
  });
};

export default VesselMarkers;

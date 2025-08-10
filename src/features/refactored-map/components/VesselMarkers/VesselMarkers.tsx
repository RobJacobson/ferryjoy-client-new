import MapboxRN from "@rnmapbox/maps";
import type { VesselLocation } from "ws-dottie";

import { useBottomSheet, useMapState } from "@/shared/contexts";

import { ScaledMarker } from "./ScaledMarker";
import { createVesselPressHandler, shouldShowVessels } from "./shared";
import { VesselMarkerContent } from "./VesselMarkerContent";

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
      <MapboxRN.MarkerView
        key={`${vessel.VesselID}`}
        coordinate={[vessel.Longitude, vessel.Latitude]}
        anchor={{ x: 0.5, y: 0.5 }}
        allowOverlap={true}
      >
        <ScaledMarker
          onPress={handleVesselPress}
          latitude={vessel.Latitude}
          longitude={vessel.Longitude}
        >
          <VesselMarkerContent vessel={vessel} />
        </ScaledMarker>
      </MapboxRN.MarkerView>
    );
  });
};

export default VesselMarkers;

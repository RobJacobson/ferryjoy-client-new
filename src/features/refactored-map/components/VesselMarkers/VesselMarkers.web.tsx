import { Marker as MapboxMarker } from "react-map-gl/mapbox";
import type { VesselLocation } from "ws-dottie";

import { useBottomSheet, useMapState } from "@/shared/contexts";

import { Marker } from "./Marker";
import { createVesselPressHandler, shouldShowVessels } from "./shared";

/**
 * Component that renders vessel markers on the map (Web implementation)
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
      <MapboxMarker
        key={`${vessel.VesselID}`}
        longitude={vessel.Longitude}
        latitude={vessel.Latitude}
        anchor="center"
      >
        <Marker vessel={vessel} onPress={handleVesselPress} />
      </MapboxMarker>
    );
  });
};

export default VesselMarkers;

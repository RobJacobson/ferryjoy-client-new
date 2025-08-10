import { Marker as MapboxMarker } from "react-map-gl/mapbox";
import type { VesselLocation } from "ws-dottie";

import { useBottomSheet, useMapState } from "@/shared/contexts";

import { DirectionIndicator } from "./DirectionIndicator";
import { ScaledMarker } from "./ScaledMarker";
import { createVesselPressHandler, shouldShowVessels } from "./shared";
import { VesselMarkerContent } from "./VesselMarkerContent";

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
        <ScaledMarker
          onPress={handleVesselPress}
          latitude={vessel.Latitude}
          longitude={vessel.Longitude}
        >
          <DirectionIndicator vessel={vessel} size={96} className="z-0" />
          <VesselMarkerContent vessel={vessel} />
        </ScaledMarker>
      </MapboxMarker>
    );
  });
};

export default VesselMarkers;

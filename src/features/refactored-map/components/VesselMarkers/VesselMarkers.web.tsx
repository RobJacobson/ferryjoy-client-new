import { Marker } from "react-map-gl/mapbox";
import type { VesselLocation } from "ws-dottie";

import { useMapState } from "@/shared/contexts";

import { shouldShowVessels } from "./shared";
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

  // Only show vessels when zoomed in enough
  if (!shouldShowVessels(zoom)) return null;

  return vesselLocations.map((vessel: VesselLocation) => (
    <Marker
      key={vessel.VesselID}
      longitude={vessel.Longitude}
      latitude={vessel.Latitude}
      anchor="bottom"
    >
      <VesselMarkerContent vessel={vessel} />
    </Marker>
  ));
};

export default VesselMarkers;

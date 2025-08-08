import MapboxRN from "@rnmapbox/maps";
import type { VesselLocation } from "ws-dottie";

import { useMapState } from "@/shared/contexts";

import { shouldShowVessels } from "./shared";
import { VesselMarkerContent } from "./VesselMarkerContent";

/**
 * Component that renders vessel markers on the map (Native implementation)
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
    <MapboxRN.MarkerView
      key={vessel.VesselID}
      coordinate={[vessel.Longitude, vessel.Latitude]}
      anchor={{ x: 0.5, y: 1 }}
      allowOverlap={true}
    >
      <VesselMarkerContent vessel={vessel} />
    </MapboxRN.MarkerView>
  ));
};

export default VesselMarkers;

import { type LayoutChangeEvent, View } from "react-native";

import { useVesselLocations } from "@/data/contexts/VesselLocationContext";
import VesselMarkers from "@/features/map/components/VesselMarkers";
import { useFlyToBoundingBox } from "@/features/map/hooks/useFlyToBoundingBox";
import { useMapState } from "@/shared/contexts";
import { MapView } from "@/shared/mapbox/MapView";

import DebugPanel from "./DebugPanel";
import { RoutesLayer } from "./RoutesLayer";
import VesselLayer from "./VesselLayer";
import { VesselLines } from "./VesselLines";

const MainMap = ({
  styleURL = "mapbox://styles/mapbox/dark-v11",
}: {
  styleURL?: string;
}) => {
  const { flyToBoundingBox } = useFlyToBoundingBox();
  const { vesselLocations } = useVesselLocations();

  return (
    <View className="flex-1">
      <MapView style={{ flex: 1 }} styleURL={styleURL} scaleBarEnabled={false}>
        <VesselMarkers vesselLocations={vesselLocations} />
        {/* <RoutesLayer /> */}
        <VesselLines vesselLocations={vesselLocations} />
        {/* <TerminalLayer /> */}
        {/* <VesselLayer /> */}
        {/* <VesselMarkers /> */}
        {/* <BoundingBoxLayer boundingBox={computedBoundingBox} /> */}
      </MapView>
      {/* <RouteSelector flyToCoordinates={flyToCoordinates} /> */}
      {/* <DebugPanel /> */}
      {/* <TerminalOverlay
        coordinates={currentCoordinates}
        terminalAbbrevs={currentTerminalAbbrevs}
        calculatedZoomLevel={calculatedZoomLevel}
      /> */}
    </View>
  );
};

export default MainMap;

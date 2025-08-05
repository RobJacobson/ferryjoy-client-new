import { type LayoutChangeEvent, View } from "react-native";

import { useFlyToBoundingBox } from "@/features/map/hooks/useFlyToBoundingBox";
// import { RouteSelector } from "@/features/routes";
import { log } from "@/shared";
import { useMapState } from "@/shared/contexts";
import { MapView } from "@/shared/mapbox/MapView";

import { BoundingBoxLayer } from "./BoundingBoxLayer";
import DebugPanel from "./DebugPanel";
import { RoutesLayer } from "./RoutesLayer";
import { TerminalLayer } from "./TerminalLayer";
import TerminalOverlay from "./TerminalOverlay";
import VesselLayer from "./VesselLayer";
import { VesselLines } from "./VesselLines";
import VesselMarkers from "./VesselMarkers/VesselMarkers";

const MainMap = ({
  style,
  styleURL = "mapbox://styles/mapbox/dark-v11",
}: {
  style?: object;
  styleURL?: string;
}) => {
  const { updateMapDimensions } = useMapState();
  const {
    flyToCoordinates,
    computedBoundingBox,
    currentCoordinates,
    currentTerminalAbbrevs,
    calculatedZoomLevel,
  } = useFlyToBoundingBox();

  const handleContainerLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    updateMapDimensions(width, height);
  };

  return (
    <View className="flex-1" style={style} onLayout={handleContainerLayout}>
      <MapView style={{ flex: 1 }} styleURL={styleURL} scaleBarEnabled={false}>
        <RoutesLayer />
        <VesselLines />
        {/* <TerminalLayer /> */}
        {/* <VesselLayer /> */}
        <VesselMarkers />
        <BoundingBoxLayer boundingBox={computedBoundingBox} />
      </MapView>
      {/* <RouteSelector flyToCoordinates={flyToCoordinates} /> */}
      <DebugPanel />
      {/* <TerminalOverlay
        coordinates={currentCoordinates}
        terminalAbbrevs={currentTerminalAbbrevs}
        calculatedZoomLevel={calculatedZoomLevel}
      /> */}
    </View>
  );
};

export default MainMap;

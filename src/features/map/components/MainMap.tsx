import { type LayoutChangeEvent, View } from "react-native";

import { useAnimatedVessels } from "@/features/map/hooks/useAnimatedVesselLocations";
import { useFlyToBoundingBox } from "@/features/map/hooks/useFlyToBoundingBox";
import { useMapState } from "@/shared/contexts";
import { MapView } from "@/shared/mapbox/MapView";

import DebugPanel from "./DebugPanel";
import { RoutesLayer } from "./RoutesLayer";
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
  const { flyToBoundingBox } = useFlyToBoundingBox();
  const animatedVesselLocations = useAnimatedVessels();

  console.log("animatedVesselLocations", animatedVesselLocations);

  const handleContainerLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    updateMapDimensions(width, height);
  };

  return (
    <View className="flex-1" style={style} onLayout={handleContainerLayout}>
      <MapView style={{ flex: 1 }} styleURL={styleURL} scaleBarEnabled={false}>
        <RoutesLayer />
        <VesselLines animatedVesselLocations={animatedVesselLocations} />
        {/* <TerminalLayer /> */}
        {/* <VesselLayer /> */}
        <VesselMarkers animatedVesselLocations={animatedVesselLocations} />
        {/* <BoundingBoxLayer boundingBox={computedBoundingBox} /> */}
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

import { type LayoutChangeEvent, View } from "react-native";

import { Camera } from "@/components/mapbox/Camera";
import { MapView } from "@/components/mapbox/MapView";
import { useMapState } from "@/data/contexts/MapStateContext";

import { RouteSelector } from "../RouteSelector";
import DebugPanel from "./DebugPanel";
import { RoutesLayer } from "./RoutesLayer";
import { TerminalLayer } from "./TerminalLayer";
import VesselMarkers from "./VesselMarkers";

const MainMap = ({
  style,
  styleURL = "mapbox://styles/mapbox/dark-v11",
}: {
  style?: object;
  styleURL?: string;
}) => {
  const { cameraPosition, cameraRef, updateMapDimensions } = useMapState();

  const handleContainerLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    updateMapDimensions(width, height);
  };

  return (
    <View className="flex-1" style={style} onLayout={handleContainerLayout}>
      <MapView style={{ flex: 1 }} styleURL={styleURL} scaleBarEnabled={false}>
        <Camera
          ref={cameraRef}
          centerCoordinate={cameraPosition.centerCoordinate}
          zoomLevel={cameraPosition.zoomLevel}
          animationDuration={10000}
          animationMode="flyTo"
          heading={0}
        />
        <RoutesLayer />
        <TerminalLayer />
        <VesselMarkers />
      </MapView>
      <RouteSelector />
      <DebugPanel />
    </View>
  );
};

export default MainMap;

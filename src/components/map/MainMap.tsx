import { type LayoutChangeEvent, View } from "react-native";

import { Camera } from "@/components/mapbox/Camera";
import { MapView } from "@/components/mapbox/MapView";
import { useMapState } from "@/data/contexts/MapStateContext";
import { useFlyToBoundingBox } from "@/hooks/useFlyToBoundingBox";

import { RouteSelector } from "../RouteSelector";
import { BoundingBoxLayer } from "./BoundingBoxLayer";
import DebugPanel from "./DebugPanel";
import { RoutesLayer } from "./RoutesLayer";
import { TerminalLayer } from "./TerminalLayer";
import TerminalOverlay from "./TerminalOverlay";
import VesselEtaMarkers from "./VesselEtaMarkers";
import VesselMarkers from "./VesselMarkers";

const MainMap = ({
  style,
  styleURL = "mapbox://styles/mapbox/dark-v11",
}: {
  style?: object;
  styleURL?: string;
}) => {
  const { cameraPosition, cameraRef, updateMapDimensions } = useMapState();
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
        <VesselEtaMarkers />
        <BoundingBoxLayer boundingBox={computedBoundingBox} />
      </MapView>
      <RouteSelector flyToCoordinates={flyToCoordinates} />
      <DebugPanel />
      <TerminalOverlay
        coordinates={currentCoordinates}
        terminalAbbrevs={currentTerminalAbbrevs}
        calculatedZoomLevel={calculatedZoomLevel}
      />
    </View>
  );
};

export default MainMap;

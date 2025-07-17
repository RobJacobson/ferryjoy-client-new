import { View } from "react-native";

import { Camera } from "@/components/mapbox/Camera";
import { MapView } from "@/components/mapbox/MapView";
import { SEATTLE_COORDINATES } from "@/lib/utils";

import { RoutesLayer } from "./RoutesLayer";
import { TerminalLayer } from "./TerminalLayer";
import VesselLayer from "./VesselLayer";

// Set the access token from environment variable
// Mapbox.setAccessToken(process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN || "");

const MainMap = ({
  style,
  zoomLevel = 10,
  centerCoordinate = SEATTLE_COORDINATES, // Seattle coordinates
  styleURL = "mapbox://styles/mapbox/dark-v11",
}: {
  style?: object;
  zoomLevel?: number;
  centerCoordinate?: [number, number];
  styleURL?: string;
}) => {
  return (
    <View style={[{ flex: 1 }, style]}>
      <MapView style={{ flex: 1 }} styleURL={styleURL} scaleBarEnabled={false}>
        <Camera
          zoomLevel={zoomLevel} // Use the target zoom level for animation
          centerCoordinate={centerCoordinate}
          animationDuration={0} // Use the animation duration
          heading={0}
          pitch={45} // Add the pitch for the animation
        />
        <RoutesLayer />
        <TerminalLayer />
        <VesselLayer />
      </MapView>
    </View>
  );
};

export default MainMap;

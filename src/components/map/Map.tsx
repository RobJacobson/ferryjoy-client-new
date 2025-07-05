import { View } from "react-native";

import { SEATTLE_COORDINATES } from "@/lib/utils";

import { Camera, MapView, StyleURL } from "./MapView";
import VesselLayer from "./VesselLayer";

const MapComponent = ({
  style,
  zoomLevel = 4,
  centerCoordinate = SEATTLE_COORDINATES, // Seattle coordinates
  styleURL = StyleURL.Dark,
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
        {/* <VesselLayer /> */}
      </MapView>
    </View>
  );
};

export default MapComponent;

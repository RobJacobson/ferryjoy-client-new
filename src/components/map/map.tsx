import Mapbox from "@rnmapbox/maps";
import { useEffect, useRef } from "react";
import { View } from "react-native";

import { SEATTLE_COORDINATES } from "@/lib/utils";

// Set the access token from environment variable
Mapbox.setAccessToken(process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN || "");

// Custom hook for map animation
const useMapAnimation = (cameraRef: React.RefObject<Mapbox.Camera | null>) => {
  useEffect(() => {
    // Wait for map to load, then animate to desired position
    const timer = setTimeout(() => {
      cameraRef.current?.setCamera({
        zoomLevel: 9,
        pitch: 30,
        animationDuration: 10000,
      });
    }, 100); // Wait 1 second for map to fully load

    return () => clearTimeout(timer);
  }, [cameraRef]);
};

const MapComponent = ({
  style,
  zoomLevel = 4,
  centerCoordinate = [-122.3321, 47.6062], // Seattle coordinates
  styleURL = Mapbox.StyleURL.Dark,
}: {
  style?: object;
  zoomLevel?: number;
  centerCoordinate?: [number, number];
  styleURL?: string;
}) => {
  const camera = useRef<Mapbox.Camera>(null);
  useMapAnimation(camera);
  return (
    <View style={[{ flex: 1 }, style]}>
      <Mapbox.MapView
        style={{ flex: 1 }}
        styleURL={styleURL}
        scaleBarEnabled={false}
      >
        <Mapbox.Camera
          zoomLevel={zoomLevel}
          centerCoordinate={centerCoordinate}
          animationDuration={0}
          heading={0}
          ref={camera}
        />
        {/* <Mapbox.Atmosphere
          style={{
            starIntensity: 0.6,
            color: "#ffffff",
            highColor: "#ffffff",
            horizonBlend: 0.1,
            spaceColor: "#000000",
          }}
        /> */}
      </Mapbox.MapView>
    </View>
  );
};

export default MapComponent;

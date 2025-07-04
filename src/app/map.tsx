import Mapbox from "@rnmapbox/maps";
import { View } from "react-native";

// Set the access token from environment variable
Mapbox.setAccessToken(process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN || "");

const MapPage = () => {
  return (
    <View style={{ flex: 1 }}>
      <Mapbox.MapView style={{ flex: 1 }} styleURL={Mapbox.StyleURL.Dark}>
        <Mapbox.Camera
          zoomLevel={12}
          centerCoordinate={[-122.3321, 47.6062]} // Seattle coordinates
        />
      </Mapbox.MapView>
    </View>
  );
};

export default MapPage;

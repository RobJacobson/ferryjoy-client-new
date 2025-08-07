import { StyleSheet, View } from "react-native";

import { MainMap } from "@/features/map";
import { MapComponent } from "@/features/refactored-map";
import { InteractiveBottomSheet } from "@/shared/components";
import { UIContextProvider } from "@/shared/contexts";

const MAP_ONE_STYLE_URL = "mapbox://styles/xyzzy/cmd0zzajt00gn01r4fyr5fqfb";

const MapPage = () => {
  return (
    <View style={styles.container}>
      <UIContextProvider>
        <MapComponent />
        <InteractiveBottomSheet />
      </UIContextProvider>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default MapPage;

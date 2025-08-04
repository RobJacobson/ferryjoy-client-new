import { StyleSheet, View } from "react-native";

import { MainMap } from "@/features/map";
import { BottomSheetDemo } from "@/shared/components";

const MAP_ONE_STYLE_URL = "mapbox://styles/xyzzy/cmd0zzajt00gn01r4fyr5fqfb";

const MapPage = () => {
  return (
    <View style={styles.container}>
      <MainMap styleURL={MAP_ONE_STYLE_URL} />
      <BottomSheetDemo />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default MapPage;

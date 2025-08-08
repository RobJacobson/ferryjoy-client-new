import { StyleSheet, View } from "react-native";

// import { MainMap } from "@/features/refactored-map";
import { MainMap } from "@/features/map";
import { InteractiveBottomSheet } from "@/shared/components";

const MapPage = () => {
  return (
    <View style={styles.container}>
      <InteractiveBottomSheet />
      <MainMap />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default MapPage;

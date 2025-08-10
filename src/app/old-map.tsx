import type { NativeStackNavigationOptions } from "@react-navigation/native-stack";
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

export const options: NativeStackNavigationOptions = { title: "Old Map" };

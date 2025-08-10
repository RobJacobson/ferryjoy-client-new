import type { NativeStackNavigationOptions } from "@react-navigation/native-stack";
import { StyleSheet, View } from "react-native";

import { CustomBottomSheet } from "@/shared/components";

const CustomBottomSheetPage = () => {
  return (
    <View style={styles.container}>
      <CustomBottomSheet />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f0f0",
  },
});

export default CustomBottomSheetPage;

export const options: NativeStackNavigationOptions = {
  title: "Custom Bottom Sheet",
};

import { StyleSheet, View } from "react-native";

import { BottomSheetTest } from "@/shared/components";

const TestBottomSheetPage = () => {
  return (
    <View style={styles.container}>
      <BottomSheetTest />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f0f0",
  },
});

export default TestBottomSheetPage;

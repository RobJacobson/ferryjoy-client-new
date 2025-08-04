import { StyleSheet, View } from "react-native";

import { GestureTest } from "@/shared/components";

const GestureTestPage = () => {
  return (
    <View style={styles.container}>
      <GestureTest />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f0f0",
  },
});

export default GestureTestPage;

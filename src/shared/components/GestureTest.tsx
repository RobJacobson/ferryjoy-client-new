import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { PanGestureHandler, State } from "react-native-gesture-handler";

/**
 * Simple test component to verify gesture handler is working
 */
export const GestureTest = () => {
  const onGestureEvent = (event: any) => {
    console.log("Gesture event:", event.nativeEvent);
  };

  const onHandlerStateChange = (event: any) => {
    if (event.nativeEvent.state === State.ACTIVE) {
      console.log("Gesture is active!");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Gesture Handler Test</Text>
      <Text style={styles.text}>
        If you can see this and no errors, gesture handler is working!
      </Text>
      <View style={styles.testArea}>
        <Text style={styles.text}>Try dragging this area</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
  },
  text: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 8,
  },
  testArea: {
    width: 200,
    height: 100,
    backgroundColor: "#e5e7eb",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
    marginTop: 20,
  },
});

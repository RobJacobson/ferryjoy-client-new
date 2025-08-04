import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { InteractiveBottomSheet } from "@/shared/components";
import { useBottomSheet } from "@/shared/contexts";

const InteractiveDemoPage = () => {
  const { openBottomSheet } = useBottomSheet();

  const handleVesselPress = () => {
    openBottomSheet({
      id: "WENATCHEE",
      name: "M/V Wenatchee",
      type: "vessel",
      data: {
        VesselID: "WENATCHEE",
        VesselName: "M/V Wenatchee",
        InService: true,
      },
    });
  };

  const handleTerminalPress = () => {
    openBottomSheet({
      id: "SEA",
      name: "Seattle Terminal",
      type: "terminal",
      data: {
        TerminalID: "SEA",
        TerminalName: "Seattle Terminal",
      },
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={handleVesselPress}>
          <Text style={styles.buttonText}>🚢 Test Vessel</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={handleTerminalPress}>
          <Text style={styles.buttonText}>📍 Test Terminal</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.instructions}>
        Click the buttons above to test the interactive bottom sheet.
        {"\n"}On the map, click on vessel markers (pink circles) or terminal
        markers (blue circles).
      </Text>

      <InteractiveBottomSheet />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f0f0",
    padding: 20,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 20,
  },
  button: {
    backgroundColor: "#3b82f6",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 120,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
  },
  instructions: {
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
    color: "#6b7280",
  },
});

export default InteractiveDemoPage;

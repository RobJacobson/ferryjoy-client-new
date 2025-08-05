import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetHandle,
  BottomSheetScrollView,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import type React from "react";
import { useCallback, useMemo, useRef } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

/**
 * Advanced bottom sheet component demonstrating additional features
 */
export const BottomSheetAdvanced = () => {
  // ref
  const bottomSheetRef = useRef<BottomSheet>(null);

  // variables
  const snapPoints = useMemo(() => ["25%", "50%", "90%"], []);

  // callbacks
  const handleSheetChanges = useCallback((index: number) => {
    console.log("handleSheetChanges", index);
  }, []);

  const handlePresentModalPress = useCallback(() => {
    bottomSheetRef.current?.expand();
  }, []);

  const handleDismissModalPress = useCallback(() => {
    bottomSheetRef.current?.close();
  }, []);

  const renderBackdrop = useCallback(
    (props: React.ComponentProps<typeof BottomSheetBackdrop>) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={1}
        appearsOnIndex={2}
      />
    ),
    []
  );

  const renderHandle = useCallback(
    (props: React.ComponentProps<typeof BottomSheetHandle>) => (
      <BottomSheetHandle
        {...props}
        indicatorStyle={{
          backgroundColor: "#6b7280",
          width: 40,
          height: 4,
        }}
      />
    ),
    []
  );

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={1}
      snapPoints={snapPoints}
      onChange={handleSheetChanges}
      backdropComponent={renderBackdrop}
      handleComponent={renderHandle}
      enablePanDownToClose={true}
      enableOverDrag={false}
    >
      <BottomSheetView style={styles.contentContainer}>
        <Text style={styles.title}>Advanced Bottom Sheet</Text>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.button}
            onPress={handlePresentModalPress}
          >
            <Text style={styles.buttonText}>Expand</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.buttonSecondary]}
            onPress={handleDismissModalPress}
          >
            <Text style={styles.buttonText}>Close</Text>
          </TouchableOpacity>
        </View>

        <BottomSheetScrollView style={styles.scrollView}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🎯 Features Demonstrated</Text>
            <Text style={styles.text}>
              • Custom handle with styled indicator
            </Text>
            <Text style={styles.text}>• Backdrop that appears/disappears</Text>
            <Text style={styles.text}>• Pan down to close functionality</Text>
            <Text style={styles.text}>
              • Programmatic control (expand/close)
            </Text>
            <Text style={styles.text}>
              • Multiple snap points (25%, 50%, 90%)
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📱 Gesture Controls</Text>
            <Text style={styles.text}>
              • Drag up/down to snap to different heights
            </Text>
            <Text style={styles.text}>
              • Pull down past the first snap point to close
            </Text>
            <Text style={styles.text}>
              • Tap backdrop to close (when visible)
            </Text>
            <Text style={styles.text}>
              • Smooth animations and haptic feedback
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🔧 Configuration</Text>
            <Text style={styles.text}>• enablePanDownToClose: true</Text>
            <Text style={styles.text}>• enableOverDrag: false</Text>
            <Text style={styles.text}>• Custom backdrop behavior</Text>
            <Text style={styles.text}>• Custom handle styling</Text>
          </View>
        </BottomSheetScrollView>
      </BottomSheetView>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: 16,
    color: "#1f2937",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 16,
  },
  button: {
    backgroundColor: "#3b82f6",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    minWidth: 80,
    alignItems: "center",
  },
  buttonSecondary: {
    backgroundColor: "#6b7280",
  },
  buttonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 14,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    marginBottom: 24,
    padding: 16,
    backgroundColor: "#f3f4f6",
    borderRadius: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
    color: "#374151",
  },
  text: {
    fontSize: 14,
    lineHeight: 20,
    color: "#6b7280",
    marginBottom: 4,
  },
});

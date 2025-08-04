import BottomSheetModal, {
  BottomSheetBackdrop,
  BottomSheetHandle,
  BottomSheetScrollView,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import React, { useCallback, useMemo, useRef, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

/**
 * Bottom sheet modal component demonstrating modal presentation
 */
export const BottomSheetModalDemo = () => {
  // ref
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);

  // variables
  const snapPoints = useMemo(() => ["50%", "90%"], []);

  // callbacks
  const handlePresentModalPress = useCallback(() => {
    bottomSheetModalRef.current?.expand();
  }, []);

  const handleDismissModalPress = useCallback(() => {
    bottomSheetModalRef.current?.close();
  }, []);

  const handleSheetChanges = useCallback((index: number) => {
    console.log("handleSheetChanges", index);
  }, []);

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.5}
      />
    ),
    []
  );

  const renderHandle = useCallback(
    (props: any) => (
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
    <View style={styles.container}>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.button}
          onPress={handlePresentModalPress}
        >
          <Text style={styles.buttonText}>Open Modal</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.buttonSecondary]}
          onPress={handleDismissModalPress}
        >
          <Text style={styles.buttonText}>Close Modal</Text>
        </TouchableOpacity>
      </View>

      <BottomSheetModal
        ref={bottomSheetModalRef}
        index={0}
        snapPoints={snapPoints}
        onChange={handleSheetChanges}
        backdropComponent={renderBackdrop}
        handleComponent={renderHandle}
        enablePanDownToClose={true}
      >
        <BottomSheetView style={styles.contentContainer}>
          <Text style={styles.title}>Modal Bottom Sheet</Text>

          <BottomSheetScrollView style={styles.scrollView}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>🚀 Modal Features</Text>
              <Text style={styles.text}>
                This is a modal bottom sheet that appears over the current
                screen.
              </Text>
              <Text style={styles.text}>
                • Present/dismiss programmatically
              </Text>
              <Text style={styles.text}>• Backdrop with opacity control</Text>
              <Text style={styles.text}>• Pan down to close</Text>
              <Text style={styles.text}>• Tap backdrop to dismiss</Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>📱 Usage</Text>
              <Text style={styles.text}>
                Modal bottom sheets are great for:
              </Text>
              <Text style={styles.text}>• Detailed information overlays</Text>
              <Text style={styles.text}>• Forms and input screens</Text>
              <Text style={styles.text}>• Settings and configuration</Text>
              <Text style={styles.text}>• Quick actions and menus</Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>🔧 Configuration</Text>
              <Text style={styles.text}>• enablePanDownToClose: true</Text>
              <Text style={styles.text}>• enableDismissOnClose: true</Text>
              <Text style={styles.text}>• Backdrop opacity: 0.5</Text>
              <Text style={styles.text}>• Snap points: 50%, 90%</Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>💡 Tips</Text>
              <Text style={styles.text}>• Use present() to show the modal</Text>
              <Text style={styles.text}>• Use dismiss() to hide the modal</Text>
              <Text style={styles.text}>
                • The modal can be closed by gestures
              </Text>
              <Text style={styles.text}>
                • Backdrop provides visual feedback
              </Text>
            </View>
          </BottomSheetScrollView>
        </BottomSheetView>
      </BottomSheetModal>
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
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
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
  buttonSecondary: {
    backgroundColor: "#6b7280",
  },
  buttonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
  },
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

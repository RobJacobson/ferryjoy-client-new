import BottomSheet, {
  BottomSheetScrollView,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import React, { useCallback, useMemo, useRef } from "react";
import { StyleSheet, Text, View } from "react-native";

/**
 * Bottom sheet component with dummy content for demonstration
 */
export const BottomSheetDemo = () => {
  // ref
  const bottomSheetRef = useRef<BottomSheet>(null);

  // variables
  const snapPoints = useMemo(() => ["25%", "50%", "90%"], []);

  // callbacks
  const handleSheetChanges = useCallback((index: number) => {
    console.log("handleSheetChanges", index);
  }, []);

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={1}
      snapPoints={snapPoints}
      onChange={handleSheetChanges}
    >
      <BottomSheetView style={styles.contentContainer}>
        <Text style={styles.title}>FerryJoy Bottom Sheet</Text>
        <BottomSheetScrollView style={styles.scrollView}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🚢 Vessel Information</Text>
            <Text style={styles.text}>
              This is a demo bottom sheet for the FerryJoy app. You can drag it
              up and down to see different snap points.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📍 Terminal Details</Text>
            <Text style={styles.text}>
              Terminal: Seattle - Bainbridge Island
            </Text>
            <Text style={styles.text}>Next Departure: 2:30 PM</Text>
            <Text style={styles.text}>Vessel: M/V Wenatchee</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📅 Schedule</Text>
            <Text style={styles.text}>• 2:30 PM - Seattle → Bainbridge</Text>
            <Text style={styles.text}>• 3:15 PM - Bainbridge → Seattle</Text>
            <Text style={styles.text}>• 4:00 PM - Seattle → Bainbridge</Text>
            <Text style={styles.text}>• 4:45 PM - Bainbridge → Seattle</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>💰 Fare Information</Text>
            <Text style={styles.text}>Adult: $9.25</Text>
            <Text style={styles.text}>Senior/Disabled: $4.60</Text>
            <Text style={styles.text}>Youth (6-18): $4.60</Text>
            <Text style={styles.text}>Children (5 & under): Free</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>ℹ️ Additional Info</Text>
            <Text style={styles.text}>
              This bottom sheet demonstrates the @gorhom/bottom-sheet library
              integration. It supports smooth gestures, multiple snap points,
              and scrollable content.
            </Text>
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

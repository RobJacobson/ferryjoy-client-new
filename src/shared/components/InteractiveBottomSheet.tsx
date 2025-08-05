import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetScrollView,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import type React from "react";
import { useCallback, useMemo, useRef } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { useBottomSheet } from "@/shared/contexts";

/**
 * Interactive bottom sheet component that shows vessel or terminal information
 * Follows Gorhom Bottom Sheet best practices for Expo
 */
export const InteractiveBottomSheet = () => {
  const { isOpen, currentItem, closeBottomSheet } = useBottomSheet();
  const bottomSheetRef = useRef<BottomSheet>(null);

  // Snap points for the bottom sheet
  const snapPoints = useMemo(() => ["25%", "50%", "90%"], []);

  // callbacks
  const handleSheetChanges = useCallback((index: number) => {
    console.log("handleSheetChanges", index);
  }, []);

  const handleClose = useCallback(() => {
    closeBottomSheet();
  }, [closeBottomSheet]);

  // Backdrop component for better UX
  const renderBackdrop = useCallback(
    (props: React.ComponentProps<typeof BottomSheetBackdrop>) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={0}
        appearsOnIndex={1}
        opacity={0.5}
      />
    ),
    []
  );

  // Don't render if not open
  if (!isOpen || !currentItem) {
    return null;
  }

  const renderContent = () => {
    if (currentItem.type === "vessel") {
      return (
        <View style={styles.content}>
          <Text style={styles.title}>🚢 {currentItem.name}</Text>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Vessel Information</Text>
            <Text style={styles.text}>Vessel ID: {currentItem.id}</Text>
            <Text style={styles.text}>Type: Ferry</Text>
            <Text style={styles.text}>Status: In Service</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Current Route</Text>
            <Text style={styles.text}>Seattle ↔ Bainbridge Island</Text>
            <Text style={styles.text}>Next Departure: 2:30 PM</Text>
            <Text style={styles.text}>ETA: 3:15 PM</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Schedule</Text>
            <Text style={styles.text}>• 2:30 PM - Seattle → Bainbridge</Text>
            <Text style={styles.text}>• 3:15 PM - Bainbridge → Seattle</Text>
            <Text style={styles.text}>• 4:00 PM - Seattle → Bainbridge</Text>
          </View>
        </View>
      );
    } else if (currentItem.type === "terminal") {
      return (
        <View style={styles.content}>
          <Text style={styles.title}>📍 {currentItem.name}</Text>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Terminal Information</Text>
            <Text style={styles.text}>Terminal ID: {currentItem.id}</Text>
            <Text style={styles.text}>Location: Seattle, WA</Text>
            <Text style={styles.text}>Status: Open</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Services</Text>
            <Text style={styles.text}>• Passenger boarding</Text>
            <Text style={styles.text}>• Vehicle loading</Text>
            <Text style={styles.text}>• Ticket sales</Text>
            <Text style={styles.text}>• Restrooms</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Fare Information</Text>
            <Text style={styles.text}>Adult: $9.25</Text>
            <Text style={styles.text}>Senior/Disabled: $4.60</Text>
            <Text style={styles.text}>Youth (6-18): $4.60</Text>
            <Text style={styles.text}>Children (5 & under): Free</Text>
          </View>
        </View>
      );
    }

    return (
      <View style={styles.content}>
        <Text style={styles.title}>ℹ️ {currentItem.name}</Text>
        <Text style={styles.text}>Information not available</Text>
      </View>
    );
  };

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={0}
      snapPoints={snapPoints}
      onChange={handleSheetChanges}
      enablePanDownToClose={true}
      keyboardBehavior="interactive"
      keyboardBlurBehavior="restore"
      backdropComponent={renderBackdrop}
      handleIndicatorStyle={styles.handleIndicator}
    >
      <BottomSheetView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>
            {currentItem.type === "vessel" ? "🚢" : "📍"} {currentItem.name}
          </Text>
          <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>

        <BottomSheetScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          {renderContent()}
        </BottomSheetScrollView>
      </BottomSheetView>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1f2937",
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#f3f4f6",
    justifyContent: "center",
    alignItems: "center",
  },
  closeButtonText: {
    fontSize: 16,
    color: "#6b7280",
    fontWeight: "600",
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#1f2937",
  },
  section: {
    marginBottom: 24,
    padding: 16,
    backgroundColor: "#f9fafb",
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
  handleIndicator: {
    backgroundColor: "#d1d5db",
    width: 40,
    height: 4,
  },
});

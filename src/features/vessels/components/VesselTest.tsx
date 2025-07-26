import { Text, View } from "react-native";

import { useVesselLocation } from "@/shared/contexts/VesselLocationContext";

/**
 * Test component for vessel data
 */
const VesselTest = () => {
  const { vesselLocations } = useVesselLocation();

  return (
    <View className="absolute top-20 left-4 bg-white/80 p-4 rounded z-50 max-w-80">
      <Text className="text-lg font-bold text-black mb-2">Vessel Test</Text>
      <Text className="text-sm text-black mb-1">
        Total Vessels: {vesselLocations.length}
      </Text>
      {vesselLocations.slice(0, 3).map((vessel) => (
        <Text key={vessel.VesselID} className="text-xs text-black">
          {vessel.VesselName}: {vessel.Latitude.toFixed(4)},{" "}
          {vessel.Longitude.toFixed(4)}
        </Text>
      ))}
      {vesselLocations.length > 3 && (
        <Text className="text-xs text-gray-600">
          ... and {vesselLocations.length - 3} more vessels
        </Text>
      )}
    </View>
  );
};

export default VesselTest;

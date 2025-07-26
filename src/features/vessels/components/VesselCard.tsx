import { Text, View } from "react-native";
import type { VesselLocation } from "ws-dottie";

type VesselCardProps = {
  vessel: VesselLocation;
};

/**
 * Component for displaying vessel information in a card format
 * Shows vessel name, status, position, and other relevant details
 */
const VesselCard = ({ vessel }: VesselCardProps) => {
  return (
    <View className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
      <Text className="text-lg font-semibold text-gray-900">
        {vessel.VesselName}
      </Text>
      <Text className="text-sm text-gray-600">
        Status: {vessel.InService ? "In Service" : "Out of Service"}
      </Text>
      <Text className="text-xs text-gray-500 mt-1">
        Position: {vessel.Latitude.toFixed(4)}, {vessel.Longitude.toFixed(4)}
      </Text>
    </View>
  );
};

export default VesselCard;

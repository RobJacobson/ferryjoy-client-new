import { Text, View } from "react-native";

/**
 * Component for displaying route information in a card format
 * Shows route name, terminals, and basic schedule information
 */
const RouteCard = () => {
  return (
    <View className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
      <Text className="text-lg font-semibold text-gray-900">
        Seattle ↔ Bainbridge Island
      </Text>
      <Text className="text-sm text-gray-600 mt-1">Duration: 35 minutes</Text>
      <Text className="text-xs text-gray-500 mt-1">
        Frequency: Every 1-2 hours
      </Text>
      <View className="flex-row justify-between items-center mt-2">
        <Text className="text-xs text-blue-600">Active</Text>
        <Text className="text-xs text-gray-500">Next: 6:30 AM</Text>
      </View>
    </View>
  );
};

export default RouteCard;

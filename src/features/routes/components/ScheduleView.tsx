import { Text, View } from "react-native";

/**
 * Component for displaying route schedules
 * Shows departure times, duration, and frequency for selected routes
 */
const ScheduleView = () => {
  return (
    <View className="flex-1 bg-white">
      <View className="p-4 border-b border-gray-200">
        <Text className="text-lg font-semibold text-gray-900">
          Route Schedule
        </Text>
        <Text className="text-sm text-gray-600">
          Seattle ↔ Bainbridge Island
        </Text>
      </View>

      <View className="p-4">
        <Text className="text-sm text-gray-500 mb-2">Today's Departures</Text>
        <View className="space-y-2">
          <View className="flex-row justify-between items-center p-3 bg-gray-50 rounded">
            <Text className="font-medium">6:30 AM</Text>
            <Text className="text-sm text-gray-600">35 min</Text>
          </View>
          <View className="flex-row justify-between items-center p-3 bg-gray-50 rounded">
            <Text className="font-medium">8:15 AM</Text>
            <Text className="text-sm text-gray-600">35 min</Text>
          </View>
          <View className="flex-row justify-between items-center p-3 bg-gray-50 rounded">
            <Text className="font-medium">10:00 AM</Text>
            <Text className="text-sm text-gray-600">35 min</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

export default ScheduleView;

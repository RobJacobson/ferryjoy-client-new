import { Text, View } from "react-native";

/**
 * Component for displaying terminal information in a card format
 * Shows terminal name, wait times, and other relevant details
 */
const TerminalCard = () => {
  return (
    <View className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
      <Text className="text-lg font-semibold text-gray-900">Terminal Name</Text>
      <Text className="text-sm text-gray-600">Wait Time: 15 minutes</Text>
      <Text className="text-xs text-gray-500 mt-1">Space Available: 45%</Text>
    </View>
  );
};

export default TerminalCard;

import { FlatList, Text, View } from "react-native";

import TerminalCard from "./TerminalCard";

/**
 * Component for displaying a list of terminals
 * Shows all terminals with their current wait times and space availability
 */
const TerminalList = () => {
  // TODO: Replace with actual terminal data
  const mockTerminals = [
    { id: 1, name: "Seattle", waitTime: 15, spaceAvailable: 45 },
    { id: 2, name: "Bainbridge", waitTime: 5, spaceAvailable: 80 },
    { id: 3, name: "Bremerton", waitTime: 25, spaceAvailable: 20 },
  ];

  return (
    <FlatList
      data={mockTerminals}
      keyExtractor={(item) => item.id.toString()}
      renderItem={() => <TerminalCard />}
      ItemSeparatorComponent={() => <View className="h-2" />}
      contentContainerStyle={{ padding: 16 }}
      showsVerticalScrollIndicator={false}
    />
  );
};

export default TerminalList;

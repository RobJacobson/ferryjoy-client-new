import { FlatList, Text, View } from "react-native";

import { useVesselLocations } from "@/data/contexts";

import VesselCard from "./VesselCard";

/**
 * Component for displaying a list of vessels
 * Shows all vessels with their current status and information
 */
const VesselList = () => {
  const { vesselLocations } = useVesselLocations();

  if (!vesselLocations.length) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text className="text-gray-500">No vessels available</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={vesselLocations}
      keyExtractor={(item) => item.VesselID.toString()}
      renderItem={({ item }) => <VesselCard vessel={item} />}
      ItemSeparatorComponent={() => <View className="h-2" />}
      contentContainerStyle={{ padding: 16 }}
      showsVerticalScrollIndicator={false}
    />
  );
};

export default VesselList;

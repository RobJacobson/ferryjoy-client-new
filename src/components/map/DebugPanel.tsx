import { Text, View } from "react-native";

import { useMapState } from "@/data/contexts/MapStateContext";

/**
 * Debug panel component that displays current map state
 */
const DebugPanel = () => {
  const { latitude, longitude, zoom, heading, pitch, mapDimensions } =
    useMapState();

  return (
    <View className="absolute top-2.5 right-2.5 bg-white/50 p-2 rounded z-50">
      <Text className="text-sm font-mono text-black">
        {`Lat:     ${latitude.toFixed(4)}`}
      </Text>
      <Text className="text-sm font-mono text-black">
        {`Lng:     ${longitude.toFixed(4)}`}
      </Text>
      <Text className="text-sm font-mono text-black">
        {`Zoom:    ${zoom.toFixed(2)}`}
      </Text>
      <Text className="text-sm font-mono text-black">
        {`Heading: ${heading.toFixed(1)}°`}
      </Text>
      <Text className="text-sm font-mono text-black">
        {`Pitch:   ${pitch.toFixed(1)}°`}
      </Text>
      <Text className="text-sm font-mono text-black">
        {`Size:    ${mapDimensions.width}×${mapDimensions.height}`}
      </Text>
    </View>
  );
};

export default DebugPanel;

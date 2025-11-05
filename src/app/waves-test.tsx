import type React from "react";
import { ScrollView, Text, View } from "react-native";

import { Waves } from "@/features/waves";

const WavesTest: React.FC = () => {
  return (
    <ScrollView className="flex-1 bg-gray-900 p-4">
      <Text className="mb-6 text-center font-bold text-2xl text-white">
        Waves Component Test
      </Text>

      {/* Single wave with different configurations */}
      <View className="mb-8">
        <Text className="mb-4 font-semibold text-lg text-white">
          Single Wave - Default
        </Text>
        <View className="bg-purple-200">
          <Waves
            maxWavelength={800}
            maxAmplitude={50}
            width={1000}
            height={200}
            stroke="red"
            strokeWidth={1}
          />
        </View>
      </View>
    </ScrollView>
  );
};

export default WavesTest;

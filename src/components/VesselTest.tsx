import { Text, View } from "react-native";

import { useVesselPositions } from "@/data/contexts/VesselPositionsContext";

/**
 * Test component to verify vessel data is working
 */
export const VesselTest = () => {
  const { animatedVessels } = useVesselPositions();

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 10 }}>
        Vessel Test Component
      </Text>
      <Text>Number of vessels: {animatedVessels.length}</Text>
      {animatedVessels.length > 0 && (
        <View style={{ marginTop: 10 }}>
          <Text style={{ fontWeight: "bold" }}>First vessel:</Text>
          <Text>ID: {animatedVessels[0].VesselID}</Text>
          <Text>Name: {animatedVessels[0].VesselName}</Text>
          <Text>Lat: {animatedVessels[0].Latitude}</Text>
          <Text>Lng: {animatedVessels[0].Longitude}</Text>
          <Text>Speed: {animatedVessels[0].Speed} knots</Text>
          <Text>Heading: {animatedVessels[0].Heading}°</Text>
        </View>
      )}
    </View>
  );
};

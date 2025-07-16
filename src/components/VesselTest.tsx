import { useQuery } from "@tanstack/react-query";
import { Text, View } from "react-native";

import { useVesselPositions } from "@/data/contexts/VesselPositionsContext";

/**
 * Simple test component to verify React Query is working
 */
const ReactQueryTest = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["test"],
    queryFn: () => Promise.resolve("test data"),
  });

  return (
    <View
      style={{ padding: 10, backgroundColor: "lightblue", marginBottom: 10 }}
    >
      <Text style={{ fontWeight: "bold" }}>React Query Test:</Text>
      <Text>Loading: {isLoading ? "Yes" : "No"}</Text>
      <Text>Data: {data || "None"}</Text>
      <Text>Error: {error ? "Yes" : "No"}</Text>
    </View>
  );
};

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

      <ReactQueryTest />

      <Text style={{ marginBottom: 10 }}>Vessel Data Test:</Text>
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

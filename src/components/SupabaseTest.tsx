import { View } from "react-native";

import { Card, CardContent } from "@/components/ui/card";
import { Text } from "@/components/ui/text";
import { useSupabaseData } from "@/data/contexts/SupabaseData";

/**
 * Test component to demonstrate Supabase data integration
 * Shows vessel location and trip data with real-time updates
 */
export const SupabaseTest = () => {
  const { vesselLocationMinute, vesselLocationSecond, vesselTrips } =
    useSupabaseData();

  return (
    <Card className="p-4 m-4">
      <CardContent>
        <Text className="text-lg font-bold mb-4">Supabase Data Test</Text>

        {/* Vessel Location Minute Data */}
        <View className="mb-4">
          <Text className="font-semibold">Vessel Location Minute:</Text>
          <Text>Status: {vesselLocationMinute.status}</Text>
          <Text>Count: {vesselLocationMinute.data?.length || 0}</Text>
          {vesselLocationMinute.error && (
            <Text className="text-red-500">
              Error: {vesselLocationMinute.error.message}
            </Text>
          )}
        </View>

        {/* Vessel Location Second Data */}
        <View className="mb-4">
          <Text className="font-semibold">Vessel Location Second:</Text>
          <Text>Status: {vesselLocationSecond.status}</Text>
          <Text>Count: {vesselLocationSecond.data?.length || 0}</Text>
          {vesselLocationSecond.error && (
            <Text className="text-red-500">
              Error: {vesselLocationSecond.error.message}
            </Text>
          )}
        </View>

        {/* Vessel Trips Data */}
        <View className="mb-4">
          <Text className="font-semibold">Vessel Trips:</Text>
          <Text>Status: {vesselTrips.status}</Text>
          <Text>Count: {vesselTrips.data?.length || 0}</Text>
          {vesselTrips.error && (
            <Text className="text-red-500">
              Error: {vesselTrips.error.message}
            </Text>
          )}
        </View>

        {/* Sample Data Display */}
        {vesselLocationMinute.data && vesselLocationMinute.data.length > 0 && (
          <View className="mt-4">
            <Text className="font-semibold">Sample Vessel Location:</Text>
            <Text>Vessel ID: {vesselLocationMinute.data[0].vesselId}</Text>
            <Text>Lat: {vesselLocationMinute.data[0].lat}</Text>
            <Text>Lon: {vesselLocationMinute.data[0].lon}</Text>
            <Text>Speed: {vesselLocationMinute.data[0].speed}</Text>
            <Text>
              Timestamp:{" "}
              {vesselLocationMinute.data[0].timestamp?.toLocaleString()}
            </Text>
          </View>
        )}
      </CardContent>
    </Card>
  );
};

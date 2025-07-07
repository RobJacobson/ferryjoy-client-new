import { View, Text, ScrollView } from "react-native";

import { isSupabaseConfigured } from "../supabase/client";
import { useSupabaseVesselData } from "./SupabaseVesselData";
import { useSupabaseVesselTrips } from "./SupabaseVesselTrips";

/**
 * Test component to display Supabase data
 * Used for debugging and development
 */
export const SupabaseTest = () => {
  const { vesselLocationCurrent, vesselLocationMinute, vesselLocationSecond } =
    useSupabaseVesselData();
  const { vesselTrips } = useSupabaseVesselTrips();

  if (!isSupabaseConfigured) {
    return (
      <View className="p-4 bg-yellow-100 border border-yellow-400 rounded">
        <Text className="text-yellow-800 font-semibold">
          Supabase not configured
        </Text>
        <Text className="text-yellow-700 text-sm mt-1">
          Check your environment variables for SUPABASE_URL and
          SUPABASE_ANON_KEY
        </Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 p-4">
      <Text className="text-2xl font-bold mb-4">Supabase Data Test</Text>

      {/* Vessel Location Current */}
      <View className="mb-6">
        <Text className="text-lg font-semibold mb-2">
          Vessel Location Current
        </Text>
        {vesselLocationCurrent.isLoading ? (
          <Text className="text-gray-600">Loading...</Text>
        ) : vesselLocationCurrent.error ? (
          <Text className="text-red-600">
            Error: {vesselLocationCurrent.error.message}
          </Text>
        ) : (
          <View>
            <Text className="text-gray-600 mb-2">
              Count: {vesselLocationCurrent.data?.length || 0}
            </Text>
            {vesselLocationCurrent.data?.slice(0, 3).map((vessel, index) => (
              <View key={index} className="bg-gray-100 p-3 rounded mb-2">
                <Text className="font-medium">{vessel.vesselName}</Text>
                <Text className="text-sm text-gray-600">
                  Lat: {vessel.lat}, Lon: {vessel.lon}
                </Text>
                <Text className="text-sm text-gray-600">
                  Speed: {vessel.speed} knots, Heading: {vessel.heading}°
                </Text>
                <Text className="text-sm text-gray-600">
                  At Dock: {vessel.atDock ? "Yes" : "No"}
                </Text>
                <Text className="text-sm text-gray-600">
                  Timestamp: {vessel.timestamp.toLocaleString()}
                </Text>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* Vessel Location Minute */}
      <View className="mb-6">
        <Text className="text-lg font-semibold mb-2">
          Vessel Location Minute
        </Text>
        {vesselLocationMinute.isLoading ? (
          <Text className="text-gray-600">Loading...</Text>
        ) : vesselLocationMinute.error ? (
          <Text className="text-red-600">
            Error: {vesselLocationMinute.error.message}
          </Text>
        ) : (
          <View>
            <Text className="text-gray-600 mb-2">
              Count: {vesselLocationMinute.data?.length || 0}
            </Text>
            {vesselLocationMinute.data?.slice(0, 3).map((vessel, index) => (
              <View key={index} className="bg-gray-100 p-3 rounded mb-2">
                <Text className="font-medium">
                  Vessel ID: {vessel.vesselId}
                </Text>
                <Text className="text-sm text-gray-600">
                  Lat: {vessel.lat}, Lon: {vessel.lon}
                </Text>
                <Text className="text-sm text-gray-600">
                  Speed: {vessel.speed} knots, Heading: {vessel.heading}°
                </Text>
                <Text className="text-sm text-gray-600">
                  Trip Key: {vessel.vesselTripKey}
                </Text>
                {vessel.timestamp && (
                  <Text className="text-sm text-gray-600">
                    Timestamp: {vessel.timestamp.toLocaleString()}
                  </Text>
                )}
              </View>
            ))}
          </View>
        )}
      </View>

      {/* Vessel Location Second */}
      <View className="mb-6">
        <Text className="text-lg font-semibold mb-2">
          Vessel Location Second
        </Text>
        {vesselLocationSecond.isLoading ? (
          <Text className="text-gray-600">Loading...</Text>
        ) : vesselLocationSecond.error ? (
          <Text className="text-red-600">
            Error: {vesselLocationSecond.error.message}
          </Text>
        ) : (
          <View>
            <Text className="text-gray-600 mb-2">
              Count: {vesselLocationSecond.data?.length || 0}
            </Text>
            {vesselLocationSecond.data?.slice(0, 3).map((vessel, index) => (
              <View key={index} className="bg-gray-100 p-3 rounded mb-2">
                <Text className="font-medium">{vessel.vesselName}</Text>
                <Text className="text-sm text-gray-600">
                  Lat: {vessel.lat}, Lon: {vessel.lon}
                </Text>
                <Text className="text-sm text-gray-600">
                  Speed: {vessel.speed} knots, Heading: {vessel.heading}°
                </Text>
                <Text className="text-sm text-gray-600">
                  From: {vessel.depTermName} → To:{" "}
                  {vessel.arvTermName || "Unknown"}
                </Text>
                <Text className="text-sm text-gray-600">
                  Timestamp: {vessel.timestamp.toLocaleString()}
                </Text>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* Vessel Trips */}
      <View className="mb-6">
        <Text className="text-lg font-semibold mb-2">Vessel Trips</Text>
        {vesselTrips.isLoading ? (
          <Text className="text-gray-600">Loading...</Text>
        ) : vesselTrips.error ? (
          <Text className="text-red-600">
            Error: {vesselTrips.error.message}
          </Text>
        ) : (
          <View>
            <Text className="text-gray-600 mb-2">
              Count: {vesselTrips.data?.length || 0}
            </Text>
            {vesselTrips.data?.slice(0, 3).map((trip, index) => (
              <View key={index} className="bg-gray-100 p-3 rounded mb-2">
                <Text className="font-medium">
                  {trip.vesselName || "Unknown Vessel"}
                </Text>
                <Text className="text-sm text-gray-600">
                  From: {trip.depTermName || "Unknown"} → To:{" "}
                  {trip.arvTermName || "Unknown"}
                </Text>
                <Text className="text-sm text-gray-600">Key: {trip.key}</Text>
                {trip.startAt && (
                  <Text className="text-sm text-gray-600">
                    Started: {trip.startAt.toLocaleString()}
                  </Text>
                )}
                {trip.endAt && (
                  <Text className="text-sm text-gray-600">
                    Ended: {trip.endAt.toLocaleString()}
                  </Text>
                )}
              </View>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
};

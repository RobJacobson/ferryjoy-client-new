import { ScrollView, Text, View } from "react-native";

import { useTripData, useVesselPings } from "@/data/contexts";
import { BottomSheetModalDemo } from "@/shared/components";

export default function TripsTestPage() {
  const { tripData, isLoading } = useTripData();
  const { vesselPings } = useVesselPings();

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center p-4">
        <Text className="text-lg text-foreground">Loading trip data...</Text>
      </View>
    );
  }

  if (!tripData || tripData.length === 0) {
    return (
      <View className="flex-1 items-center justify-center p-4">
        <Text className="text-lg text-foreground">
          No trips found since 3:00 AM
        </Text>
        <Text className="text-sm text-muted-foreground mt-2">
          Data updates automatically in real-time
        </Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <ScrollView className="flex-1 bg-background">
        <View className="p-4">
          <Text className="text-2xl font-bold text-foreground mb-4">
            Vessel Trips Since 3:00 AM
          </Text>
          <Text className="text-sm text-muted-foreground mb-6">
            Found {tripData.length} trips • Updates automatically
          </Text>

          {/* VesselPing Data Test Section */}
          <View className="bg-muted border border-border rounded-lg p-4 mb-6">
            <Text className="text-lg font-semibold text-foreground mb-2">
              VesselPing Data Test
            </Text>
            {vesselPings ? (
              <View>
                <Text className="text-sm text-muted-foreground mb-2">
                  Vessels with ping data: {Object.keys(vesselPings).length}
                </Text>
                {Object.entries(vesselPings)
                  .slice(0, 3)
                  .map(([vesselId, pings]) => (
                    <Text
                      key={vesselId}
                      className="text-xs text-muted-foreground"
                    >
                      Vessel {vesselId}: {pings.length} pings
                    </Text>
                  ))}
                {Object.keys(vesselPings).length > 3 && (
                  <Text className="text-xs text-muted-foreground">
                    ...and {Object.keys(vesselPings).length - 3} more vessels
                  </Text>
                )}
              </View>
            ) : (
              <Text className="text-sm text-muted-foreground">
                No vessel ping data available
              </Text>
            )}
          </View>

          {tripData.map((trip) => (
            <View
              key={`${trip.VesselID}-${trip.TimeStamp.getTime()}`}
              className="bg-card border border-border rounded-lg p-4 mb-4"
            >
              <View className="flex-row justify-between items-start mb-2">
                <Text className="text-lg font-semibold text-card-foreground">
                  {trip.VesselName}
                </Text>
                <Text className="text-sm text-muted-foreground">
                  ID: {trip.VesselID}
                </Text>
              </View>

              <View className="space-y-2">
                <View className="flex-row">
                  <Text className="text-sm font-medium text-muted-foreground w-20">
                    From:
                  </Text>
                  <Text className="text-sm text-card-foreground flex-1">
                    {trip.DepartingTerminalName} ({trip.DepartingTerminalAbbrev}
                    )
                  </Text>
                </View>

                {trip.ArrivingTerminalName && (
                  <View className="flex-row">
                    <Text className="text-sm font-medium text-muted-foreground w-20">
                      To:
                    </Text>
                    <Text className="text-sm text-card-foreground flex-1">
                      {trip.ArrivingTerminalName} ({trip.ArrivingTerminalAbbrev}
                      )
                    </Text>
                  </View>
                )}

                <View className="flex-row">
                  <Text className="text-sm font-medium text-muted-foreground w-20">
                    Position:
                  </Text>
                  <Text className="text-sm text-card-foreground flex-1">
                    {trip.Latitude.toFixed(4)}, {trip.Longitude.toFixed(4)}
                  </Text>
                </View>

                <View className="flex-row">
                  <Text className="text-sm font-medium text-muted-foreground w-20">
                    Status:
                  </Text>
                  <View className="flex-row space-x-4 flex-1">
                    <Text className="text-sm text-card-foreground">
                      Speed: {trip.Speed.toFixed(1)} kts
                    </Text>
                    <Text className="text-sm text-card-foreground">
                      {trip.AtDock ? "At Dock" : "In Transit"}
                    </Text>
                    <Text className="text-sm text-card-foreground">
                      {trip.InService ? "In Service" : "Out of Service"}
                    </Text>
                  </View>
                </View>

                {trip.Eta && (
                  <View className="flex-row">
                    <Text className="text-sm font-medium text-muted-foreground w-20">
                      ETA:
                    </Text>
                    <Text className="text-sm text-card-foreground flex-1">
                      {trip.Eta.toLocaleTimeString()}
                    </Text>
                  </View>
                )}

                <View className="flex-row">
                  <Text className="text-sm font-medium text-muted-foreground w-20">
                    Updated:
                  </Text>
                  <Text className="text-sm text-card-foreground flex-1">
                    {trip.TimeStamp.toLocaleString()}
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
      <BottomSheetModalDemo />
    </View>
  );
}

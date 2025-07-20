import { useState } from "react";
import { View } from "react-native";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Text } from "@/components/ui/text";
import { log } from "@/lib";
import { ChevronDown } from "@/lib/icons/ChevronDown";

import routesBoundingBoxes from "../../assets/wsdot/routesBoundingBoxes.json";

type Route = {
  routeAbbrev: string;
  routeDescription: string;
  terminals: Array<{
    terminalAbbrev: string;
    longitude: number;
    latitude: number;
  }>;
  boundingBox: {
    minLongitude: number;
    minLatitude: number;
    maxLongitude: number;
    maxLatitude: number;
  };
};

type Coordinate = {
  latitude: number;
  longitude: number;
};

type RouteSelectorProps = {
  flyToCoordinates: (
    coordinates: Coordinate[],
    terminalAbbrevs: string[]
  ) => void;
};

/**
 * Route selector component that displays a dropdown menu of available ferry routes
 * and flies to the selected route's bounding box when clicked
 */
export const RouteSelector = ({ flyToCoordinates }: RouteSelectorProps) => {
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);

  const handleRouteSelect = (route: Route) => {
    try {
      setSelectedRoute(route);
      // Convert terminal coordinates to the format expected by flyToCoordinates
      const coordinates = route.terminals.map((terminal) => ({
        latitude: terminal.latitude,
        longitude: terminal.longitude,
      }));
      const terminalAbbrevs = route.terminals.map(
        (terminal) => terminal.terminalAbbrev
      );
      flyToCoordinates(coordinates, terminalAbbrevs);
    } catch (error) {
      log.error(`Error selecting route ${route.routeDescription}:`, error);
    }
  };

  return (
    <View className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="bg-white/90 backdrop-blur-sm border-gray-300 shadow-lg min-w-[200px]"
          >
            <Text className="text-gray-800 font-medium">
              {selectedRoute ? selectedRoute.routeDescription : "Select Route"}
            </Text>
            <ChevronDown size={16} className="ml-2 text-gray-600" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-64 max-h-80 overflow-y-auto">
          {routesBoundingBoxes.routes.map((route: Route) => (
            <DropdownMenuItem
              key={route.routeAbbrev}
              onPress={() => handleRouteSelect(route)}
              className="py-2"
            >
              <Text className="text-sm">{route.routeDescription}</Text>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </View>
  );
};

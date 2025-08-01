import { Text, View } from "react-native";

import { useWsdotTerminals } from "@/data/contexts";
import { useMapState } from "@/shared/contexts";

type Coordinate = { latitude: number; longitude: number };

type TerminalOverlayProps = {
  coordinates: Coordinate[];
  terminalAbbrevs: string[];
  calculatedZoomLevel: number | null;
};

/**
 * Terminal overlay component that displays terminal information and bounding box data
 */
const TerminalOverlay = ({
  coordinates,
  terminalAbbrevs,
  calculatedZoomLevel,
}: TerminalOverlayProps) => {
  const { zoom, mapDimensions } = useMapState();
  const { terminals } = useWsdotTerminals();

  // Calculate bounding box from coordinates
  const boundingBox =
    coordinates.length > 0
      ? {
          minLatitude: Math.min(...coordinates.map((c) => c.latitude)),
          maxLatitude: Math.max(...coordinates.map((c) => c.latitude)),
          minLongitude: Math.min(...coordinates.map((c) => c.longitude)),
          maxLongitude: Math.max(...coordinates.map((c) => c.longitude)),
        }
      : null;

  // Helper function to get terminal by abbreviation
  const getTerminalByAbbrev = (abbrev: string) => {
    return terminals.find((terminal) => terminal.TerminalAbbrev === abbrev);
  };

  return (
    <View className="absolute top-2.5 left-2.5 bg-white/50 p-2 rounded z-50 max-w-80">
      <Text className="text-sm font-bold text-black mb-1">Terminals</Text>
      <View className="max-h-40 overflow-hidden">
        {coordinates.map((coord, index) => {
          const abbrev = terminalAbbrevs[index] || `T${index + 1}`;
          const terminal = getTerminalByAbbrev(abbrev);
          const terminalName = terminal?.TerminalName || abbrev;
          return (
            <Text
              key={terminal?.TerminalID}
              className="text-xs font-mono text-black"
            >
              {`${abbrev.padEnd(4)} ${coord.latitude.toFixed(4)} ${coord.longitude.toFixed(4)}`}
            </Text>
          );
        })}
      </View>

      {boundingBox && (
        <>
          <Text className="text-sm font-bold text-black mt-2 mb-1">
            Bounding Box
          </Text>
          <Text className="text-xs font-mono text-black">
            {`Min: ${boundingBox.minLatitude.toFixed(4)}, ${boundingBox.minLongitude.toFixed(4)}`}
          </Text>
          <Text className="text-xs font-mono text-black">
            {`Max: ${boundingBox.maxLatitude.toFixed(4)}, ${boundingBox.maxLongitude.toFixed(4)}`}
          </Text>
          <Text className="text-xs font-mono text-black">
            {`Zoom: ${calculatedZoomLevel !== null ? calculatedZoomLevel.toFixed(2) : zoom.toFixed(2)}`}
          </Text>
          <Text className="text-xs font-mono text-black">
            {`Map: ${mapDimensions.width}×${mapDimensions.height}`}
          </Text>
        </>
      )}
    </View>
  );
};

export default TerminalOverlay;

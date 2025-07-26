// Common types for MarkerView component that work across platforms

import type { Anchor, MapboxExpression } from "../types";

// Common MarkerView props type
export type MarkerViewProps = {
  /** The coordinates of the marker */
  coordinate: [number, number];

  /** The anchor point of the marker relative to its size */
  anchor?: Anchor;

  /** Whether or not nearby markers on the map should all be displayed */
  allowOverlap?: boolean;

  /** Whether or not nearby markers on the map should be hidden if close to a UserLocation puck */
  allowOverlapWithPuck?: boolean;

  /** Whether the marker is selected */
  isSelected?: boolean;

  /** The content to render inside the marker */
  children?: React.ReactElement;
};

// Example usage:
//
// // Simple marker
// <MarkerView coordinate={[-122.3321, 47.6062]}>
//   <View style={styles.marker} />
// </MarkerView>
//
// // Marker with string anchor (web)
// <MarkerView
//   coordinate={[-122.3321, 47.6062]}
//   anchor="bottom"
// >
//   <View style={styles.marker} />
// </MarkerView>
//
// // Marker with object anchor (native)
// <MarkerView
//   coordinate={[-122.3321, 47.6062]}
//   anchor={{ x: 0.5, y: 1.0 }} // bottom center
// >
//   <View style={styles.marker} />
// </MarkerView>
//
// // Interactive marker with overlap settings
// <MarkerView
//   coordinate={[-122.3321, 47.6062]}
//   allowOverlap={true}
//   allowOverlapWithPuck={false}
//   isSelected={false}
// >
//   <TouchableOpacity style={styles.marker} onPress={() => console.log('Pressed')}>
//     <Text>Marker</Text>
//   </TouchableOpacity>
// </MarkerView>

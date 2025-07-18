# MarkerView Component

A cross-platform marker component for displaying interactive markers on maps, built with MapLibre GL JS and React Native Mapbox.

## Overview

The MarkerView component provides a unified interface for displaying markers across different platforms:
- **React Native**: Uses `@rnmapbox/maps` MarkerView
- **Web**: Uses `react-map-gl` Marker

## Features

- **Cross-platform compatibility**: Same API across iOS, Android, and Web
- **Flexible positioning**: Support for custom anchor points
- **Interactive content**: Custom React components as marker content
- **Overlap control**: Configurable marker overlap behavior
- **Selection state**: Support for selected/unselected states

## Props

### MarkerViewProps

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `coordinate` | `[number, number]` | **Required** | The coordinates of the marker |
| `anchor` | `Anchor` | `"center"` | The anchor point of the marker |
| `allowOverlap` | `boolean` | `false` | Whether nearby markers should all be displayed |
| `allowOverlapWithPuck` | `boolean` | `false` | Whether markers should be hidden near user location |
| `isSelected` | `boolean` | `false` | Whether the marker is selected |
| `children` | `React.ReactElement` | - | The content to render inside the marker |

### Anchor Type

The `anchor` prop supports both string and object formats:

**String format (web-friendly):**
- `"center"` - Center of the marker
- `"top"` - Top center
- `"bottom"` - Bottom center
- `"left"` - Left center
- `"right"` - Right center
- `"top-left"` - Top left corner
- `"top-right"` - Top right corner
- `"bottom-left"` - Bottom left corner
- `"bottom-right"` - Bottom right corner

**Object format (native-friendly):**
- `{ x: 0.5, y: 0.5 }` - Center (0.5, 0.5)
- `{ x: 0.5, y: 0 }` - Top center
- `{ x: 0.5, y: 1 }` - Bottom center
- `{ x: 0, y: 0.5 }` - Left center
- `{ x: 1, y: 0.5 }` - Right center
- `{ x: 0, y: 0 }` - Top left
- `{ x: 1, y: 0 }` - Top right
- `{ x: 0, y: 1 }` - Bottom left
- `{ x: 1, y: 1 }` - Bottom right

## Usage Examples

### Basic Marker

```typescript
import { MarkerView } from '@/components/mapbox';

function BasicMarker() {
  return (
    <MarkerView coordinate={[47.6062, -122.3321]}>
      <View style={styles.marker} />
    </MarkerView>
  );
}
```

### Custom Anchor Point

```typescript
import { MarkerView } from '@/components/mapbox';

function CustomAnchorMarker() {
  return (
    <MarkerView 
      coordinate={[47.6062, -122.3321]}
      anchor="bottom" // or { x: 0.5, y: 1 }
    >
      <View style={styles.marker} />
    </MarkerView>
  );
}
```

### Interactive Marker

```typescript
import { MarkerView } from '@/components/mapbox';
import { TouchableOpacity, Text } from 'react-native';

function InteractiveMarker() {
  return (
    <MarkerView 
      coordinate={[47.6062, -122.3321]}
      allowOverlap={true}
      isSelected={false}
    >
      <TouchableOpacity 
        style={styles.marker} 
        onPress={() => console.log('Marker pressed')}
      >
        <Text>Ferry Terminal</Text>
      </TouchableOpacity>
    </MarkerView>
  );
}
```

### Multiple Markers

```typescript
import { MarkerView } from '@/components/mapbox';

function MultipleMarkers() {
  const terminals = [
    { id: 1, coordinate: [47.6062, -122.3321], name: 'Seattle' },
    { id: 2, coordinate: [47.6021, -122.3393], name: 'Bainbridge' },
    { id: 3, coordinate: [47.5891, -122.5018], name: 'Bremerton' },
  ];

  return (
    <>
      {terminals.map(terminal => (
        <MarkerView 
          key={terminal.id}
          coordinate={terminal.coordinate}
          anchor="bottom"
        >
          <View style={styles.terminalMarker}>
            <Text>{terminal.name}</Text>
          </View>
        </MarkerView>
      ))}
    </>
  );
}
```

### Vessel Marker with Custom Styling

```typescript
import { MarkerView } from '@/components/mapbox';

function VesselMarker({ vessel }) {
  return (
    <MarkerView 
      coordinate={[vessel.longitude, vessel.latitude]}
      anchor={{ x: 0.5, y: 0.5 }}
      allowOverlap={true}
    >
      <View style={[
        styles.vesselMarker,
        { backgroundColor: vessel.status === 'active' ? '#4CAF50' : '#FF9800' }
      ]}>
        <Text style={styles.vesselName}>{vessel.name}</Text>
      </View>
    </MarkerView>
  );
}
```

## Platform Differences

### React Native (@rnmapbox/maps)
- Uses `MarkerView` component
- Supports object-based anchor points
- Handles overlap through `allowOverlap` and `allowOverlapWithPuck` props
- Children must be a single React element

### Web (react-map-gl)
- Uses `Marker` component
- Converts object anchors to string format
- Limited overlap control (handled at map level)
- Supports any React children

## Performance Considerations

- **Limit marker count**: Mapbox suggests using MarkerView for a maximum of around 100 views
- **Use SymbolLayer for static content**: For static markers, consider using `SymbolLayer` for better performance
- **Optimize children**: Keep marker content lightweight and avoid complex layouts
- **Consider clustering**: For large datasets, implement marker clustering

## Best Practices

1. **Use appropriate anchor points**: Choose anchor points that make sense for your marker content
2. **Handle interactions properly**: Use TouchableOpacity or similar for interactive markers
3. **Optimize for performance**: Limit the number of MarkerView components on screen
4. **Provide fallbacks**: Handle cases where markers might overlap or be hidden
5. **Test across platforms**: Verify behavior on both mobile and web platforms

## Related Components

- `MapView` - Main map container
- `Camera` - Map camera controls
- `SymbolLayer` - Alternative for static markers
- `ShapeSource` - Data source for map features 
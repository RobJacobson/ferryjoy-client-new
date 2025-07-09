# MapView Component

The MapView component is the main map container that provides an interactive mapping interface for vessel tracking and ferry route visualization.

## Overview

MapView serves as the primary map container component, providing:
- Interactive map rendering with MapLibre GL JS
- Real-time vessel tracking capabilities
- Custom map styling and theming
- Cross-platform compatibility (iOS, Android, Web)

## Features

### Core Functionality
- **Interactive Rendering**: Smooth map interactions and animations
- **Real-time Updates**: Live vessel position tracking
- **Custom Styling**: Configurable map appearance and themes
- **Cross-platform**: Consistent behavior across all platforms

### Map Controls
- **Zoom Controls**: Pinch-to-zoom and zoom buttons
- **Pan Controls**: Touch and drag navigation
- **Rotation**: Map rotation support
- **Tilt**: 3D perspective views

### Performance Features
- **Hardware Acceleration**: GPU-accelerated rendering
- **Viewport Optimization**: Efficient tile loading
- **Memory Management**: Automatic resource cleanup
- **Smooth Animations**: 60fps rendering performance

## Props

### Required Props
- `style` - Map container styles (ViewStyle)

### Optional Props
- `initialRegion` - Initial map viewport (Region)
- `styleURL` - Custom map style URL or object
- `onRegionChange` - Region change callback function
- `onMapPress` - Map press event handler
- `onMapLongPress` - Map long press event handler
- `showsUserLocation` - Show user location indicator
- `followsUserLocation` - Follow user location updates
- `showsCompass` - Show compass indicator
- `showsScale` - Show scale indicator
- `showsTraffic` - Show traffic information
- `loadingEnabled` - Show loading indicator
- `loadingBackgroundColor` - Loading background color
- `loadingIndicatorColor` - Loading indicator color

## Usage Examples

### Basic Map Setup
```typescript
import { MapView } from '@/components/map';

function BasicMap() {
  return (
    <MapView
      style={styles.map}
      initialRegion={{
        latitude: 47.6062,
        longitude: -122.4194,
        latitudeDelta: 0.1,
        longitudeDelta: 0.1,
      }}
    />
  );
}
```

### Real-time Vessel Tracking
```typescript
import { MapView } from '@/components/map';
import { useVesselLocations } from '@/data/wsf/vessels';

function VesselMap() {
  const { data: vessels } = useVesselLocations();

  return (
    <MapView
      style={styles.map}
      initialRegion={{
        latitude: 47.6062,
        longitude: -122.4194,
        latitudeDelta: 0.5,
        longitudeDelta: 0.5,
      }}
      onRegionChange={(region) => {
        console.log('Map region changed:', region);
      }}
    >
      {/* Vessel markers and layers */}
    </MapView>
  );
}
```

### Custom Map Styling
```typescript
import { MapView } from '@/components/map';

function CustomStyledMap() {
  const customStyle = {
    version: 8,
    sources: {
      'mapbox-streets': {
        type: 'vector',
        url: 'mapbox://mapbox.mapbox-streets-v8'
      }
    },
    layers: [
      // Custom layer definitions
    ]
  };

  return (
    <MapView
      style={styles.map}
      styleURL={customStyle}
      showsCompass={true}
      showsScale={true}
    />
  );
}
```

### Dark Mode Support
```typescript
import { MapView } from '@/components/map';
import { useColorScheme } from '@/lib/useColorScheme';

function ThemedMap() {
  const colorScheme = useColorScheme();
  const mapStyle = colorScheme === 'dark' 
    ? 'mapbox://styles/mapbox/dark-v10'
    : 'mapbox://styles/mapbox/light-v10';

  return (
    <MapView
      style={styles.map}
      styleURL={mapStyle}
      loadingEnabled={true}
      loadingBackgroundColor={colorScheme === 'dark' ? '#000' : '#fff'}
    />
  );
}
```

## Event Handling

### Region Change Events
```typescript
function MapWithRegionTracking() {
  const handleRegionChange = (region: Region) => {
    console.log('Map moved to:', region);
    // Update camera position or fetch new data
  };

  return (
    <MapView
      style={styles.map}
      onRegionChange={handleRegionChange}
    />
  );
}
```

### Map Interaction Events
```typescript
function InteractiveMap() {
  const handleMapPress = (event: MapPressEvent) => {
    const { coordinate } = event.nativeEvent;
    console.log('Map pressed at:', coordinate);
  };

  const handleMapLongPress = (event: MapLongPressEvent) => {
    const { coordinate } = event.nativeEvent;
    console.log('Map long pressed at:', coordinate);
  };

  return (
    <MapView
      style={styles.map}
      onMapPress={handleMapPress}
      onMapLongPress={handleMapLongPress}
    />
  );
}
```

## Performance Optimization

### Efficient Rendering
```typescript
import { useMemo } from 'react';
import { MapView } from '@/components/map';

function OptimizedMap() {
  const initialRegion = useMemo(() => ({
    latitude: 47.6062,
    longitude: -122.4194,
    latitudeDelta: 0.1,
    longitudeDelta: 0.1,
  }), []);

  return (
    <MapView
      style={styles.map}
      initialRegion={initialRegion}
      loadingEnabled={true}
    />
  );
}
```

### Memory Management
```typescript
import { useEffect } from 'react';
import { MapView } from '@/components/map';

function MapWithCleanup() {
  useEffect(() => {
    return () => {
      // Cleanup map resources on unmount
      console.log('Cleaning up map resources');
    };
  }, []);

  return (
    <MapView
      style={styles.map}
      loadingEnabled={true}
    />
  );
}
```

## Error Handling

### Graceful Fallback
```typescript
import { useState } from 'react';
import { MapView } from '@/components/map';

function MapWithFallback() {
  const [mapError, setMapError] = useState(false);

  if (mapError) {
    return (
      <View style={styles.errorContainer}>
        <Text>Unable to load map. Please try again.</Text>
      </View>
    );
  }

  return (
    <MapView
      style={styles.map}
      onError={() => setMapError(true)}
    />
  );
}
```

## Platform-Specific Features

### iOS Features
- **Native MapKit**: Native iOS map rendering
- **3D Buildings**: 3D building visualization
- **Flyover**: Satellite flyover mode
- **Indoor Maps**: Indoor mapping support

### Android Features
- **Google Maps**: Native Android map rendering
- **Street View**: Street view integration
- **Traffic Data**: Real-time traffic information
- **Indoor Navigation**: Indoor navigation support

### Web Features
- **MapLibre GL JS**: Web-based map rendering
- **WebGL Acceleration**: Hardware-accelerated rendering
- **Custom Controls**: Web-specific map controls
- **Responsive Design**: Adaptive layout support

## Styling

### Container Styles
```typescript
const styles = StyleSheet.create({
  map: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  mapContainer: {
    flex: 1,
    backgroundColor: '#f0f0f0',
  },
});
```

### Custom Map Styles
```typescript
const customMapStyle = {
  version: 8,
  sources: {
    'mapbox-streets': {
      type: 'vector',
      url: 'mapbox://mapbox.mapbox-streets-v8'
    }
  },
  layers: [
    {
      id: 'background',
      type: 'background',
      paint: {
        'background-color': '#f8f9fa'
      }
    },
    // Additional layers...
  ]
};
```

## Development Tools

### Debugging
- **Map Inspector**: Visual debugging tools
- **Performance Monitoring**: Render performance tracking
- **Network Monitoring**: Tile request tracking
- **Error Tracking**: Comprehensive error reporting

### Testing
- **Component Testing**: React component testing
- **Integration Testing**: Map and data integration
- **Performance Testing**: Load testing and optimization
- **Cross-Platform Testing**: Platform-specific testing

## Future Enhancements

### Planned Features
- **3D Visualization**: Three-dimensional map rendering
- **AR Integration**: Augmented reality features
- **Advanced Analytics**: Map usage analytics
- **Custom Overlays**: User-defined map overlays

### Performance Improvements
- **WebGL Optimization**: Advanced rendering techniques
- **Data Streaming**: Real-time data streaming
- **Offline Maps**: Full offline map support
- **Advanced Caching**: Sophisticated caching strategies 
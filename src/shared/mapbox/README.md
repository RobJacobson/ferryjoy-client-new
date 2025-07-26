# Map Components

The map components provide an interactive mapping interface for the FerryJoy application, built with MapLibre GL JS and React Native Mapbox.

## Overview

This module provides a complete mapping solution for:
- Real-time vessel tracking and visualization
- Interactive ferry routes and terminals
- Custom map styling and theming
- Cross-platform compatibility (iOS, Android, Web)

## Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   App Layer     │    │   Map Layer     │    │   Data Layer    │
│   (Screens)     │◄──►│   (Components)  │◄──►│   (WSF APIs)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Navigation    │    │   MapLibre      │    │   React Query   │
│   (Expo Router) │    │   (Rendering)   │    │   (Cache/State) │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Components

### MapView
Main map container component with vessel tracking and interactive features.

**Features:**
- Real-time vessel position display
- Interactive zoom and pan controls
- Custom map styling and theming
- Cross-platform compatibility

**Props:**
- `style` - Map container styles
- `children` - Child map components
- `initialRegion` - Initial map viewport
- `onRegionChange` - Region change callback

### Camera
Controls map camera position, zoom, and animations.

**Features:**
- Smooth camera transitions
- Follow vessel functionality
- Zoom level management
- Animation controls

**Props:**
- `centerCoordinate` - Map center coordinates
- `zoomLevel` - Map zoom level
- `animationDuration` - Animation duration
- `followUserLocation` - Follow user location

### CircleLayer
Displays vessel positions as animated circles on the map.

**Features:**
- Animated vessel indicators
- Color coding by vessel status
- Click handlers for vessel information
- Customizable styling

**Props:**
- `id` - Layer identifier
- `sourceLayerId` - Source layer ID
- `circleColor` - Circle color
- `circleRadius` - Circle radius

### ShapeSource
Manages GeoJSON data sources for vessel tracks and routes.

**Features:**
- Vessel track visualization
- Route line display
- Terminal markers
- Clustering support

**Props:**
- `id` - Source identifier
- `shape` - GeoJSON data
- `cluster` - Enable clustering
- `clusterRadius` - Clustering radius

### VesselLayer
Specialized layer for vessel visualization with advanced features.

**Features:**
- Vessel icon display
- Heading indicators
- Speed-based styling
- Interactive tooltips

## Usage Examples

### Basic Map Setup
```typescript
import { MapView, Camera, CircleLayer, ShapeSource } from '@/components/map';

function VesselMap() {
  return (
    <MapView style={styles.map}>
      <Camera
        centerCoordinate={[-122.4194, 47.6062]} // Seattle
        zoomLevel={10}
        animationDuration={1000}
      />
      <ShapeSource id="vessels" shape={vesselGeoJson}>
        <CircleLayer
          id="vessel-positions"
          sourceLayerId="vessels"
          circleColor="#007AFF"
          circleRadius={8}
        />
      </ShapeSource>
    </MapView>
  );
}
```

### Real-time Vessel Tracking
```typescript
import { useVesselLocations } from '@/data/wsf/vessels';
import { MapView, Camera, VesselLayer } from '@/components/map';

function VesselTracker() {
  const { data: vessels } = useVesselLocations();
  const vesselGeoJson = useVesselsGeoJson(vessels);

  return (
    <MapView style={styles.map}>
      <Camera
        centerCoordinate={[-122.4194, 47.6062]}
        zoomLevel={10}
      />
      <VesselLayer
        vessels={vessels}
        geoJson={vesselGeoJson}
        onVesselPress={(vessel) => {
          // Handle vessel selection
        }}
      />
    </MapView>
  );
}
```

### Interactive Route Display
```typescript
import { useRoutes } from '@/data/wsf/schedule';
import { MapView, Camera, ShapeSource } from '@/components/map';

function RouteMap() {
  const { data: routes } = useRoutes();
  const routeGeoJson = useRoutesGeoJson(routes);

  return (
    <MapView style={styles.map}>
      <Camera
        centerCoordinate={[-122.4194, 47.6062]}
        zoomLevel={8}
      />
      <ShapeSource id="routes" shape={routeGeoJson}>
        <LineLayer
          id="route-lines"
          sourceLayerId="routes"
          lineColor="#FF6B35"
          lineWidth={3}
        />
      </ShapeSource>
    </MapView>
  );
}
```

### Terminal Information
```typescript
import { useTerminalSailingSpace } from '@/data/wsf/terminals';
import { MapView, Camera, Marker } from '@/components/map';

function TerminalMap() {
  const { data: terminals } = useTerminalSailingSpace();

  return (
    <MapView style={styles.map}>
      <Camera
        centerCoordinate={[-122.4194, 47.6062]}
        zoomLevel={9}
      />
      {terminals?.map(terminal => (
        <Marker
          key={terminal.terminalId}
          coordinate={[terminal.longitude, terminal.latitude]}
          title={terminal.terminalName}
          description={`Wait: ${terminal.waitTime} min`}
        />
      ))}
    </MapView>
  );
}
```

## Map Styling

### Custom Map Style
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
    // Custom layer definitions
  ]
};

function CustomStyledMap() {
  return (
    <MapView
      style={styles.map}
      styleURL={customMapStyle}
    >
      {/* Map content */}
    </MapView>
  );
}
```

### Dark Mode Support
```typescript
import { useColorScheme } from '@/lib/useColorScheme';

function ThemedMap() {
  const colorScheme = useColorScheme();
  const mapStyle = colorScheme === 'dark' ? darkMapStyle : lightMapStyle;

  return (
    <MapView
      style={styles.map}
      styleURL={mapStyle}
    >
      {/* Map content */}
    </MapView>
  );
}
```

## Performance Optimizations

### Rendering Optimization
- **Viewport Culling**: Only render visible features
- **Clustering**: Automatic point clustering for large datasets
- **Lazy Loading**: Load map tiles on demand
- **Memory Management**: Efficient cleanup of map resources

### Data Optimization
- **GeoJSON Optimization**: Efficient data structures
- **Caching**: React Query for data caching
- **Background Updates**: Non-blocking data refresh
- **Compression**: Optimized data transfer

### Animation Performance
- **Hardware Acceleration**: GPU-accelerated animations
- **Smooth Transitions**: Optimized camera movements
- **Frame Rate Optimization**: 60fps rendering
- **Memory Efficient**: Minimal memory footprint

## Cross-Platform Support

### Platform-Specific Features
- **iOS**: Native MapKit integration
- **Android**: Native Google Maps integration
- **Web**: MapLibre GL JS rendering
- **Consistent API**: Same interface across platforms

### Platform Adaptations
- **Touch Handling**: Platform-specific touch events
- **Performance**: Platform-optimized rendering
- **Features**: Platform-specific capabilities
- **Styling**: Platform-appropriate visual design

## Error Handling

### Map Loading Errors
- **Graceful Fallback**: Default map when custom styles fail
- **Error Boundaries**: React error boundary integration
- **User Feedback**: Clear error messages
- **Retry Logic**: Automatic retry on failure

### Data Errors
- **Null Safety**: Handle missing or invalid data
- **Validation**: Runtime data validation
- **Fallback Values**: Default values for missing data
- **Error Logging**: Comprehensive error tracking

## Development Tools

### Debugging
- **Map Inspector**: Visual debugging tools
- **Performance Monitoring**: Render performance tracking
- **Network Monitoring**: Tile and data request tracking
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
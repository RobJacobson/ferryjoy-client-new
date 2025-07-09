# Camera Component

The Camera component controls map camera position, zoom level, and animations for smooth map navigation and vessel tracking.

## Overview

The Camera component provides programmatic control over the map viewport, enabling:
- Smooth camera transitions and animations
- Automatic vessel following
- Zoom level management
- Custom animation controls

## Features

### Core Functionality
- **Camera Positioning**: Control map center and zoom level
- **Smooth Animations**: Hardware-accelerated camera transitions
- **Vessel Following**: Automatic camera tracking of vessels
- **Animation Control**: Customizable animation duration and easing

### Animation Features
- **Duration Control**: Configurable animation timing
- **Easing Functions**: Smooth animation curves
- **Interruption Handling**: Graceful animation cancellation
- **Performance Optimization**: Efficient animation rendering

## Props

### Required Props
- `centerCoordinate` - Map center coordinates [longitude, latitude]
- `zoomLevel` - Map zoom level (0-20)

### Optional Props
- `animationDuration` - Animation duration in milliseconds
- `animationMode` - Animation mode ('flyTo' | 'easeTo' | 'jumpTo')
- `heading` - Map rotation in degrees
- `pitch` - Map tilt in degrees
- `followUserLocation` - Follow user location updates
- `followsUserLocation` - Alternative prop name for user location following
- `followsUserLocationWithHeading` - Follow user location with heading
- `followsUserLocationWithCourse` - Follow user location with course
- `followsUserLocationWithAccuracy` - Follow user location with accuracy
- `followsUserLocationWithAltitude` - Follow user location with altitude
- `followsUserLocationWithSpeed` - Follow user location with speed
- `followsUserLocationWithVerticalAccuracy` - Follow user location with vertical accuracy
- `followsUserLocationWithHorizontalAccuracy` - Follow user location with horizontal accuracy

## Usage Examples

### Basic Camera Setup
```typescript
import { Camera } from '@/components/map';

function BasicMap() {
  return (
    <MapView style={styles.map}>
      <Camera
        centerCoordinate={[-122.4194, 47.6062]} // Seattle
        zoomLevel={10}
        animationDuration={1000}
      />
    </MapView>
  );
}
```

### Vessel Following Camera
```typescript
import { Camera } from '@/components/map';
import { useVesselLocations } from '@/data/wsf/vessels';

function VesselTracker() {
  const { data: vessels } = useVesselLocations();
  const selectedVessel = vessels?.[0]; // Follow first vessel

  return (
    <MapView style={styles.map}>
      <Camera
        centerCoordinate={
          selectedVessel 
            ? [selectedVessel.longitude, selectedVessel.latitude]
            : [-122.4194, 47.6062]
        }
        zoomLevel={12}
        animationDuration={2000}
        animationMode="flyTo"
      />
    </MapView>
  );
}
```

### Dynamic Camera Updates
```typescript
import { useState, useEffect } from 'react';
import { Camera } from '@/components/map';

function DynamicCamera() {
  const [cameraPosition, setCameraPosition] = useState({
    centerCoordinate: [-122.4194, 47.6062],
    zoomLevel: 10,
  });

  useEffect(() => {
    const interval = setInterval(() => {
      // Update camera position every 5 seconds
      setCameraPosition(prev => ({
        ...prev,
        zoomLevel: prev.zoomLevel + 0.1,
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <MapView style={styles.map}>
      <Camera
        centerCoordinate={cameraPosition.centerCoordinate}
        zoomLevel={cameraPosition.zoomLevel}
        animationDuration={1000}
      />
    </MapView>
  );
}
```

### User Location Following
```typescript
import { Camera } from '@/components/map';

function UserLocationMap() {
  return (
    <MapView style={styles.map}>
      <Camera
        centerCoordinate={[-122.4194, 47.6062]}
        zoomLevel={14}
        followsUserLocation={true}
        followsUserLocationWithHeading={true}
        animationDuration={500}
      />
    </MapView>
  );
}
```

### Custom Animation Modes
```typescript
import { Camera } from '@/components/map';

function AnimatedMap() {
  return (
    <MapView style={styles.map}>
      <Camera
        centerCoordinate={[-122.4194, 47.6062]}
        zoomLevel={12}
        animationMode="easeTo"
        animationDuration={1500}
        heading={45} // Rotate map 45 degrees
        pitch={30}   // Tilt map 30 degrees
      />
    </MapView>
  );
}
```

## Animation Modes

### flyTo
Smooth camera transition with curved path.

```typescript
<Camera
  centerCoordinate={[-122.4194, 47.6062]}
  zoomLevel={15}
  animationMode="flyTo"
  animationDuration={2000}
/>
```

### easeTo
Smooth camera transition with easing function.

```typescript
<Camera
  centerCoordinate={[-122.4194, 47.6062]}
  zoomLevel={12}
  animationMode="easeTo"
  animationDuration={1000}
/>
```

### jumpTo
Instant camera transition without animation.

```typescript
<Camera
  centerCoordinate={[-122.4194, 47.6062]}
  zoomLevel={10}
  animationMode="jumpTo"
/>
```

## Performance Optimization

### Efficient Updates
```typescript
import { useMemo } from 'react';
import { Camera } from '@/components/map';

function OptimizedCamera({ vessels }) {
  const cameraConfig = useMemo(() => {
    if (!vessels?.length) {
      return {
        centerCoordinate: [-122.4194, 47.6062],
        zoomLevel: 10,
      };
    }

    // Calculate optimal camera position for all vessels
    const bounds = calculateVesselBounds(vessels);
    return {
      centerCoordinate: bounds.center,
      zoomLevel: bounds.zoomLevel,
    };
  }, [vessels]);

  return (
    <MapView style={styles.map}>
      <Camera
        centerCoordinate={cameraConfig.centerCoordinate}
        zoomLevel={cameraConfig.zoomLevel}
        animationDuration={1000}
      />
    </MapView>
  );
}
```

### Animation Throttling
```typescript
import { useCallback } from 'react';
import { Camera } from '@/components/map';

function ThrottledCamera() {
  const handleCameraUpdate = useCallback((camera) => {
    // Throttle camera updates to improve performance
    console.log('Camera updated:', camera);
  }, []);

  return (
    <MapView style={styles.map}>
      <Camera
        centerCoordinate={[-122.4194, 47.6062]}
        zoomLevel={12}
        animationDuration={500}
        onUpdate={handleCameraUpdate}
      />
    </MapView>
  );
}
```

## Error Handling

### Graceful Fallback
```typescript
import { Camera } from '@/components/map';

function SafeCamera({ coordinates }) {
  const safeCoordinates = coordinates || [-122.4194, 47.6062];
  const safeZoomLevel = Math.max(0, Math.min(20, zoomLevel || 10));

  return (
    <MapView style={styles.map}>
      <Camera
        centerCoordinate={safeCoordinates}
        zoomLevel={safeZoomLevel}
        animationDuration={1000}
      />
    </MapView>
  );
}
```

## Platform-Specific Features

### iOS Features
- **Native Animations**: iOS-native animation system
- **Smooth Transitions**: Hardware-accelerated rendering
- **Gesture Integration**: Native gesture recognition
- **Performance Optimization**: iOS-specific optimizations

### Android Features
- **Google Maps Integration**: Native Android map animations
- **Hardware Acceleration**: GPU-accelerated rendering
- **Gesture Support**: Android gesture system integration
- **Memory Management**: Android-specific memory optimization

### Web Features
- **MapLibre GL JS**: Web-based animation system
- **WebGL Rendering**: Hardware-accelerated web rendering
- **Smooth Animations**: 60fps web animations
- **Cross-browser Support**: Consistent behavior across browsers

## Development Tools

### Debugging
- **Animation Inspector**: Visual animation debugging
- **Performance Monitoring**: Animation performance tracking
- **Coordinate Validation**: Camera coordinate validation
- **Error Tracking**: Animation error reporting

### Testing
- **Animation Testing**: Animation behavior testing
- **Performance Testing**: Animation performance testing
- **Cross-platform Testing**: Platform-specific testing
- **Integration Testing**: Camera and map integration testing

## Future Enhancements

### Planned Features
- **Advanced Easing**: Custom easing functions
- **Animation Sequences**: Complex animation sequences
- **3D Camera Control**: Three-dimensional camera positioning
- **Gesture Integration**: Advanced gesture controls

### Performance Improvements
- **Animation Optimization**: Advanced animation optimization
- **Memory Management**: Improved memory usage
- **Rendering Pipeline**: Optimized rendering pipeline
- **Hardware Acceleration**: Enhanced hardware acceleration 
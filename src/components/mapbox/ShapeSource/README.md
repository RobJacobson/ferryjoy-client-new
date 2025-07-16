# ShapeSource Component

The ShapeSource component manages GeoJSON data sources for vessel tracks, routes, and other geographic data on the map.

## Overview

ShapeSource provides a data source layer for rendering geographic features including:
- Vessel tracks and positions
- Ferry routes and paths
- Terminal locations and markers
- Custom geographic overlays

## Features

### Core Functionality
- **GeoJSON Support**: Full GeoJSON data format support
- **Real-time Updates**: Live data source updates
- **Clustering**: Automatic point clustering for large datasets
- **Filtering**: Feature filtering and selection

### Data Management
- **Multiple Sources**: Support for multiple data sources
- **Dynamic Updates**: Real-time data source modifications
- **Memory Management**: Efficient data handling
- **Performance Optimization**: Optimized rendering performance

## Props

### Required Props
- `id` - Unique source identifier (string)
- `shape` - GeoJSON data object or URL

### Optional Props
- `cluster` - Enable point clustering (boolean)
- `clusterRadius` - Clustering radius in pixels (number)
- `clusterMaxZoom` - Maximum zoom level for clustering (number)
- `clusterMinPoints` - Minimum points for clustering (number)
- `clusterProperties` - Custom cluster properties (object)
- `maxzoom` - Maximum zoom level for source (number)
- `minzoom` - Minimum zoom level for source (number)
- `buffer` - Tile buffer size (number)
- `tolerance` - Simplification tolerance (number)
- `lineMetrics` - Enable line metrics (boolean)
- `generateId` - Generate feature IDs (boolean)
- `promoteId` - Promote ID property (string)
- `filter` - Feature filter expression
- `children` - Child layer components

## Usage Examples

### Basic Vessel Data Source
```typescript
import { ShapeSource } from '@/components/map';

function BasicVesselMap() {
  const vesselGeoJson = {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [-122.4194, 47.6062]
        },
        properties: {
          vesselId: 1,
          vesselName: 'Walla Walla'
        }
      }
    ]
  };

  return (
    <MapView style={styles.map}>
      <ShapeSource id="vessels" shape={vesselGeoJson}>
        {/* Child layers */}
      </ShapeSource>
    </MapView>
  );
}
```

### Clustered Vessel Positions
```typescript
import { ShapeSource } from '@/components/map';

function ClusteredVessels() {
  return (
    <MapView style={styles.map}>
      <ShapeSource 
        id="vessels" 
        shape={vesselGeoJson}
        cluster={true}
        clusterRadius={50}
        clusterMaxZoom={15}
        clusterMinPoints={2}
      >
        <CircleLayer
          id="vessel-clusters"
          sourceLayerId="vessels"
          filter={['has', 'point_count']}
          circleColor="#007AFF"
          circleRadius={[
            'step',
            ['get', 'point_count'],
            20, 100,
            30, 750,
            40, 1000
          ]}
        />
        <CircleLayer
          id="vessel-positions"
          sourceLayerId="vessels"
          filter={['!', ['has', 'point_count']]}
          circleColor="#007AFF"
          circleRadius={8}
        />
      </ShapeSource>
    </MapView>
  );
}
```

### Ferry Routes with Line Features
```typescript
import { ShapeSource } from '@/components/map';

function FerryRoutes() {
  const routeGeoJson = {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        geometry: {
          type: 'LineString',
          coordinates: [
            [-122.4194, 47.6062], // Seattle
            [-122.5076, 47.6205]  // Bainbridge
          ]
        },
        properties: {
          routeId: 1,
          routeName: 'Seattle-Bainbridge'
        }
      }
    ]
  };

  return (
    <MapView style={styles.map}>
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

### Dynamic Data Updates
```typescript
import { useState, useEffect } from 'react';
import { ShapeSource } from '@/components/map';

function DynamicVesselMap() {
  const [vesselData, setVesselData] = useState(null);

  useEffect(() => {
    const fetchVesselData = async () => {
      const response = await fetch('/api/vessels');
      const data = await response.json();
      setVesselData(data);
    };

    fetchVesselData();
    const interval = setInterval(fetchVesselData, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <MapView style={styles.map}>
      <ShapeSource id="vessels" shape={vesselData}>
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

### Multiple Data Sources
```typescript
import { ShapeSource } from '@/components/map';

function MultiSourceMap() {
  return (
    <MapView style={styles.map}>
      {/* Vessel positions */}
      <ShapeSource id="vessels" shape={vesselGeoJson}>
        <CircleLayer
          id="vessel-positions"
          sourceLayerId="vessels"
          circleColor="#007AFF"
          circleRadius={8}
        />
      </ShapeSource>

      {/* Ferry routes */}
      <ShapeSource id="routes" shape={routeGeoJson}>
        <LineLayer
          id="route-lines"
          sourceLayerId="routes"
          lineColor="#FF6B35"
          lineWidth={3}
        />
      </ShapeSource>

      {/* Terminal locations */}
      <ShapeSource id="terminals" shape={terminalGeoJson}>
        <CircleLayer
          id="terminal-markers"
          sourceLayerId="terminals"
          circleColor="#00FF00"
          circleRadius={12}
        />
      </ShapeSource>
    </MapView>
  );
}
```

## Data Formats

### Point Features (Vessels)
```typescript
const vesselGeoJson = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [longitude, latitude]
      },
      properties: {
        vesselId: 1,
        vesselName: 'Walla Walla',
        status: 'active',
        speed: 15,
        heading: 45
      }
    }
  ]
};
```

### Line Features (Routes)
```typescript
const routeGeoJson = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      geometry: {
        type: 'LineString',
        coordinates: [
          [startLongitude, startLatitude],
          [endLongitude, endLatitude]
        ]
      },
      properties: {
        routeId: 1,
        routeName: 'Seattle-Bainbridge',
        duration: 35
      }
    }
  ]
};
```

### Polygon Features (Areas)
```typescript
const areaGeoJson = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [longitude1, latitude1],
          [longitude2, latitude2],
          [longitude3, latitude3],
          [longitude1, latitude1] // Close the polygon
        ]]
      },
      properties: {
        areaId: 1,
        areaName: 'Terminal Zone',
        type: 'restricted'
      }
    }
  ]
};
```

## Performance Optimization

### Efficient Data Handling
```typescript
import { useMemo } from 'react';
import { ShapeSource } from '@/components/map';

function OptimizedVesselMap({ vessels }) {
  const vesselGeoJson = useMemo(() => {
    if (!vessels?.length) {
      return { type: 'FeatureCollection', features: [] };
    }

    return {
      type: 'FeatureCollection',
      features: vessels.map(vessel => ({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [vessel.longitude, vessel.latitude]
        },
        properties: {
          vesselId: vessel.vesselId,
          status: vessel.status,
          speed: vessel.speed
        }
      }))
    };
  }, [vessels]);

  return (
    <MapView style={styles.map}>
      <ShapeSource 
        id="vessels" 
        shape={vesselGeoJson}
        cluster={vessels.length > 100}
        clusterRadius={50}
        maxzoom={20}
        minzoom={0}
      >
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

### Memory Management
```typescript
import { useEffect } from 'react';
import { ShapeSource } from '@/components/map';

function MemoryOptimizedMap({ dataUrl }) {
  useEffect(() => {
    return () => {
      // Cleanup data source on unmount
      console.log('Cleaning up data source');
    };
  }, []);

  return (
    <MapView style={styles.map}>
      <ShapeSource 
        id="dynamic-data" 
        shape={dataUrl}
        buffer={128}
        tolerance={0.5}
      >
        <CircleLayer
          id="data-points"
          sourceLayerId="dynamic-data"
          circleColor="#007AFF"
          circleRadius={6}
        />
      </ShapeSource>
    </MapView>
  );
}
```

## Error Handling

### Data Validation
```typescript
import { ShapeSource } from '@/components/map';

function SafeShapeSource({ data }) {
  const safeGeoJson = useMemo(() => {
    if (!data || !data.features) {
      return { type: 'FeatureCollection', features: [] };
    }

    const validFeatures = data.features.filter(feature => {
      return feature.geometry && 
             feature.geometry.coordinates &&
             Array.isArray(feature.geometry.coordinates);
    });

    return {
      type: 'FeatureCollection',
      features: validFeatures
    };
  }, [data]);

  return (
    <MapView style={styles.map}>
      <ShapeSource id="safe-data" shape={safeGeoJson}>
        <CircleLayer
          id="data-points"
          sourceLayerId="safe-data"
          circleColor="#007AFF"
          circleRadius={8}
        />
      </ShapeSource>
    </MapView>
  );
}
```

## Platform-Specific Features

### iOS Features
- **Native Rendering**: iOS-native data source rendering
- **Memory Management**: iOS-specific memory optimization
- **Performance**: Optimized for iOS performance
- **Integration**: Native iOS map integration

### Android Features
- **Google Maps Integration**: Native Android data source rendering
- **Hardware Acceleration**: GPU-accelerated rendering
- **Memory Management**: Android-specific memory optimization
- **Performance**: Optimized for Android performance

### Web Features
- **MapLibre GL JS**: Web-based data source rendering
- **WebGL Rendering**: Hardware-accelerated web rendering
- **Cross-browser Support**: Consistent behavior across browsers
- **Performance**: Optimized for web performance

## Development Tools

### Debugging
- **Data Inspector**: Visual data source debugging
- **Performance Monitoring**: Data source performance tracking
- **Memory Profiling**: Memory usage monitoring
- **Error Tracking**: Data source error reporting

### Testing
- **Component Testing**: ShapeSource component testing
- **Performance Testing**: Data source performance testing
- **Cross-platform Testing**: Platform-specific testing
- **Integration Testing**: Data source and map integration testing

## Future Enhancements

### Planned Features
- **Advanced Clustering**: Sophisticated clustering algorithms
- **Dynamic Filtering**: Runtime data filtering
- **Data Streaming**: Real-time data streaming
- **Custom Sources**: Custom data source implementations

### Performance Improvements
- **Rendering Optimization**: Advanced rendering optimization
- **Memory Management**: Improved memory usage
- **Data Compression**: Efficient data compression
- **Hardware Acceleration**: Enhanced hardware acceleration 
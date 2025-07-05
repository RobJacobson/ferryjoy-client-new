# Cross-Platform MapView Component

This directory contains platform-specific MapView components that provide a unified API following the RNMapbox/maps interface. The native version (`MapView.tsx`) re-exports the @rnmapbox/maps components, while the web version (`MapView.web.tsx`) wraps react-map-gl/mapbox to match the same interface.

## Components

### MapView
The main map container component that works across all platforms.

```tsx
import { MapView } from "@/components/map";

<MapView 
  style={{ flex: 1 }} 
  styleURL="mapbox://styles/mapbox/dark-v11"
  scaleBarEnabled={false}
>
  {/* Map children */}
</MapView>
```

### Camera
Controls the map camera position and animations.

```tsx
import { Camera } from "@/components/map";

<Camera
  zoomLevel={10}
  centerCoordinate={[longitude, latitude]}
  animationDuration={2000}
  heading={0}
  pitch={30}
/>
```

### ShapeSource
Displays GeoJSON data on the map.

```tsx
import { ShapeSource } from "@/components/map";

<ShapeSource id="my-data" shape={geoJSONData}>
  {/* Layer components */}
</ShapeSource>
```

### CircleLayer
Renders circles on the map (used within ShapeSource).

```tsx
import { CircleLayer } from "@/components/map";

<CircleLayer
  id="my-circles"
  style={{
    circleRadius: 8,
    circleColor: "#3B82F6",
    circleOpacity: 0.8,
    circleStrokeWidth: 2,
    circleStrokeColor: "#FFFFFF",
    circleStrokeOpacity: 1,
  }}
/>
```

## Complete Example

```tsx
import { MapView, Camera, ShapeSource, CircleLayer } from "@/components/map";

const MyMap = () => {
  const geoJSON = {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [-122.4194, 37.7749], // San Francisco
        },
        properties: { name: "San Francisco" },
      },
    ],
  };

  return (
    <MapView style={{ flex: 1 }} styleURL="mapbox://styles/mapbox/dark-v11">
      <Camera
        zoomLevel={10}
        centerCoordinate={[-122.4194, 37.7749]}
        animationDuration={2000}
        pitch={30}
      />
      
      <ShapeSource id="cities" shape={geoJSON}>
        <CircleLayer
          id="city-circles"
          style={{
            circleRadius: 12,
            circleColor: "#FF6B6B",
            circleOpacity: 0.9,
            circleStrokeWidth: 3,
            circleStrokeColor: "#FFFFFF",
          }}
        />
      </ShapeSource>
    </MapView>
  );
};
```

## Migration from Platform-Specific Components

### Before (Platform-Specific)
```tsx
// Map.tsx (Native)
import Mapbox from "@rnmapbox/maps";
<Mapbox.MapView>
  <Mapbox.Camera />
  <Mapbox.ShapeSource>
    <Mapbox.CircleLayer />
  </Mapbox.ShapeSource>
</Mapbox.MapView>

// Map.web.tsx (Web)
import * as ReactMapGL from "react-map-gl/mapbox";
<ReactMapGL.Map>
  <ReactMapGL.Source>
    <ReactMapGL.Layer />
  </ReactMapGL.Source>
</ReactMapGL.Map>
```

### After (Unified Interface)
```tsx
// Works on both platforms with same interface
import { MapView, Camera, ShapeSource, CircleLayer } from "@/components/map";

<MapView>
  <Camera />
  <ShapeSource>
    <CircleLayer />
  </ShapeSource>
</MapView>
```

## Available Components

- **MapCrossPlatform**: A complete map component with vessel layer integration
- **MapViewDemo**: Example usage of the cross-platform components
- **VesselLayerCrossPlatform**: Cross-platform vessel layer component

## Environment Variables

Make sure to set the Mapbox access token:
```
EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN=your_mapbox_token_here
```

## Benefits

1. **Unified API**: Same interface across all platforms
2. **Type Safety**: Full TypeScript support with proper types
3. **Easy Migration**: Drop-in replacement for existing platform-specific components
4. **Maintainable**: Single codebase for map functionality
5. **Consistent**: Same behavior and styling across platforms 
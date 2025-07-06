# MapView Component

The MapView component is the main container for all map-related components. It provides the base map display and manages the Mapbox context for child components like Camera, ShapeSource, and various Layer components.

## Props

| Prop | Type | Required | Default | Description | Example |
|------|------|----------|---------|-------------|---------|
| `style` | `object` | No | - | CSS styles for the map container | `{ flex: 1 }` |
| `styleURL` | `string` | No | `"mapbox://styles/mapbox/dark-v11"` | URL of the Mapbox style to use | `StyleURL.Light` |
| `scaleBarEnabled` | `boolean` | No | `false` | Whether to show the scale bar | `true` |
| `children` | `React.ReactNode` | No | - | Child components to render within the map | Camera, ShapeSource, Layers |

## Style URLs

| Style | URL | Description |
|-------|-----|-------------|
| `StyleURL.Dark` | `"mapbox://styles/mapbox/dark-v11"` | Dark theme with minimal labels |
| `StyleURL.Light` | `"mapbox://styles/mapbox/light-v11"` | Light theme with minimal labels |
| `StyleURL.Streets` | `"mapbox://styles/mapbox/streets-v12"` | Standard street map with detailed labels |
| `StyleURL.Outdoors` | `"mapbox://styles/mapbox/outdoors-v12"` | Outdoor recreation focused style |
| `StyleURL.Satellite` | `"mapbox://styles/mapbox/satellite-v9"` | Satellite imagery without labels |
| `StyleURL.SatelliteStreet` | `"mapbox://styles/mapbox/satellite-streets-v12"` | Satellite imagery with street labels |

## Examples

### Basic Map View
```tsx
import { MapView, StyleURL } from "@/components/map";

<MapView
  styleURL={StyleURL.Dark}
  scaleBarEnabled={false}
>
  <Camera centerCoordinate={[47.6062, -122.3321]} zoomLevel={12} />
</MapView>
```

### Custom Styled Map
```tsx
import { MapView, StyleURL } from "@/components/map";

<MapView
  styleURL={StyleURL.Light}
  style={{ flex: 1, borderRadius: 8 }}
  scaleBarEnabled={true}
>
  <Camera centerCoordinate={[47.6062, -122.3321]} zoomLevel={12} />
</MapView>
```

### Satellite Map
```tsx
import { MapView, StyleURL } from "@/components/map";

<MapView
  styleURL={StyleURL.SatelliteStreet}
  style={{ width: "100%", height: "500px" }}
>
  <Camera centerCoordinate={[47.6062, -122.3321]} zoomLevel={15} />
</MapView>
```

### Complete Map with Data
```tsx
import { MapView, StyleURL, Camera, ShapeSource, CircleLayer } from "@/components/map";

const vesselData = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [-122.3321, 47.6062]
      },
      properties: {
        name: "Ferry Vessel"
      }
    }
  ]
};

<MapView
  styleURL={StyleURL.Dark}
  style={{ flex: 1 }}
  scaleBarEnabled={false}
>
  <Camera
    centerCoordinate={[47.6062, -122.3321]}
    zoomLevel={12}
    pitch={45}
  />
  <ShapeSource id="vessels" shape={vesselData}>
    <CircleLayer
      id="vessel-circles"
      sourceID="vessels"
      style={{
        circleRadius: 8,
        circleColor: "#3B82F6",
        circleOpacity: 0.8,
      }}
    />
  </ShapeSource>
</MapView>
```

### Responsive Map Container
```tsx
import { MapView, StyleURL } from "@/components/map";

<div className="w-full h-96">
  <MapView
    styleURL={StyleURL.Streets}
    style={{ width: "100%", height: "100%" }}
    scaleBarEnabled={true}
  >
    <Camera centerCoordinate={[47.6062, -122.3321]} zoomLevel={10} />
  </MapView>
</div>
```

## Usage Notes

- The MapView component must be the root container for all map-related components
- It automatically handles Mapbox access token configuration
- The component provides a context for child components to access the map instance
- Style URLs can be either predefined constants or custom Mapbox style URLs
- The component supports both web (react-map-gl) and native (@rnmapbox/maps) platforms
- Child components like Camera, ShapeSource, and Layers must be nested within MapView

## Platform Differences

| Platform | Implementation | Features |
|----------|----------------|----------|
| **Web** | `react-map-gl/mapbox` components | Full Mapbox GL JS functionality, viewport state management |
| **Native** | `@rnmapbox/maps` components | Native performance optimizations, React Native integration |

## Error Handling

| Error Type | Handling |
|------------|----------|
| Missing Mapbox access token | Displays user-friendly error message |
| Invalid style URLs | Graceful fallback to default style |
| Network connectivity issues | Retry logic with error messaging |

## Performance Considerations

| Consideration | Recommendation |
|---------------|----------------|
| Style selection | Use minimal styles for better performance |
| Scale bar | Disable if not needed |
| Layout | Use proper styling to avoid layout shifts |
| Platform optimization | Component automatically optimizes for target platform | 
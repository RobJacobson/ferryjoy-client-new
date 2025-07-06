# Camera Component

The Camera component provides programmatic control over the map's viewport, including position, zoom, rotation, and tilt. It supports smooth animations between different camera states.

## Props

| Prop | Type | Required | Default | Description | Example |
|------|------|----------|---------|-------------|---------|
| `centerCoordinate` | `[number, number]` | No | - | Sets the center point of the map viewport (longitude, latitude) | `[47.6062, -122.3321]` |
| `zoomLevel` | `number` | No | Current zoom | Sets the zoom level of the map (0-22) | `12` (city level) |
| `heading` | `number` | No | `0` | Sets the rotation of the map in degrees (0-360) | `90` (east up) |
| `pitch` | `number` | No | `0` | Sets the tilt of the map in degrees (0-60) | `45` (3D perspective) |
| `animationDuration` | `number` | No | `1000` | Duration of animation in milliseconds | `2000` (2 seconds) |
| `animationMode` | `"flyTo"` \| `"easeTo"` \| `"linearTo"` | No | `"flyTo"` | Type of animation to use | `"easeTo"` |

### Animation Modes

| Mode | Description |
|------|-------------|
| `"flyTo"` | Smooth curved flight path (default) |
| `"easeTo"` | Smooth easing animation |
| `"linearTo"` | Linear interpolation (only for center coordinate) |

## Examples

### Basic Camera Positioning
```tsx
import { Camera } from "@/components/map";

<Camera
  centerCoordinate={[47.6062, -122.3321]}
  zoomLevel={12}
  heading={0}
  pitch={0}
/>
```

### Animated Camera Movement
```tsx
import { Camera } from "@/components/map";

<Camera
  centerCoordinate={[47.6062, -122.3321]}
  zoomLevel={15}
  heading={45}
  pitch={30}
  animationDuration={2000}
  animationMode="flyTo"
/>
```

### Instant Camera Change
```tsx
import { Camera } from "@/components/map";

<Camera
  centerCoordinate={[47.6062, -122.3321]}
  zoomLevel={10}
  animationDuration={0}
/>
```

### 3D Perspective View
```tsx
import { Camera } from "@/components/map";

<Camera
  centerCoordinate={[47.6062, -122.3321]}
  zoomLevel={14}
  pitch={45}
  heading={0}
  animationDuration={1500}
  animationMode="easeTo"
/>
```

## Usage Notes

- The Camera component works in conjunction with the MapView component
- All props are optional - only the props you provide will be applied
- The component automatically handles the transition between different camera states
- On web, the component uses react-map-gl's camera controls
- On native, the component uses @rnmapbox/maps camera controls
- The component doesn't render any visible elements - it only controls the map viewport

## Platform Differences

| Platform | Implementation | Features |
|----------|----------------|----------|
| **Web** | react-map-gl's `flyTo`, `easeTo`, and `panTo` methods | Full animation support |
| **Native** | @rnmapbox/maps camera controls | Equivalent functionality | 
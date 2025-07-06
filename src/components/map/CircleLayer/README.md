# CircleLayer Component

The CircleLayer component renders circular markers on the map. It's used to display point data such as vessel locations, landmarks, or any other point-based information. The component supports both static styling and dynamic Mapbox expressions.

## Props

| Prop | Type | Required | Default | Description | Example |
|------|------|----------|---------|-------------|---------|
| `id` | `string` | Yes | - | Unique identifier for the layer | `"vessel-circles"` |
| `sourceID` | `string` | No | - | ID of the source that provides the data | `"vessels"` |
| `sourceLayerID` | `string` | No | - | ID of the source layer (vector tile sources) | `"points"` |
| `filter` | `FilterExpression` | No | - | Filter expression to show/hide features | `["==", ["get", "type"], "ferry"]` |
| `minZoomLevel` | `number` | No | - | Minimum zoom level for visibility | `10` |
| `maxZoomLevel` | `number` | No | - | Maximum zoom level for visibility | `20` |
| `style` | `CircleLayerStyle` | No | - | Styling properties for the circles | See Style Properties below |

## Style Properties

| Property | Type | Description | Example |
|----------|------|-------------|---------|
| `circleRadius` | `number` \| `MapboxExpression` | Size of the circles in pixels | `8` or `["interpolate", ["linear"], ["zoom"], 10, 4, 15, 12]` |
| `circleColor` | `string` \| `MapboxExpression` | Color of the circles | `"#3B82F6"` or `["case", ["==", ["get", "status"], "active"], "#10B981", "#EF4444"]` |
| `circleOpacity` | `number` \| `MapboxExpression` | Opacity of the circles (0-1) | `0.8` or `["interpolate", ["linear"], ["zoom"], 10, 0.5, 15, 1]` |
| `circleStrokeColor` | `string` \| `MapboxExpression` | Color of the circle border | `"#FFFFFF"` |
| `circleStrokeWidth` | `number` \| `MapboxExpression` | Width of the circle border in pixels | `2` |
| `circleStrokeOpacity` | `number` \| `MapboxExpression` | Opacity of the circle border (0-1) | `1` |
| `circleBlur` | `number` \| `MapboxExpression` | Blur radius of the circles | `0` |
| `circleSortKey` | `number` \| `MapboxExpression` | Sort key for rendering order | `1` or `["get", "priority"]` |
| `circlePitchAlignment` | `"map"` \| `"viewport"` \| `MapboxExpression` | Orientation when map is pitched | `"map"` (rotates) or `"viewport"` (upright) |
| `circlePitchScale` | `"map"` \| `"viewport"` \| `MapboxExpression` | Scale when map is pitched | `"map"` (scales) or `"viewport"` (maintains size) |
| `circleTranslate` | `[number, number]` \| `MapboxExpression` | Offset of the circles in pixels | `[0, 0]` or `[10, -5]` |
| `circleTranslateAnchor` | `"map"` \| `"viewport"` \| `MapboxExpression` | Reference frame for translate offset | `"map"` or `"viewport"` |
| `circleRadiusTransition` | `{ duration?: number; delay?: number }` | Transition settings for radius changes | `{ duration: 300, delay: 0 }` |
| `circleEmissiveStrength` | `number` \| `MapboxExpression` | Emissive strength for 3D lighting | `0` or `1` |

## Examples

### Basic Circle Layer
```tsx
import { CircleLayer } from "@/components/map";

<CircleLayer
  id="vessels"
  sourceID="vessels"
  style={{
    circleRadius: 8,
    circleColor: "#3B82F6",
    circleOpacity: 0.8,
    circleStrokeWidth: 2,
    circleStrokeColor: "#FFFFFF",
  }}
/>
```

### Dynamic Styling with Mapbox Expressions
```tsx
import { CircleLayer } from "@/components/map";

<CircleLayer
  id="vessels"
  sourceID="vessels"
  style={{
    circleRadius: ["interpolate", ["linear"], ["zoom"], 10, 4, 15, 12],
    circleColor: [
      "case",
      ["==", ["get", "inService"], true],
      "#10B981",
      "#EF4444"
    ],
    circleOpacity: ["interpolate", ["linear"], ["zoom"], 10, 0.5, 15, 1],
  }}
/>
```

### Filtered Layer
```tsx
import { CircleLayer } from "@/components/map";

<CircleLayer
  id="active-vessels"
  sourceID="vessels"
  filter={["==", ["get", "inService"], true]}
  style={{
    circleRadius: 10,
    circleColor: "#10B981",
    circleOpacity: 0.9,
  }}
/>
```

### Zoom-Based Visibility
```tsx
import { CircleLayer } from "@/components/map";

<CircleLayer
  id="detailed-vessels"
  sourceID="vessels"
  minZoomLevel={12}
  maxZoomLevel={20}
  style={{
    circleRadius: 6,
    circleColor: "#3B82F6",
    circleOpacity: 0.7,
  }}
/>
```

### Animated Circles
```tsx
import { CircleLayer } from "@/components/map";

<CircleLayer
  id="pulsing-vessels"
  sourceID="vessels"
  style={{
    circleRadius: 8,
    circleColor: "#3B82F6",
    circleOpacity: 0.8,
    circleRadiusTransition: { duration: 1000, delay: 0 },
  }}
/>
```

## Usage Notes

- The CircleLayer must be used within a ShapeSource or other data source component
- The `id` prop must be unique across all layers in the map
- Mapbox expressions allow for dynamic styling based on zoom level, feature properties, and other variables
- The component supports both web (react-map-gl) and native (@rnmapbox/maps) platforms
- Layer ordering is determined by the order of components in the JSX

## Platform Differences

| Platform | Implementation | Features |
|----------|----------------|----------|
| **Web** | react-map-gl's Layer component with Mapbox GL JS | Full Mapbox expression support |
| **Native** | @rnmapbox/maps CircleLayer component | Same props and styling options | 
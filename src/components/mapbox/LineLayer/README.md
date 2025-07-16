# LineLayer Component

A cross-platform line layer component for rendering GeoJSON line features on maps. Supports both mobile (React Native) and web platforms with a consistent API.

## Features

- **Cross-platform**: Works on both mobile (@rnmapbox/maps) and web (react-map-gl/mapbox)
- **Comprehensive styling**: Supports all common line layer properties
- **Mapbox expressions**: Dynamic styling with expressions
- **TypeScript support**: Full type safety with comprehensive interfaces
- **Performance optimized**: Efficient rendering with proper validation

## Basic Usage

```typescript
import { MapView, ShapeSource, LineLayer } from '@/components/mapbox';

function RouteMap() {
  const routeGeoJson = {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        geometry: {
          type: "LineString",
          coordinates: [[-122.4194, 47.6062], [-122.3351, 47.6097]]
        },
        properties: {
          routeId: "SEA-BI",
          active: true
        }
      }
    ]
  };

  return (
    <MapView>
      <ShapeSource id="routes" shape={routeGeoJson}>
        <LineLayer
          id="route-lines"
          style={{
            lineWidth: 3,
            lineColor: "#3B82F6",
            lineOpacity: 0.8,
          }}
        />
      </ShapeSource>
    </MapView>
  );
}
```

## Advanced Styling

### Dynamic Styling with Expressions

```typescript
<LineLayer
  id="routes"
  style={{
    lineWidth: ["interpolate", ["linear"], ["zoom"], 10, 2, 15, 6],
    lineColor: [
      "case",
      ["==", ["get", "active"], true], "#10B981",
      ["==", ["get", "maintenance"], true], "#F59E0B",
      "#6B7280"
    ],
    lineOpacity: ["interpolate", ["linear"], ["zoom"], 10, 0.5, 15, 1],
  }}
/>
```

### Dashed Lines

```typescript
<LineLayer
  id="routes"
  style={{
    lineWidth: 2,
    lineColor: "#EF4444",
    lineDasharray: [2, 2],
    lineCap: "round",
    lineJoin: "round",
  }}
/>
```

### Gradient Lines

```typescript
<LineLayer
  id="routes"
  style={{
    lineWidth: 4,
    lineGradient: [
      "interpolate",
      ["linear"],
      ["line-progress"],
      0, "#3B82F6",
      0.5, "#10B981",
      1, "#EF4444"
    ],
  }}
/>
```

### Conditional Styling

```typescript
<LineLayer
  id="routes"
  style={{
    lineWidth: ["case", ["==", ["get", "priority"], "high"], 4, 2],
    lineColor: [
      "match",
      ["get", "status"],
      "active", "#10B981",
      "inactive", "#6B7280",
      "maintenance", "#F59E0B",
      "#EF4444"
    ],
  }}
/>
```

## Style Properties

### Paint Properties

| Property | Type | Description |
|----------|------|-------------|
| `lineBlur` | `number \| MapboxExpression` | Blur applied to the line |
| `lineColor` | `string \| MapboxExpression` | Color of the line |
| `lineDasharray` | `Array<number> \| MapboxExpression` | Dash pattern for dashed lines |
| `lineGapWidth` | `number \| MapboxExpression` | Width of gaps between line segments |
| `lineGradient` | `string \| MapboxExpression` | Gradient color for the line |
| `lineJoin` | `"bevel" \| "round" \| "miter" \| MapboxExpression` | Line join style |
| `lineCap` | `"butt" \| "round" \| "square" \| MapboxExpression` | Line cap style |
| `lineMiterLimit` | `number \| MapboxExpression` | Maximum miter length |
| `lineOffset` | `number \| MapboxExpression` | Offset of the line |
| `lineOpacity` | `number \| MapboxExpression` | Opacity of the line |
| `linePattern` | `string \| MapboxExpression` | Pattern image for the line |
| `lineRoundLimit` | `number \| MapboxExpression` | Rounding limit for line joins |
| `
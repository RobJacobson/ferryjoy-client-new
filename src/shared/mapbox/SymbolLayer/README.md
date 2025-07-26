# SymbolLayer

A cross-platform SymbolLayer component that renders icons and text labels on maps using `@rnmapbox/maps` for mobile and `react-map-gl/mapbox` for web.

## Features

- **Cross-platform**: Works on both mobile (React Native) and web platforms
- **Comprehensive**: Supports all common SymbolLayer properties from Mapbox GL JS
- **Type-safe**: Full TypeScript support with comprehensive type definitions
- **Expression support**: Supports Mapbox expressions for dynamic styling
- **Performance optimized**: Efficient property mapping and validation

## Usage

### Basic Text Label

```tsx
import { SymbolLayer } from "@/components/mapbox/SymbolLayer";

<SymbolLayer
  id="vessel-labels"
  sourceID="vessels"
  style={{
    textField: ["get", "name"],
    textSize: 12,
    textColor: "#374151",
    textHaloColor: "white",
    textHaloWidth: 1,
  }}
/>
```

### Icon with Text

```tsx
<SymbolLayer
  id="terminals"
  sourceID="terminals"
  style={{
    iconImage: "ferry-terminal",
    iconSize: ["interpolate", ["linear"], ["zoom"], 10, 0.5, 15, 1],
    textField: ["get", "terminalName"],
    textSize: 10,
    textColor: "#1F2937",
    textOffset: [0, 1.5],
  }}
/>
```

### Conditional Styling

```tsx
<SymbolLayer
  id="vessels"
  sourceID="vessels"
  style={{
    iconImage: ["case", ["get", "inService"], "ferry-active", "ferry-inactive"],
    iconSize: ["interpolate", ["linear"], ["zoom"], 8, 0.3, 15, 1],
    textField: ["get", "vesselName"],
    textColor: ["case", ["get", "inService"], "#10B981", "#6B7280"],
    textSize: ["interpolate", ["linear"], ["zoom"], 10, 8, 15, 12],
  }}
/>
```

### Icon Only

```tsx
<SymbolLayer
  id="vessel-icons"
  sourceID="vessels"
  style={{
    iconImage: "ferry",
    iconSize: 1.2,
    iconColor: "#3B82F6",
    iconAllowOverlap: true,
  }}
/>
```

## Props

### SymbolLayerProps

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `id` | `string` | Yes | Unique identifier for the layer |
| `sourceID` | `string` | Yes | ID of the source to use for this layer |
| `sourceLayerID` | `string` | No | ID of the source layer (for vector tile sources) |
| `filter` | `FilterExpression` | No | Filter expression to apply to features |
| `minZoomLevel` | `number` | No | Minimum zoom level at which the layer is visible |
| `maxZoomLevel` | `number` | No | Maximum zoom level at which the layer is visible |
| `style` | `SymbolLayerStyle` | No | Style properties for the layer |

### SymbolLayerStyle

The `style` prop supports all common SymbolLayer properties organized into three categories:

#### Icon Properties
- `iconImage`: Icon image name or expression
- `iconSize`: Icon size or expression
- `iconColor`: Icon color or expression
- `iconOpacity`: Icon opacity or expression
- `iconAnchor`: Icon anchor point
- `iconOffset`: Icon offset from anchor point
- `iconRotate`: Icon rotation in degrees
- `iconAllowOverlap`: Whether icons can overlap
- `iconIgnorePlacement`: Whether to ignore placement constraints
- And many more...

#### Text Properties
- `textField`: Text content or expression
- `textSize`: Text size or expression
- `textColor`: Text color or expression
- `textOpacity`: Text opacity or expression
- `textAnchor`: Text anchor point
- `textOffset`: Text offset from anchor point
- `textRotate`: Text rotation in degrees
- `textHaloColor`: Text halo color
- `textHaloWidth`: Text halo width
- And many more...

#### Symbol Properties
- `symbolPlacement`: Symbol placement mode
- `symbolSpacing`: Spacing between symbols
- `symbolSortKey`: Sort key for symbol ordering
- `symbolAvoidEdges`: Whether to avoid edges
- And more...

## Mapbox Expressions

The component supports Mapbox expressions for dynamic styling:

```tsx
// Zoom-based sizing
iconSize: ["interpolate", ["linear"], ["zoom"], 10, 0.5, 15, 1]

// Conditional styling based on feature properties
iconColor: ["case", ["get", "inService"], "#10B981", "#EF4444"]

// Text from feature properties
textField: ["get", "name"]

// Complex expressions
textSize: [
  "interpolate",
  ["linear"],
  ["zoom"],
  8, ["case", ["get", "isMajor"], 12, 8],
  15, ["case", ["get", "isMajor"], 16, 12]
]
```

## Platform Differences

- **Mobile**: Uses `@rnmapbox/maps` and passes props directly to the native component
- **Web**: Uses `react-map-gl/mapbox` and converts props to Mapbox GL JS format

The component automatically handles platform-specific differences, so you can use the same API on both platforms.

## Performance Considerations

- Use `iconAllowOverlap: false` and `textAllowOverlap: false` when possible to improve performance
- Consider using `minZoomLevel` and `maxZoomLevel` to limit layer visibility
- Use filters to reduce the number of features rendered
- For large datasets, consider using `symbolSortKey` for proper layering

## Examples

See the types file for more detailed examples and the main map components for real-world usage patterns. 
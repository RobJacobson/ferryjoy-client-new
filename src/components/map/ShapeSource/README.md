# ShapeSource Component

The ShapeSource component provides GeoJSON data to map layers. It acts as a data source for rendering features like points, lines, and polygons on the map. The component supports both static GeoJSON data and dynamic data from URLs, with optional clustering capabilities.

## Props

| Prop | Type | Required | Default | Description | Example |
|------|------|----------|---------|-------------|---------|
| `id` | `string` | Yes | - | Unique identifier for the source | `"vessels"` |
| `shape` | `GeoJSONShape` | No* | - | GeoJSON data to display on the map | GeoJSON object |
| `url` | `string` | No* | - | URL to fetch GeoJSON data from (Web only) | `"https://api.example.com/vessels.geojson"` |
| `cluster` | `boolean` | No | `false` | Whether to cluster nearby points | `true` |
| `clusterRadius` | `number` | No | `50` | Radius in pixels for clustering points | `100` |
| `clusterMaxZoom` | `number` | No | `14` | Maximum zoom level for clustering (Web only) | `16` |
| `clusterProperties` | `Record<string, [string, MapboxExpression]>` | No | - | Custom properties for clustered features (Web only) | `{ "vesselCount": ["sum", ["get", "count"]] }` |
| `buffer` | `number` | No | - | Buffer size in pixels for tile loading | `128` |
| `tolerance` | `number` | No | - | Tolerance for line simplification | `0.375` |
| `lineMetrics` | `boolean` | No | `false` | Whether to calculate line metrics for gradient lines | `true` |
| `generateId` | `boolean` | No | `false` | Whether to generate feature IDs automatically | `true` |
| `maxzoom` | `number` | No | - | Maximum zoom level for the source (Web only) | `18` |
| `promoteId` | `string` | No | - | Property to use as feature ID (Web only) | `"vesselID"` |
| `filter` | `FilterExpression` | No | - | Filter expression to show/hide features (Web only) | `["==", ["get", "type"], "ferry"]` |
| `prefetch` | `number` | No | - | Number of tiles to prefetch (Web only) | `2` |
| `ttl` | `number` | No | - | Time to live for cached tiles in seconds (Web only) | `300` |
| `update` | `object` | No | - | Update configuration for dynamic data (Web only) | `{ data: newGeoJSON }` |
| `attribution` | `string` | No | - | Attribution text for the data source (Web only) | `"© OpenStreetMap contributors"` |
| `children` | `React.ReactElement` \| `React.ReactElement[]` | No | - | Layer components that use this source | CircleLayer, LineLayer |

*Either `shape` or `url` must be provided

## Examples

### Basic GeoJSON Source
```tsx
import { ShapeSource, CircleLayer } from "@/components/map";

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
        name: "Ferry Vessel",
        inService: true
      }
    }
  ]
};

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
```

### URL-based Source
```tsx
import { ShapeSource, CircleLayer } from "@/components/map";

<ShapeSource 
  id="vessels" 
  url="https://api.example.com/vessels.geojson"
>
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
```

### Clustered Points
```tsx
import { ShapeSource, CircleLayer } from "@/components/map";

<ShapeSource
  id="vessels"
  shape={vesselData}
  cluster={true}
  clusterRadius={50}
  clusterMaxZoom={14}
  clusterProperties={{
    vesselCount: ["sum", ["get", "count"]]
  }}
>
  <CircleLayer
    id="vessel-clusters"
    sourceID="vessels"
    filter={["has", "point_count"]}
    style={{
      circleRadius: ["step", ["get", "point_count"], 20, 100, 30, 750, 40],
      circleColor: "#51bbd6",
      circleOpacity: 0.8,
    }}
  />
  <CircleLayer
    id="vessel-count"
    sourceID="vessels"
    filter={["has", "point_count"]}
    style={{
      textField: ["get", "point_count_abbreviated"],
      textSize: 12,
      textColor: "#ffffff",
    }}
  />
</ShapeSource>
```

### Multiple Layers from One Source
```tsx
import { ShapeSource, CircleLayer, LineLayer } from "@/components/map";

<ShapeSource id="ferry-data" shape={ferryGeoJSON}>
  {/* Route lines */}
  <LineLayer
    id="ferry-routes"
    sourceID="ferry-data"
    filter={["==", ["get", "type"], "route"]}
    style={{
      lineColor: "#3B82F6",
      lineWidth: 3,
      lineOpacity: 0.8,
    }}
  />
  
  {/* Vessel points */}
  <CircleLayer
    id="ferry-vessels"
    sourceID="ferry-data"
    filter={["==", ["get", "type"], "vessel"]}
    style={{
      circleRadius: 8,
      circleColor: "#10B981",
      circleOpacity: 0.9,
    }}
  />
  
  {/* Terminal points */}
  <CircleLayer
    id="ferry-terminals"
    sourceID="ferry-data"
    filter={["==", ["get", "type"], "terminal"]}
    style={{
      circleRadius: 12,
      circleColor: "#F59E0B",
      circleOpacity: 1,
    }}
  />
</ShapeSource>
```

### Filtered Source
```tsx
import { ShapeSource, CircleLayer } from "@/components/map";

<ShapeSource
  id="vessels"
  shape={vesselData}
  filter={["==", ["get", "inService"], true]}
>
  <CircleLayer
    id="active-vessels"
    sourceID="vessels"
    style={{
      circleRadius: 10,
      circleColor: "#10B981",
      circleOpacity: 0.9,
    }}
  />
</ShapeSource>
```

### Dynamic Data Updates
```tsx
import { ShapeSource, CircleLayer } from "@/components/map";
import { useState, useEffect } from "react";

const [vesselData, setVesselData] = useState(null);

useEffect(() => {
  // Fetch updated data
  fetchVesselData().then(setVesselData);
}, []);

<ShapeSource
  id="vessels"
  shape={vesselData}
  update={{ data: vesselData }}
>
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
```

## Usage Notes

- The ShapeSource component must contain one or more Layer components as children
- Each source must have a unique `id` across the entire map
- Use `shape` for static data or `url` for dynamic data from an API
- Clustering is useful for displaying many points efficiently
- The component supports both web (react-map-gl) and native (@rnmapbox/maps) platforms
- Web-only props provide additional functionality not available on native

## Platform Differences

| Platform | Implementation | Features |
|----------|----------------|----------|
| **Web** | react-map-gl Source component | All props including web-only features, full Mapbox GL JS functionality |
| **Native** | @rnmapbox/maps ShapeSource component | Base props only, basic clustering, mobile optimization |

## Performance Considerations

| Consideration | Recommendation |
|---------------|----------------|
| Large datasets | Use clustering for 1000+ points |
| Performance | Use `buffer` and `tolerance` for optimization |
| Zoom levels | Use `maxzoom` to limit tile loading |
| Feature identification | Enable `generateId` for better feature handling |
| Smooth interaction | Use `prefetch` for better panning/zooming | 
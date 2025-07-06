# Data Contexts Documentation

This directory contains React contexts that provide shared state and functionality across the FerryJoy application.

## Available Contexts

- [VesselPositionsSmoothed](#vesselpositionssmoothed)

---

## VesselPositionsSmoothed

**Purpose**: Provides continuously smoothed vessel position data for fluid map animations, projecting positions into the near future to reduce perceived latency.

**Problem Solved**: The WSF API updates vessel positions every 5 seconds, which creates jerky, discontinuous movement when animating ferries on the map. This context projects vessel positions forward and interpolates between updates, providing smooth 1-second position updates and reducing perceived latency.

### Features

- **Exponential Smoothing**: Applies a moving average with a configurable smoothing period (default: 15 seconds)
- **Future Projection**: Projects vessel positions forward in time (default: 15 seconds) based on current speed (in knots) and heading, using Turf.js for accurate geospatial calculations
- **Intelligent Heading Smoothing**: Handles compass wrap-around and applies a 45° threshold for large changes
- **Teleport Detection**: Prevents smoothing when vessels move >500m (likely route changes)
- **Error Resilience**: Continues smoothing during API outages using last known data
- **Automatic Vessel Management**: Adds new vessels and handles disappearing vessels gracefully

### Basic Usage

```typescript
import { useVesselPositionsSmoothed } from '@/data/contexts';

function MapComponent() {
  const { smoothedVessels } = useVesselPositionsSmoothed();
  
  return (
    <MapView>
      {smoothedVessels.map(vessel => (
        <VesselMarker 
          key={vessel.vesselID}
          position={[vessel.lon, vessel.lat]}
          heading={vessel.heading}
          speed={vessel.speed}
        />
      ))}
    </MapView>
  );
}
```

### Provider Setup

Wrap your app with the provider (already done in `_layout.tsx`):

```typescript
import { VesselPositionsProvider } from '@/data/contexts';

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <VesselPositionsProvider>
        <YourAppContent />
      </VesselPositionsProvider>
    </QueryClientProvider>
  );
}
```

### Data Structure

- `VesselLocation[]` with smoothed and projected `lat`, `lon`, and `heading`
- All other vessel properties are current from the API

### Smoothing & Projection Algorithm

| Step                | Description                                                                                 |
|---------------------|--------------------------------------------------------------------------------------------|
| 1. Project Forward  | Each vessel's position is projected `PROJECTION_TIME_SECONDS` into the future using Turf.js|
| 2. Exponential Avg  | Each second, position is updated: `smoothed = prev * PREV_WEIGHT + projected * NEW_WEIGHT` |
| 3. Heading Smoothing| Handles compass wrap-around, applies threshold for large changes                           |
| 4. Teleport Check   | If vessel moves >500m, use projected position directly                                     |
| 5. New Vessels      | Added immediately at their current position                                                |

### Configuration Constants

| Constant                   | Default   | Description                                      |
|----------------------------|-----------|--------------------------------------------------|
| SMOOTHING_INTERVAL_MS      | 1000      | Smoothing update interval (ms)                   |
| SMOOTHING_PERIOD_MS        | 15000     | Smoothing period for exponential average (ms)    |
| NEW_WEIGHT                 | 0.066...  | Weight for new data (interval/period)            |
| PREV_WEIGHT                | 0.933...  | Weight for previous data                         |
| PROJECTION_TIME_SECONDS    | 15        | How far to project positions into the future     |
| TELEPORT_THRESHOLD_KM      | 0.5       | Distance threshold for teleport detection (km)   |
| HEADING_THRESHOLD_DEGREES  | 45        | Heading change threshold for instant update      |
| COORDINATE_PRECISION       | 6         | Decimal places for coordinates                   |
| KNOTS_TO_METERS_PER_SECOND | 0.514444  | Conversion factor for speed in knots             |

### Performance

- **Update Frequency**: 1Hz (every second)
- **API Frequency**: 0.2Hz (every 5 seconds)
- **Low Overhead**: Only one set of smoothed vessels in memory
- **CPU Usage**: Minimal

### Error Handling

- **API Outages**: Continues smoothing with last known positions
- **Missing Vessels**: Preserves last known smoothed position if vessel disappears from API
- **New Vessels**: Added immediately at their current position
- **Invalid Coordinates**: Gracefully handles NaN or invalid data
- **Teleportation**: Detects when vessels move >500m and skips smoothing

### Example: Smoothing Calculation

```typescript
// Exponential smoothing for latitude
smoothedLat = PREV_WEIGHT * prevLat + NEW_WEIGHT * projectedLat;
```

### Dependencies

- **React**: Context and hooks
- **@turf/turf**: Geospatial calculations
- **@/data/fetchWsf/vessels/useVesselLocations**: Raw API data
- **@/data/shared/VesselLocation**: Type definitions
- **@/lib/utils**: Coordinate helpers

---

## Adding New Contexts

When adding new contexts to this directory:

1. **Create the context file**: `NewContext.tsx`
2. **Export from index**: Add to `src/data/contexts/index.ts`
3. **Document here**: Add a new section to this documentation
4. **Add to provider tree**: Include in `_layout.tsx` if needed globally

Follow the pattern established by `VesselPositionsSmoothed` for consistency. 
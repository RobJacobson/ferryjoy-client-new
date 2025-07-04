# Data Contexts Documentation

This directory contains React contexts that provide shared state and functionality across the FerryJoy application.

## Available Contexts

### VesselPositionsSmoothed

**Purpose**: Provides smoothed vessel position data with exponential moving average calculations for fluid map animations.

**Problem Solved**: The WSF API updates vessel positions every 5 seconds, which creates jerky, discontinuous movement when animating ferries on the map. This context interpolates between API updates to create smooth 1-second position updates.

#### Features

- **Exponential Moving Average**: Applies 0.9/0.1 weighting for smooth position transitions
- **Specialized Heading Smoothing**: Handles circular compass math (359° → 1° transitions)
- **Directional Rounding**: Coordinates, speeds, and headings round in the direction of movement
- **High Precision**: 6 decimal place coordinates (~0.1m precision), 0.1 knot speed precision
- **Error Resilience**: Continues smoothing during API outages using last known data
- **Automatic Vessel Management**: Adds new vessels and handles disappearing vessels gracefully

#### Basic Usage

```typescript
import { useVesselPositionsSmoothed } from '@/data/contexts';

function MapComponent() {
  const { smoothedVessels } = useVesselPositionsSmoothed();
  
  return (
    <MapView>
      {smoothedVessels.map(vessel => (
        <VesselMarker 
          key={vessel.VesselID}
          position={[vessel.Longitude, vessel.Latitude]}
          heading={vessel.Heading}
          speed={vessel.Speed}
        />
      ))}
    </MapView>
  );
}
```

#### Provider Setup

The context provider must wrap your app components that need smoothed vessel data:

```typescript
// Already set up in src/app/_layout.tsx
import { VesselPositionsSmoothedProvider } from '@/data/contexts';

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <VesselPositionsSmoothedProvider>
        <YourAppContent />
      </VesselPositionsSmoothedProvider>
    </QueryClientProvider>
  );
}
```

#### Data Structure

The context provides `VesselLocation[]` objects with the same interface as the WSF API, but with smoothed position/motion properties:

**Smoothed Properties** (updated every second):
- `Latitude` - Rounded to 6 decimal places (~0.1m precision)
- `Longitude` - Rounded to 6 decimal places (~0.1m precision)  
- `Heading` - Compass-aware smoothing, rounded to 0.1° with directional rounding
- `Speed` - Rounded to 0.1 knot with directional rounding (up if increasing, down if decreasing)

**Current Properties** (updated from latest API data):
- `VesselName`, `InService`, `AtDock`, etc. - All operational data uses current values

#### Smoothing Algorithm Details

**Position Smoothing**:
```typescript
newLatitude = 0.9 * previousSmoothed + 0.1 * currentAPI
// Then rounded to 6 decimal places
```

**Heading Smoothing**:
- Calculates shortest angular path (359° → 1° = +2°, not +358°)
- Large changes >90° use new heading immediately (course corrections)
- Rounds up if heading increasing, down if decreasing

**Speed Smoothing**:
- Same exponential moving average as position
- Rounds to 0.1 knot precision
- Rounds up if speed increasing, down if decreasing

#### Performance Characteristics

- **Update Frequency**: 1Hz (every 1000ms)
- **API Frequency**: 0.2Hz (every 5000ms from Tanstack Query)
- **Smoothing Ratio**: 5x more frequent updates than raw data
- **Memory Overhead**: Minimal - only stores one set of smoothed vessels
- **CPU Usage**: Very low - simple arithmetic operations every second

#### Error Handling

- **API Outages**: Continues smoothing with last known positions
- **Missing Vessels**: Preserves last known smoothed position if vessel disappears from API
- **New Vessels**: Added immediately at their current position (no smoothing delay)
- **Invalid Data**: Gracefully handles edge cases in coordinate and heading calculations

#### Integration Examples

**Map Display**:
```typescript
// Replace raw API data with smoothed data
const { smoothedVessels } = useVesselPositionsSmoothed();
// Instead of: const { data: vessels } = useVesselLocations();

const geoJsonData = createVesselCollection(smoothedVessels);
```

**Vessel List Display**:
```typescript
function VesselList() {
  const { smoothedVessels } = useVesselPositionsSmoothed();
  
  return smoothedVessels.map(vessel => (
    <VesselCard key={vessel.VesselID}>
      <Text>Speed: {vessel.Speed.toFixed(1)} knots</Text>
      <Text>Position: {vessel.Latitude.toFixed(6)}, {vessel.Longitude.toFixed(6)}</Text>
      <Text>Heading: {vessel.Heading.toFixed(1)}°</Text>
    </VesselCard>
  ));
}
```

#### Configuration

Currently uses hardcoded constants optimized for ferry tracking:

```typescript
// Smoothing weights
PREVIOUS_WEIGHT: 0.9  // 90% previous value
CURRENT_WEIGHT: 0.1   // 10% new value

// Update frequency  
UPDATE_INTERVAL: 1000ms // 1 second

// Heading behavior
HEADING_THRESHOLD: 90° // Large changes skip smoothing
PRECISION: 0.1°        // Rounding precision

// Coordinate precision
COORDINATE_PRECISION: 6 decimal places
SPEED_PRECISION: 0.1 knots
```

#### Dependencies

- **React**: Context and hooks
- **@/data/wsf/vessels/hooks**: `useVesselLocations()` for raw API data
- **@/data/wsf/vessels/types**: `VesselLocation` type definitions

#### Development Notes

- **Testing**: Helper functions extracted for easy unit testing
- **Debugging**: Add `console.log(smoothedVessels.length)` to monitor vessel count
- **Performance**: Consider using `useMemo` for expensive transformations of smoothed data
- **Future**: Could be made configurable via provider props if different smoothing parameters are needed

---

## Adding New Contexts

When adding new contexts to this directory:

1. **Create the context file**: `NewContext.tsx`
2. **Export from index**: Add to `src/data/contexts/index.ts`
3. **Document here**: Add a new section to this documentation
4. **Add to provider tree**: Include in `_layout.tsx` if needed globally

Follow the pattern established by `VesselPositionsSmoothed` for consistency. 
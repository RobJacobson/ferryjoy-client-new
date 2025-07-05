# Data Contexts Documentation

This directory contains React contexts that provide shared state and functionality across the FerryJoy application.

## Available Contexts

### VesselPositionsSmoothed

**Purpose**: Provides smoothed vessel position data with exponential moving average calculations for fluid map animations.

**Problem Solved**: The WSF API updates vessel positions every 5 seconds, which creates jerky, discontinuous movement when animating ferries on the map. This context interpolates between API updates to create smooth 1-second position updates.

#### Features

- **Exponential Moving Average**: Applies 0.9/0.1 weighting for smooth position transitions
- **Intelligent Heading Smoothing**: Handles circular compass math with 45° threshold for large changes
- **Great Circle Distance**: Uses Turf.js for accurate distance calculations
- **High Precision**: 6 decimal place coordinates (~1m precision)
- **Teleport Detection**: Prevents smoothing when vessels move >500m (likely route changes)
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

#### Provider Setup

The context provider must wrap your app components that need smoothed vessel data:

```typescript
// Already set up in src/app/_layout.tsx
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

#### Data Structure

The context provides `VesselLocation[]` objects with the same interface as the WSF API, but with smoothed position/motion properties:

**Smoothed Properties** (updated every second):
- `lat` - Rounded to 6 decimal places (~1m precision)
- `lon` - Rounded to 6 decimal places (~1m precision)  
- `heading` - Compass-aware smoothing with 45° threshold for large changes
- `speed` - Exponential smoothing applied

**Current Properties** (updated from latest API data):
- `vesselName`, `inService`, `atDock`, etc. - All operational data uses current values

#### Smoothing Algorithm Details

**Position Smoothing**:
```typescript
// Uses roundCoordinate helper function
newLatitude = roundCoordinate(previousSmoothed.lat, currentAPI.lat)
newLongitude = roundCoordinate(previousSmoothed.lon, currentAPI.lon)

// Internal calculation: 0.9 * previous + 0.1 * current, then rounded
```

**Heading Smoothing**:
- Calculates shortest angular path (359° → 1° = +2°, not +358°)
- Large changes >45° use new heading immediately (course corrections, docking)
- Small changes apply exponential smoothing with normalization to 0-360° range

**Distance Calculation**:
- Uses Turf.js great circle distance for accurate measurements
- Returns distance in kilometers
- Used for teleport detection (>500m threshold)

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
- **Invalid Coordinates**: Gracefully handles NaN or invalid coordinate data
- **Teleportation**: Detects when vessels move >500m and skips smoothing (likely route changes)

#### Configuration Constants

```typescript
// Smoothing weights
NEW_WEIGHT = 0.1;                    // 10% new data
PREV_WEIGHT = 1 - NEW_WEIGHT;        // 90% previous data

// Update frequency  
SMOOTHING_INTERVAL_MS = 1000;        // 1 second

// Thresholds
TELEPORT_THRESHOLD_KM = 0.5;         // 500 meters
HEADING_THRESHOLD_DEGREES = 45;      // 45 degrees

// Precision
COORDINATE_PRECISION = 6;            // decimal places
```

#### Helper Functions

The component uses several utility functions for coordinate operations:

```typescript
// From @/lib/utils
toCoordinateArray(position: VesselPosition): [number, number]  // For Turf.js
fromCoordinateArray([lon, lat]): Pick<VesselPosition, 'lat' | 'lon'>
getCoordinates(lat, lon): [number, number]                     // For distance calculations

// Constants
SEATTLE_COORDINATES: [number, number] = [-122.3321, 47.6062]   // [longitude, latitude]
```

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
    <VesselCard key={vessel.vesselID}>
      <Text>Speed: {vessel.speed.toFixed(1)} knots</Text>
      <Text>Position: {vessel.lat.toFixed(6)}, {vessel.lon.toFixed(6)}</Text>
      <Text>Heading: {vessel.heading.toFixed(1)}°</Text>
    </VesselCard>
  ));
}
```

#### Architecture

**Component Structure**:
- `VesselPositionsProvider`: Main provider component using `PropsWithChildren`
- `useVesselSmoothing`: Custom hook containing all smoothing logic
- `useVesselPositionsSmoothed`: Context consumer hook with error handling

**Key Functions**:
- `applySmoothingToExistingVessels`: Main smoothing algorithm
- `calculateDistance`: Turf.js distance calculation
- `roundCoordinate`: Coordinate smoothing and rounding
- `smoothHeading`: Heading smoothing with threshold detection
- `getNewVessels`: Handles newly appeared vessels
- `hasValidCoordinates`: Coordinate validation helper

**State Management**:
- Uses refs to avoid infinite re-render loops
- Separates target data (from API) from smoothed data (for display)
- Maintains interval for continuous smoothing

#### Dependencies

- **React**: Context and hooks
- **@turf/turf**: Great circle distance calculations
- **@/data/fetchWsf/vessels/useVesselLocations**: Raw API data
- **@/data/shared/VesselLocation**: Type definitions
- **@/lib/utils**: Coordinate helper functions

#### Development Notes

- **Testing**: Helper functions extracted for easy unit testing
- **Debugging**: Add `console.log(smoothedVessels.length)` to monitor vessel count
- **Performance**: Uses refs to prevent unnecessary re-renders
- **Type Safety**: Full TypeScript support with proper type definitions
- **Future**: Could be made configurable via provider props if different smoothing parameters are needed

---

## Adding New Contexts

When adding new contexts to this directory:

1. **Create the context file**: `NewContext.tsx`
2. **Export from index**: Add to `src/data/contexts/index.ts`
3. **Document here**: Add a new section to this documentation
4. **Add to provider tree**: Include in `_layout.tsx` if needed globally

Follow the pattern established by `VesselPositionsSmoothed` for consistency. 
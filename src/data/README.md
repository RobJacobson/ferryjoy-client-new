# Data Layer Architecture

This directory contains all data-related code for the FerryJoy application, organized using a feature-based architecture with clear separation of concerns.

## 📁 Structure Overview

```
src/data/
├── types/                          # Shared type definitions
│   ├── shared.ts                   # Common types (LatLon, etc.)
│   ├── trip.ts                     # VesselTrip types
│   └── index.ts
├── sources/                        # Data source integrations
│   ├── wsf/                        # Washington State Ferries API
│   │   ├── shared/                 # Common WSF utilities
│   │   │   ├── api.ts              # Date parsing, common types
│   │   │   ├── fetch.ts            # WSF-specific fetch logic
│   │   │   └── index.ts
│   │   ├── cacheFlushDate/         # Cache flush date feature
│   │   │   ├── types.ts            # Feature-specific types
│   │   │   ├── api.ts              # API calls
│   │   │   ├── converter.ts        # Data transformation
│   │   │   ├── hook.ts             # React Query hooks
│   │   │   └── index.ts
│   │   ├── vesselLocations/        # Vessel locations feature
│   │   │   ├── types.ts
│   │   │   ├── api.ts
│   │   │   ├── converter.ts
│   │   │   ├── hook.ts
│   │   │   └── index.ts
│   │   ├── vesselVerbose/          # Vessel details feature
│   │   │   ├── types.ts
│   │   │   ├── api.ts
│   │   │   ├── converter.ts
│   │   │   ├── hook.ts
│   │   │   └── index.ts
│   │   └── index.ts                # Export all WSF features
│   └── supabase/                   # Supabase database integration
│       ├── vesselTrips/            # Vessel trips feature
│       │   ├── types.ts
│       │   ├── api.ts
│       │   ├── converter.ts
│       │   ├── hook.ts
│       │   └── index.ts
│       ├── vesselPositionMinute/   # Vessel position minute feature
│       │   ├── types.ts
│       │   ├── api.ts
│       │   ├── converter.ts
│       │   ├── hook.ts
│       │   └── index.ts
│       ├── client.ts               # Supabase client
│       ├── types.ts                # Database types
│       ├── monitoring.ts           # Performance monitoring
│       └── index.ts
├── contexts/                       # React contexts for data providers
│   ├── SupabaseData.tsx
│   ├── VesselPositionsSmoothed.tsx
│   └── index.ts
├── utils/                          # Cross-cutting utilities
│   ├── fetch.ts                    # Generic fetch utilities
│   ├── geoJson.ts                  # GeoJSON utilities
│   └── index.ts
└── index.ts                        # Main data exports
```

## 🏗️ Architecture Principles

### 1. Feature-Based Organization
Each data feature has its own folder with a complete data layer:
- **types.ts**: Type definitions specific to this feature
- **api.ts**: Data fetching functions
- **converter.ts**: Data transformation (API response → domain model)
- **hook.ts**: React hooks for data consumption
- **index.ts**: Clean exports for the feature

### 2. Single Responsibility
Each file has one clear purpose:
- **API files**: Handle data fetching only (internal)
- **Converter files**: Transform data only (internal)
- **Hook files**: Manage React state and caching only (public API)
- **Type files**: Define contracts only (public API)

### 3. Clear Dependencies
- Features can depend on shared utilities
- Features are independent of each other
- No circular dependencies

### 4. Clean Public API
- Only types and hooks are exported from feature folders
- API and converter functions are internal implementation details
- Components only see what they need to use

## 🚀 How to Use

### Using WSF Data

```typescript
// Import from a specific feature
import { useVesselLocations } from '@/data/sources/wsf/vesselLocations';
import { useVesselVerbose } from '@/data/sources/wsf/vesselVerbose';

// Use in components
const MyComponent = () => {
  const { data: vessels, isLoading } = useVesselLocations();
  const { data: vesselDetails } = useVesselVerbose();
  
  // Your component logic
};
```

### Using Supabase Data

#### Vessel Trips
```typescript
import { useVesselTrip } from '@/data/sources/supabase/vesselTrips';
import type { VesselTrip } from '@/data/sources/supabase/vesselTrips';

const VesselTripsComponent = () => {
  const { vesselTrips, loading, error } = useVesselTrip();
  
  if (loading) return <div>Loading vessel trips...</div>;
  if (error) return <div>Error: {error}</div>;
  
  // vesselTrips is a map where keys are vessel abbreviations
  // and values are arrays of VesselTrip objects
  return (
    <div>
      {Object.entries(vesselTrips).map(([vesselAbrv, trips]) => (
        <div key={vesselAbrv}>
          <h3>Vessel {vesselAbrv}</h3>
          {trips.map((trip: VesselTrip) => (
            <div key={trip.id}>
              Trip {trip.id}: {trip.depTermAbrv} → {trip.arvTermAbrv || 'Unknown'}
              {trip.timeStart && ` (Started: ${trip.timeStart.toLocaleString()})`}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};
```

#### Vessel Position Minutes
```typescript
import { useVesselPositionMinute } from '@/data/sources/supabase/vesselPositionMinute';
import type { VesselPositionMinute } from '@/data/sources/supabase/vesselPositionMinute';

const VesselPositionsComponent = () => {
  const { vesselPositionMinutes, loading, error } = useVesselPositionMinute();
  
  if (loading) return <div>Loading vessel positions...</div>;
  if (error) return <div>Error: {error}</div>;
  
  // vesselPositionMinutes is a map where keys are trip IDs
  // and values are arrays of VesselPositionMinute objects
  return (
    <div>
      {Object.entries(vesselPositionMinutes).map(([tripId, positions]) => (
        <div key={tripId}>
          <h3>Trip {tripId} Positions</h3>
          <p>Total positions: {positions.length}</p>
          {positions.slice(0, 5).map((position: VesselPositionMinute) => (
            <div key={position.id}>
              {position.timestamp.toLocaleString()}: 
              {position.lat.toFixed(4)}, {position.lon.toFixed(4)} 
              (Speed: {position.speed} knots, Heading: {position.heading}°)
            </div>
          ))}
          {positions.length > 5 && <p>... and {positions.length - 5} more positions</p>}
        </div>
      ))}
    </div>
  );
};
```

#### Combined Usage Example
```typescript
import { useVesselTrip } from '@/data/sources/supabase/vesselTrips';
import { useVesselPositionMinute } from '@/data/sources/supabase/vesselPositionMinute';

const VesselDashboard = () => {
  const { vesselTrips, loading: tripsLoading, error: tripsError } = useVesselTrip();
  const { vesselPositionMinutes, loading: positionsLoading, error: positionsError } = useVesselPositionMinute();
  
  if (tripsLoading || positionsLoading) return <div>Loading vessel data...</div>;
  if (tripsError) return <div>Trip Error: {tripsError}</div>;
  if (positionsError) return <div>Position Error: {positionsError}</div>;
  
  return (
    <div>
      <h2>Vessel Dashboard</h2>
      
      {/* Display trips with their latest positions */}
      {Object.entries(vesselTrips).map(([vesselAbrv, trips]) => (
        <div key={vesselAbrv}>
          <h3>Vessel {vesselAbrv}</h3>
          {trips.map((trip) => {
            const tripPositions = vesselPositionMinutes[trip.id] || [];
            const latestPosition = tripPositions[tripPositions.length - 1];
            
            return (
              <div key={trip.id} style={{ margin: '10px 0', padding: '10px', border: '1px solid #ccc' }}>
                <strong>Trip {trip.id}</strong><br />
                Route: {trip.depTermAbrv} → {trip.arvTermAbrv || 'Unknown'}<br />
                {latestPosition && (
                  <>
                    Latest Position: {latestPosition.lat.toFixed(4)}, {latestPosition.lon.toFixed(4)}<br />
                    Speed: {latestPosition.speed} knots | Heading: {latestPosition.heading}°<br />
                    At Dock: {latestPosition.atDock ? 'Yes' : 'No'}
                  </>
                )}
                <br />
                Total Positions: {tripPositions.length}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
};
```

### Using Shared Types

```typescript
// Import shared types
import type { VesselLocation } from '@/data/sources/wsf/vesselLocations';
import type { VesselTrip } from '@/data/sources/supabase/vesselTrips';
import type { VesselPositionMinute } from '@/data/sources/supabase/vesselPositionMinute';

// Use in your code
const processVessel = (vessel: VesselLocation) => {
  // Type-safe operations
};
```

### Using Contexts

```typescript
// Import contexts
import { useSupabaseData } from '@/data/contexts';
import { useVesselPositionsSmoothed } from '@/data/contexts';

// Use in components
const MyComponent = () => {
  const { vesselTrips, vesselPositionMinutes } = useSupabaseData();
  const { smoothedVessels } = useVesselPositionsSmoothed();
  
  // Your component logic
};
```

#### Context Usage Example
```typescript
import { useSupabaseData } from '@/data/contexts';

const VesselContextExample = () => {
  const { vesselTrips, vesselPositionMinutes } = useSupabaseData();
  
  // Access trip data
  const { vesselTrips: trips, loading: tripsLoading, error: tripsError } = vesselTrips;
  
  // Access position data
  const { vesselPositionMinutes: positions, loading: positionsLoading, error: positionsError } = vesselPositionMinutes;
  
  if (tripsLoading || positionsLoading) return <div>Loading...</div>;
  if (tripsError || positionsError) return <div>Error loading data</div>;
  
  return (
    <div>
      <h2>Vessel Data from Context</h2>
      
      {/* Display trips with their associated positions */}
      {Object.entries(trips).map(([vesselAbrv, tripList]) => (
        <div key={vesselAbrv}>
          <h3>Vessel {vesselAbrv}</h3>
          {tripList.map((trip) => {
            const tripPositions = positions[trip.id] || [];
            return (
              <div key={trip.id}>
                Trip {trip.id}: {tripPositions.length} positions
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
};
```

## ➕ Adding New Features

### Adding a New WSF API

1. Create a new feature folder:
```bash
mkdir src/data/sources/wsf/newFeature
```

2. Create the standard files:
```typescript
// types.ts
export type NewFeatureApiResponse = { /* API response types */ };
export type NewFeature = { /* Domain types */ };

// api.ts
export const getNewFeature = async () => {
  // API implementation
};

// converter.ts
export const mapNewFeature = (api: NewFeatureApiResponse): NewFeature => {
  // Conversion logic
};

// hook.ts
export const useNewFeature = () => {
  // React Query hook
};

// index.ts
export * from './types';
export * from './hook';
```

3. Export from the main WSF index:
```typescript
// src/data/sources/wsf/index.ts
export * from './newFeature';
```

### Adding a New Supabase Feature

Follow the same pattern as WSF features, but use the Supabase client instead of fetch:

```typescript
// api.ts
import { supabase } from '../client';

export const fetchNewFeature = async () => {
  const { data, error } = await supabase
    .from('new_feature_table')
    .select('*');
  
  if (error) throw error;
  return data;
};
```

## 🔧 Best Practices

### 1. Type Safety
- Always define types for API responses and domain models
- Use TypeScript strictly - avoid `any` types
- Leverage Supabase's generated types

### 2. Error Handling
- Handle errors gracefully in hooks
- Provide meaningful error messages
- Use React Query's built-in error handling

### 3. Performance
- Use React Query for caching and background updates
- Implement proper loading states
- Consider data size and network efficiency

### 4. Testing
- Test API functions independently
- Test converters with mock data
- Test hooks with React Testing Library

### 5. Naming Conventions
- Use camelCase for files and folders
- Use descriptive names that indicate purpose
- Keep file names singular (`converter.ts`, not `converters.ts`)

## 📊 Data Flow

```
External API/Database
       ↓
   api.ts (fetch/query)
       ↓
  converter.ts (transform)
       ↓
    hook.ts (React state)
       ↓
   Component (UI)
```

## 🔍 Troubleshooting

### Import Errors
- Check that index files export all necessary items
- Verify file paths are correct
- Ensure TypeScript can resolve the imports

### Type Errors
- Check that types are properly exported
- Verify API response types match domain types
- Ensure converters handle all required fields

### Performance Issues
- Check React Query configuration
- Monitor data sizes in logs
- Consider implementing pagination for large datasets

---

This architecture provides a clean, scalable foundation for managing data in the FerryJoy application. Each feature is self-contained, making it easy to add new data sources and maintain existing ones. 
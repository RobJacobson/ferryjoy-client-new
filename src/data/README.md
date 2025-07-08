# Data Layer Architecture

This directory contains all data-related code for the FerryJoy application, organized using a feature-based architecture with clear separation of concerns.

## 📁 Structure Overview

```
src/data/
├── types/                                # Shared type definitions
│   ├── shared.ts                         # Common types (LatLon, etc.)
│   ├── trip.ts                           # VesselTrip types
│   └── index.ts
├── sources/                              # Data source integrations
│   ├── wsf/                              # Washington State Ferries API
│   │   ├── shared/                       # Common WSF utilities
│   │   │   ├── config.ts                 # API configuration and types
│   │   │   ├── fetch.ts                  # Main fetch logic
│   │   │   ├── fetchJsonp.ts             # Web JSONP implementation
│   │   │   ├── fetchNative.ts            # Native fetch implementation
│   │   │   ├── apiFactory.ts             # API factory functions
│   │   │   ├── api.ts                    # Date parsing, common types
│   │   │   └── index.ts
│   │   ├── vessels/                      # Vessel-related features
│   │   │   ├── vesselLocations/          # Real-time vessel positions
│   │   │   │   ├── types.ts              # Feature-specific types
│   │   │   │   ├── api.ts                # API calls
│   │   │   │   ├── converter.ts          # Data transformation
│   │   │   │   ├── hook.ts               # React hooks
│   │   │   │   └── index.ts
│   │   │   ├── vesselVerbose/            # Detailed vessel information
│   │   │   │   ├── types.ts
│   │   │   │   ├── api.ts
│   │   │   │   ├── converter.ts
│   │   │   │   ├── hook.ts
│   │   │   │   └── index.ts
│   │   │   ├── cacheFlushDateVessels/    # Vessel cache flush date
│   │   │   │   ├── types.ts
│   │   │   │   ├── api.ts
│   │   │   │   ├── converter.ts
│   │   │   │   ├── hook.ts
│   │   │   │   └── index.ts
│   │   │   └── index.ts                  # Export all vessel features
│   │   ├── terminals/                    # Terminal-related features
│   │   │   ├── terminalSailingSpace/     # Terminal space availability
│   │   │   │   ├── types.ts
│   │   │   │   ├── api.ts
│   │   │   │   ├── converter.ts
│   │   │   │   ├── hook.ts
│   │   │   │   └── index.ts
│   │   │   ├── terminalverbose/          # Detailed terminal information
│   │   │   │   ├── types.ts
│   │   │   │   ├── api.ts
│   │   │   │   ├── converter.ts
│   │   │   │   ├── hook.ts
│   │   │   │   └── index.ts
│   │   │   ├── cacheFlushDateTerminals/  # Terminal cache flush date
│   │   │   │   ├── types.ts
│   │   │   │   ├── api.ts
│   │   │   │   ├── converter.ts
│   │   │   │   ├── hook.ts
│   │   │   │   └── index.ts
│   │   │   └── index.ts                  # Export all terminal features
│   │   └── index.ts                      # Export all WSF features
│   └── supabase/                         # Supabase database integration
│       ├── shared/                       # Shared Supabase utilities
│       │   ├── useSupabaseRealtime.ts    # Hook factory for real-time data
│       │   └── utils.ts                  # Common utilities
│       ├── vesselTrips/                  # Vessel trips feature
│       │   ├── types.ts
│       │   ├── api.ts
│       │   ├── converter.ts
│       │   ├── hook.ts
│       │   └── index.ts
│       ├── vesselPositionMinute/         # Vessel position minute feature
│       │   ├── types.ts
│       │   ├── api.ts
│       │   ├── converter.ts
│       │   ├── hook.ts
│       │   └── index.ts
│       ├── client.ts                     # Supabase client
│       ├── types.ts                      # Database types
│       └── index.ts
├── contexts/                             # React contexts for data providers
│   ├── SupabaseData.tsx
│   ├── VesselPositionsSmoothed.tsx
│   └── index.ts
├── utils/                                # Cross-cutting utilities
│   ├── fetch.ts                          # Generic fetch utilities
│   ├── geoJson.ts                        # GeoJSON utilities
│   └── index.ts
└── index.ts                              # Main data exports
```

## 🏗️ Architecture Principles

### 1. Feature-Based Organization
Each data feature has its own folder with a complete data layer:
- **types.ts**: Type definitions specific to this feature
- **api.ts**: Data fetching functions (using factory functions)
- **converter.ts**: Data transformation (API response → domain model)
- **hook.ts**: React hooks for data consumption
- **index.ts**: Clean exports for the feature

### 2. Single Responsibility
Each file has one clear purpose:
- **API files**: Handle data fetching only (internal)
- **Converter files**: Transform data only (internal)
- **Hook files**: Manage React state and caching only (public API)
- **Type files**: Define contracts only (public API)

### 3. DRY Principles with Factory Functions
- **API Factory**: `createArrayApi()` and `createSingleApi()` eliminate boilerplate
- **Consistent patterns**: All APIs follow the same structure
- **Type safety**: Full TypeScript support with proper generics

### 4. Clear Dependencies
- Features can depend on shared utilities
- Features are independent of each other
- No circular dependencies

### 5. Clean Public API
- Only types and hooks are exported from feature folders
- API and converter functions are internal implementation details
- Components only see what they need to use

### 6. Real-time Data Management
- Supabase features use a shared hook factory for consistent real-time subscriptions
- Hooks are optimized to run only when necessary (mount or specific dependencies)
- Automatic cleanup of subscriptions on unmount

## 🚀 How to Use

### Using WSF Data

#### Vessel Locations (Real-time)
```typescript
import { useVesselLocations } from '@/data/sources/wsf/vessels/vesselLocations';
import type { VesselLocation } from '@/data/sources/wsf/vessels/vesselLocations';

const VesselMap = () => {
  const { data: vessels, isLoading, error } = useVesselLocations();
  
  if (isLoading) return <div>Loading vessel positions...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  return (
    <div>
      {vessels?.map((vessel: VesselLocation) => (
        <div key={vessel.vesselID}>
          <h3>{vessel.vesselName}</h3>
          <p>Position: {vessel.lat.toFixed(4)}, {vessel.lon.toFixed(4)}</p>
          <p>Speed: {vessel.speed} knots, Heading: {vessel.heading}°</p>
          <p>Route: {vessel.depTermAbrv} → {vessel.arvTermAbrv || 'Unknown'}</p>
          <p>Status: {vessel.inService ? 'In Service' : 'Out of Service'}</p>
          {vessel.eta && <p>ETA: {vessel.eta.toLocaleString()}</p>}
        </div>
      ))}
    </div>
  );
};
```

#### Vessel Details (Cached)
```typescript
import { useVesselVerbose } from '@/data/sources/wsf/vessels/vesselVerbose';
import type { VesselVerbose } from '@/data/sources/wsf/vessels/vesselVerbose';

const VesselDetails = () => {
  const { data: vessels, isLoading } = useVesselVerbose();
  
  if (isLoading) return <div>Loading vessel details...</div>;
  
  return (
    <div>
      {vessels?.map((vessel: VesselVerbose) => (
        <div key={vessel.vesselID}>
          <h3>{vessel.vesselName} ({vessel.vesselAbrv})</h3>
          <p>Class: {vessel.class}</p>
          <p>Capacity: {vessel.seatingCapacity} passengers</p>
          <p>Vehicle Capacity: {vessel.maxEnclosedVehicleCapacity} enclosed, {vessel.maxOpenVehicleCapacity} open</p>
          <p>Built: {vessel.yearBuilt}</p>
          <p>Amenities: {vessel.hasWiFi ? 'WiFi' : ''} {vessel.hasRestrooms ? 'Restrooms' : ''} {vessel.hasGalley ? 'Galley' : ''}</p>
        </div>
      ))}
    </div>
  );
};
```

#### Terminal Sailing Space (Frequently Updated)
```typescript
import { useTerminalSailingSpace } from '@/data/sources/wsf/terminals/terminalSailingSpace';
import type { TerminalSailingSpace } from '@/data/sources/wsf/terminals/terminalSailingSpace';

const TerminalSpace = () => {
  const { data: terminals, isLoading } = useTerminalSailingSpace();
  
  if (isLoading) return <div>Loading terminal space...</div>;
  
  return (
    <div>
      {terminals?.map((terminal: TerminalSailingSpace) => (
        <div key={terminal.terminalId}>
          <h3>{terminal.terminalName}</h3>
          {terminal.departingSpaces.map((space, index) => (
            <div key={index}>
              <p>Departure: {space.departure}</p>
              <p>Vessel: {space.vesselName}</p>
              <p>Cancelled: {space.isCancelled ? 'Yes' : 'No'}</p>
              {space.spaceForArrivalTerminals.map((arrivalSpace, arrIndex) => (
                <div key={arrIndex}>
                  <p>To {arrivalSpace.terminalName}:</p>
                  <p>Drive-up: {arrivalSpace.driveUpSpaceCount || 'N/A'}</p>
                  <p>Reservations: {arrivalSpace.reservableSpaceCount || 'N/A'}</p>
                </div>
              ))}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};
```

#### Terminal Details (Comprehensive)
```typescript
import { useTerminalVerbose } from '@/data/sources/wsf/terminals/terminalverbose';
import type { TerminalVerbose } from '@/data/sources/wsf/terminals/terminalverbose';

const TerminalInfo = () => {
  const { data: terminals, isLoading } = useTerminalVerbose();
  
  if (isLoading) return <div>Loading terminal information...</div>;
  
  return (
    <div>
      {terminals?.map((terminal: TerminalVerbose) => (
        <div key={terminal.terminalId}>
          <h3>{terminal.terminalName}</h3>
          <p>Location: {terminal.terminalLocation}</p>
          <p>Address: {terminal.terminalAddress}, {terminal.terminalCity}, {terminal.terminalState}</p>
          <p>Phone: {terminal.terminalPhone}</p>
          <p>Hours: {terminal.terminalHours}</p>
          
          <h4>Current Wait Times</h4>
          <p>Vehicles: {terminal.terminalWaitTimes.vehicleWaitTime} minutes</p>
          <p>Walk-on: {terminal.terminalWaitTimes.walkOnWaitTime} minutes</p>
          
          <h4>Current Space</h4>
          <p>Drive-up: {terminal.terminalSailingSpace.driveUpSpaces}</p>
          <p>Reservations: {terminal.terminalSailingSpace.reservationSpaces}</p>
          <p>Total: {terminal.terminalSailingSpace.totalSpaces}</p>
          
          <h4>Bulletins</h4>
          {terminal.terminalBulletins.map((bulletin) => (
            <div key={bulletin.bulletinId}>
              <h5>{bulletin.bulletinTitle}</h5>
              <p>{bulletin.bulletinText}</p>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};
```

#### Cache Flush Dates (For Data Invalidation)
```typescript
import { useCacheFlushDate } from '@/data/sources/wsf/vessels/cacheFlushDateVessels';
import { useCacheFlushDateTerminals } from '@/data/sources/wsf/terminals/cacheFlushDateTerminals';

const CacheStatus = () => {
  const { data: vesselCache } = useCacheFlushDate();
  const { data: terminalCache } = useCacheFlushDateTerminals();
  
  return (
    <div>
      <h3>Cache Status</h3>
      <p>Vessel data last updated: {vesselCache?.cacheDate.toLocaleString()}</p>
      <p>Terminal data last updated: {terminalCache?.cacheDate.toLocaleString()}</p>
    </div>
  );
};
```

### Using Supabase Data

#### Vessel Trips
```typescript
import { useVesselTrip } from '@/data/sources/supabase/vesselTrips';
import type { VesselTrip } from '@/data/sources/supabase/vesselTrips';

const VesselTripsComponent = () => {
  const { data: vesselTrips, loading, error } = useVesselTrip();
  
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
import type { VesselTripMap } from '@/data/sources/supabase/vesselTrips';

const VesselPositionsComponent = () => {
  // Note: This hook requires vesselTrips data and loading state
  // It's typically used through the SupabaseData context
  const { vesselTrips, vesselPositionMinutes } = useSupabaseData();
  
  const { data: positions, loading, error } = vesselPositionMinutes;
  
  if (loading) return <div>Loading vessel positions...</div>;
  if (error) return <div>Error: {error}</div>;
  
  // positions is a map where keys are trip IDs
  // and values are arrays of VesselPositionMinute objects
  // Only includes data for the last 2 trips per vessel
  return (
    <div>
      {Object.entries(positions).map(([tripId, positionList]) => (
        <div key={tripId}>
          <h3>Trip {tripId} Positions</h3>
          <p>Total positions: {positionList.length}</p>
          {positionList.slice(0, 5).map((position: VesselPositionMinute) => (
            <div key={position.id}>
              {position.timestamp.toLocaleString()}: 
              {position.lat.toFixed(4)}, {position.lon.toFixed(4)} 
              (Speed: {position.speed} knots, Heading: {position.heading}°)
            </div>
          ))}
          {positionList.length > 5 && <p>... and {positionList.length - 5} more positions</p>}
        </div>
      ))}
    </div>
  );
};
```

#### Combined Usage Example
```typescript
import { useSupabaseData } from '@/data/contexts';

const VesselDashboard = () => {
  const { vesselTrips, vesselPositionMinutes } = useSupabaseData();
  
  const { data: trips, loading: tripsLoading, error: tripsError } = vesselTrips;
  const { data: positions, loading: positionsLoading, error: positionsError } = vesselPositionMinutes;
  
  if (tripsLoading || positionsLoading) return <div>Loading...</div>;
  if (tripsError || positionsError) return <div>Error loading data</div>;
  
  return (
    <div>
      <h2>Vessel Dashboard</h2>
      {/* Your dashboard content */}
    </div>
  );
};
```

## 📝 JSDoc and Documentation Standards

### API Functions
All exported API functions follow this JSDoc pattern:
```typescript
/**
 * API function for fetching [specific data] from [source]
 *
 * [Detailed description of what the function does, including
 * any important notes about caching, frequency, or usage]
 *
 * @returns Promise resolving to [return type description]
 */
```

### Converter Functions
All converter functions follow this JSDoc pattern:
```typescript
/**
 * Converter function for transforming API response to [TypeName] object from [source]
 */
```

### Examples of Well-Documented Functions

#### API Functions
- ✅ `getVesselLocations()` - "API function for fetching current vessel location data from WSF API"
- ✅ `getVesselVerbose()` - "API function for fetching detailed vessel information from WSF API"
- ✅ `getTerminalSailingSpace()` - "API function for fetching terminal sailing space data from WSF Terminals API"
- ✅ `getTerminalVerbose()` - "API function for fetching terminal verbose data from WSF Terminals API"
- ✅ `getCacheFlushDate()` - "API function for fetching cache flush date from WSF API"
- ✅ `getCacheFlushDateTerminals()` - "API function for fetching cache flush date from WSF Terminals API"

#### Converter Functions
- ✅ `toVesselLocation()` - "Converter function for transforming API response to VesselLocation object from WSF API"
- ✅ `toVesselVerbose()` - "Converter function for transforming API response to VesselVerbose object from WSF API"
- ✅ `toTerminalSailingSpace()` - "Converter function for transforming API response to TerminalSailingSpace object from WSF Terminals API"
- ✅ `toTerminalVerbose()` - "Converter function for transforming API response to TerminalVerbose object from WSF Terminals API"
- ✅ `toCacheFlushDate()` - "Converter function for transforming API response to CacheFlushDate object from WSF API"
- ✅ `toCacheFlushDateTerminals()` - "Converter function for transforming API response to CacheFlushDateTerminals object from WSF Terminals API"

### Documentation Coverage
- **100% of exported API functions** have proper JSDoc comments
- **100% of converter functions** have proper JSDoc comments
- **All comments follow the established patterns** and preferences
- **Type files** are type-only and do not require JSDoc
- **Hook files** have appropriate JSDoc for React Query hooks

## 🔧 Development Guidelines

### Adding New WSF API Features
1. Create a new folder under `vessels/` or `terminals/`
2. Use the factory functions: `createArrayApi()` or `createSingleApi()`
3. Follow the established file structure (types.ts, api.ts, converter.ts, hook.ts, index.ts)
4. Add proper JSDoc comments following the established patterns
5. Export only types and hooks from index.ts

### Adding New Supabase Features
1. Create a new folder under `supabase/`
2. Use the shared real-time hook factory if needed
3. Follow the established file structure
4. Add proper JSDoc comments
5. Export only types and hooks from index.ts

### Testing
- API functions can be tested independently
- Converter functions can be tested with mock API responses
- Hooks can be tested with React Testing Library
- All functions maintain type safety for easy testing
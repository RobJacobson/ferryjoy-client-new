# Data Layer

The data layer provides a comprehensive interface to Washington State Ferries (WSF) APIs. It features automatic date parsing, type safety, and efficient caching.

## Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Components    │    │   Data Layer    │    │   External APIs │
│   (UI Layer)    │◄──►│   (Hooks/Query) │◄──►│   (WSF APIs)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React Query   │    │   Transform     │    │   Fetch Layer   │
│   (Cache/State) │    │   (Date/Data)   │    │   (Platform)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## WSF API Integration

### Overview
The application integrates with Washington State Ferries APIs to provide real-time vessel tracking, schedule information, and terminal data.

### API Endpoints

#### Vessels API (`/vessels`)
- **Base URL**: `https://www.wsdot.wa.gov/ferries/api/vessels/rest`
- **Endpoints**:
  - `/vessellocations` - Real-time vessel positions and status
  - `/vesselverbose` - Vessel specifications and details
- **Update Frequency**: Every 30 seconds for locations, daily for vessel details

#### Terminals API (`/terminals`)
- **Base URL**: `https://www.wsdot.wa.gov/ferries/api/terminals/rest`
- **Endpoints**:
  - `/terminalsailingspace` - Space availability and wait times
  - `/terminalverbose` - Terminal information and facilities
- **Update Frequency**: Every 5 minutes for space data, weekly for terminal details

#### Schedule API (`/schedule`)
- **Base URL**: `https://www.wsdot.wa.gov/ferries/api/schedule/rest`
- **Endpoints**:
  - `/routes` - Route information and schedules
  - `/routedetails` - Detailed route information
  - `/activeseasons` - Active service seasons
  - `/alerts` - Service alerts and disruptions
- **Update Frequency**: Daily for schedules, real-time for alerts

### Data Types

#### Vessel Data
- `VesselLocation` - Real-time position, speed, heading
- `VesselVerbose` - Vessel specifications, capacity, amenities

#### Terminal Data
- `TerminalSailingSpace` - Space availability, wait times, parking
- `TerminalVerbose` - Terminal facilities, services, accessibility

#### Schedule Data
- `Route` - Route information, terminals, schedules
- `Schedule` - Departure times, duration, frequency
- `Alert` - Service disruptions, delays, cancellations
- `ActiveSeason` - Seasonal service information

## Type System

### Core Types
The data layer uses a comprehensive type system for data transformation and type safety:

#### `JsonValue`
Input type representing JSON-like data that can be transformed:
```typescript
type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };
```

#### `JsonX`
Output type with Date objects and camelCase keys:
```typescript
type JsonX =
  | string
  | number
  | boolean
  | null
  | Date
  | JsonX[]
  | { [key: string]: JsonX };
```

#### Generic Types
- **`TransformedJson`**: Generic type for transformed JSON objects
- **`TransformedJsonArray`**: Generic type for transformed JSON arrays

### Type Safety Features
- **Automatic transformation** - No manual type casting required
- **Null safety** - Proper handling of null values
- **Recursive processing** - Handles nested objects and arrays
- **Test-friendly** - Simple `Record<string, any>` for testing

## Data Transformation
The application automatically converts WSF API date formats to JavaScript Date objects:

1. **`/Date(timestamp)/`** - WSF timestamp format (e.g., `/Date(1703123456789)/`)
2. **`YYYY-MM-DD`** - ISO date format (e.g., `2023-12-21`)
3. **`MM/DD/YYYY`** - US date format (e.g., `12/21/2023`)

### Key Features
- **Pattern-based detection** - No need to maintain field name lists
- **Robust validation** - Ensures dates are valid before conversion
- **Recursive processing** - Handles nested objects and arrays
- **CamelCase conversion** - Converts PascalCase keys to camelCase
- **Error handling** - Graceful fallback for invalid dates

### Example Transformation
```typescript
// Input from WSF API
{
  "LastUpdate": "/Date(1703123456789)/",
  "DepartureTime": "2023-12-21T14:30:00",
  "VesselName": "Walla Walla"
}

// Output after transformation
{
  "lastUpdate": Date(2023-12-21T14:30:56.789Z),
  "departureTime": Date(2023-12-21T14:30:00.000Z),
  "vesselName": "Walla Walla"
}
```

## Fetch Architecture

### Core Functions

#### `fetchWsf<T>(path: string, options?: FetchOptions)`
Fetches data from WSF APIs with automatic transformation.

```typescript
const vessels = await fetchWsf<VesselLocation[]>('/vessels/vessellocations');
```

#### `fetchWsfArray<T>(path: string, options?: FetchOptions)`
Convenience function for fetching arrays with proper typing.

```typescript
const routes = await fetchWsfArray<Route>('/schedule/routes');
```

#### `fetchInternal(url: string, options?: FetchOptions)`
Platform-specific fetch implementation with error handling.

### Platform Support
- **Web**: JSONP implementation for CORS bypass
- **Mobile**: Native fetch with comprehensive error handling
- **Automatic fallback** between platforms

### Error Handling
- **Graceful degradation** when APIs are unavailable
- **Automatic retry** with exponential backoff
- **Null safety** - Returns null/empty arrays on failure
- **Structured logging** - Configurable debug and error logging

## React Query Integration

### Caching Strategy
- **Memory-based caching** with configurable TTL
- **Background updates** for fresh data
- **Optimistic updates** with rollback on error
- **Structured query keys** for efficient cache management

### Query Patterns
```typescript
// Vessel locations with 30-second refresh
const { data: vessels } = useVesselLocations({
  refetchInterval: 30000,
  staleTime: 15000
});

// Terminal data with 5-minute refresh
const { data: terminals } = useTerminalSailingSpace({
  refetchInterval: 300000,
  staleTime: 150000
});
```



## Usage Examples

### Fetching Vessel Data
```typescript
import { useVesselLocations, useVesselVerbose } from '@/data/wsf/vessels';

function VesselTracker() {
  const { data: locations, isLoading } = useVesselLocations();
  const { data: vessels } = useVesselVerbose();

  if (isLoading) return <LoadingSpinner />;

  return (
    <Map>
      {locations?.map(location => (
        <VesselMarker key={location.vesselId} location={location} />
      ))}
    </Map>
  );
}
```

### Fetching Schedule Data
```typescript
import { useRoutes, useSchedules } from '@/data/wsf/schedule';

function ScheduleView() {
  const { data: routes } = useRoutes();
  const { data: schedules } = useSchedules();

  return (
    <ScheduleList>
      {routes?.map(route => (
        <RouteSchedule key={route.routeId} route={route} />
      ))}
    </ScheduleList>
  );
}
```

### Fetching Terminal Data
```typescript
import { useTerminalSailingSpace } from '@/data/wsf/terminals';

function TerminalStatus() {
  const { data: terminals } = useTerminalSailingSpace();

  return (
    <TerminalList>
      {terminals?.map(terminal => (
        <TerminalCard key={terminal.terminalId} terminal={terminal} />
      ))}
    </TerminalList>
  );
}
```

## Performance Considerations

### Caching Strategy
- **Aggressive caching** for static data (vessel details, terminal info)
- **Frequent updates** for dynamic data (positions, space availability)
- **Smart invalidation** based on data freshness requirements

### Network Optimization
- **Request batching** for multiple API calls
- **Compression** for large data payloads
- **Connection pooling** for efficient resource usage

### Memory Management
- **Efficient data structures** for large datasets
- **Garbage collection** for unused cache entries
- **Memory monitoring** for performance tracking

## Error Handling

### API Failures
- **Graceful degradation** - Show cached data when APIs are down
- **User feedback** - Clear error messages and retry options
- **Automatic recovery** - Background retry with exponential backoff

### Data Validation
- **Type checking** - Runtime validation of API responses
- **Schema validation** - Ensure data structure integrity
- **Fallback values** - Provide defaults for missing data

## Development Tools

### Debugging
- **Network monitoring** - Track API requests and responses
- **Cache inspection** - View cached data and query states
- **Performance profiling** - Monitor data layer performance

### Testing
- **Mock APIs** - Test with simulated data
- **Integration tests** - End-to-end API testing
- **Performance tests** - Load testing and optimization

## Future Enhancements

### Planned Features
- **Offline-first architecture** - Full offline functionality
- **Advanced caching** - More sophisticated caching strategies
- **Data compression** - Reduce bandwidth usage
- **Predictive loading** - Preload data based on user patterns

### API Improvements
- **GraphQL integration** - More efficient data fetching
- **WebSocket support** - Real-time updates for all data
- **Batch operations** - Reduce API call frequency
- **Rate limiting** - Respectful API usage patterns
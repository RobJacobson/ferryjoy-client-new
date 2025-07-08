# Washington State Ferries (WSF) APIs

The WSF APIs provide access to real-time ferry data including vessel positions, terminal information, and schedule data.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    WSF API Layer                                │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  │
│  │   Schedule      │  │   Terminals     │  │   Vessels       │  │
│  │   (19 endpoints)│  │   (4 endpoints) │  │   (3 endpoints) │  │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘  │
├─────────────────────────────────────────────────────────────────┤
│                    Shared Infrastructure                        │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐            │
│  │   Fetch     │  │   Config    │  │   Utils     │            │
│  │   Utilities │  │   & Types   │  │   & Dates   │            │
│  └─────────────┘  └─────────────┘  └─────────────┘            │
├─────────────────────────────────────────────────────────────────┤
│                    External WSF APIs                            │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐            │
│  │   Schedule  │  │   Terminals │  │   Vessels   │            │
│  │   API       │  │   API       │  │   API       │            │
│  └─────────────┘  └─────────────┘  └─────────────┘            │
└─────────────────────────────────────────────────────────────────┘
```

## API Categories

### 1. Schedule API (19 endpoints)
- **Purpose**: Comprehensive ferry schedule data
- **Endpoints**: Routes, terminals, vessels, schedules, time adjustments, alerts
- **Location**: `src/data/sources/wsf/schedule/`
- **Documentation**: [Schedule API README](./schedule/README.md)

### 2. Terminals API (4 endpoints)
- **Purpose**: Terminal information and space availability
- **Endpoints**: Terminal details, sailing space, cache flush dates
- **Location**: `src/data/sources/wsf/terminals/`
- **Documentation**: [Terminals API README](./terminals/README.md)

### 3. Vessels API (3 endpoints)
- **Purpose**: Vessel information and real-time positions
- **Endpoints**: Vessel details, locations, cache flush dates
- **Location**: `src/data/sources/wsf/vessels/`
- **Documentation**: [Vessels API README](./vessels/README.md)

## Fetching Process

### 1. Request Flow

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Component │───▶│   Hook      │───▶│   API       │───▶│   Fetch      │
│   (UI)      │    │   (use*)    │    │   Function  │    │   Utility    │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
                                                              │
                                                              ▼
                                                    ┌─────────────┐
                                                    │   WSF API   │
                                                    │   (External)│
                                                    └─────────────┘
```

### 2. Response Flow

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   WSF API   │───▶│   Fetch     │───▶│   Converter │───▶│   Hook      │
│   (JSON)    │    │   Utility   │    │   Function  │    │   (Cache)   │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
                                                              │
                                                              ▼
                                                    ┌─────────────┐
                                                    │  Component  │
                                                    │   (UI)      │
                                                    └─────────────┘
```

### 3. Caching Strategy

```
┌─────────────────────────────────────────────────────────────────┐
│                        Caching Layers                           │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  │
│  │   Memory Cache  │  │   Storage Cache │  │   Cache Flush   │  │
│  │   (React Query) │  │   (AsyncStorage)│  │   (Invalidation)│  │
│  │   ~5 minutes    │  │   ~24 hours     │  │   On API update │  │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## Key Features

### Type Safety
- **Strong Typing**: All API responses are fully typed
- **Domain Models**: Clean domain models separate from API responses
- **Converter Functions**: Type-safe transformation from API to domain models

### Error Handling
- **Graceful Degradation**: App continues working when APIs are unavailable
- **Retry Logic**: Automatic retries with exponential backoff
- **User Feedback**: Clear error messages for users

### Performance
- **Caching**: Multi-layer caching for optimal performance
- **Lazy Loading**: Data loaded only when needed
- **Background Updates**: Fresh data fetched in background

### Real-time Updates
- **Polling**: Regular updates for time-sensitive data
- **Cache Invalidation**: Automatic cache refresh when data changes
- **Optimistic Updates**: Immediate UI updates with background sync

## Configuration

### API Keys
```typescript
// Required environment variable
EXPO_PUBLIC_WSDOT_ACCESS_TOKEN=your_api_key_here
```

### Base URLs
```typescript
// Configured in shared/config.ts
const API_BASES = {
  vessels: "https://www.wsdot.wa.gov/ferries/api/vessels/rest",
  terminals: "https://www.wsdot.wa.gov/ferries/api/terminals/rest",
  schedule: "https://www.wsdot.wa.gov/ferries/api/schedule/rest"
};
```

## Usage Examples

### Basic Usage
```typescript
import { useVesselLocations } from '@/data/sources/wsf/vessels/vesselLocations';

function VesselMap() {
  const { data: vessels, isLoading, error } = useVesselLocations();
  
  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;
  
  return (
    <div>
      {vessels?.map(vessel => (
        <VesselMarker key={vessel.vesselID} vessel={vessel} />
      ))}
    </div>
  );
}
```

### With Parameters
```typescript
import { useRoutesByDate } from '@/data/sources/wsf/schedule/routes';

function RouteSchedule({ tripDate }: { tripDate: Date }) {
  const { data: routes, isLoading } = useRoutesByDate(tripDate);
  
  if (isLoading) return <LoadingSpinner />;
  
  return (
    <div>
      {routes?.map(route => (
        <RouteCard key={route.id} route={route} />
      ))}
    </div>
  );
}
```

### Error Handling
```typescript
import { useTerminalSpace } from '@/data/sources/wsf/terminals/terminalSailingSpace';

function TerminalSpace() {
  const { data: terminals, isLoading, error, refetch } = useTerminalSpace();
  
  if (error) {
    return (
      <div>
        <p>Unable to load terminal space data</p>
        <button onClick={() => refetch()}>Retry</button>
      </div>
    );
  }
  
  // ... rest of component
}
```

## Development

### Adding New Endpoints

1. **Create Types** (`types.ts`)
```typescript
export type WsfNewEndpointResponse = {
  // API response structure
};

export type NewEndpoint = {
  // Domain model structure
};
```

2. **Create Converter** (`converter.ts`)
```typescript
export const toNewEndpoint = (data: WsfNewEndpointResponse): NewEndpoint => ({
  // Transform API response to domain model
});
```

3. **Create API** (`api.ts`)
```typescript
const ROUTES = {
  newEndpoint: {
    path: "/newendpoint" as const,
    log: "info",
  },
} as const;

export const getNewEndpoint = (): Promise<NewEndpoint[]> =>
  fetchWsfArray<WsfNewEndpointResponse>("schedule", ROUTES.newEndpoint)
    .then(arr => arr.map(toNewEndpoint));
```

4. **Create Hook** (`hook.ts`)
```typescript
export const useNewEndpoint = () => {
  return useQuery({
    queryKey: ["schedule", "newEndpoint"],
    queryFn: getNewEndpoint,
  });
};
```

### Testing

```typescript
// Test API function
describe('getNewEndpoint', () => {
  it('should fetch and convert data correctly', async () => {
    const result = await getNewEndpoint();
    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
  });
});

// Test converter function
describe('toNewEndpoint', () => {
  it('should convert API response to domain model', () => {
    const apiResponse = { /* mock API response */ };
    const result = toNewEndpoint(apiResponse);
    expect(result).toMatchObject({ /* expected domain model */ });
  });
});
```

## Troubleshooting

### Common Issues

1. **API Key Missing**
   - Ensure `EXPO_PUBLIC_WSDOT_ACCESS_TOKEN` is set in environment
   - Check that the key is valid and has proper permissions

2. **Network Errors**
   - Check internet connectivity
   - Verify WSF API endpoints are accessible
   - Review error logs for specific failure reasons

3. **Type Errors**
   - Ensure all types are properly imported
   - Check that API response types match actual responses
   - Verify converter functions handle all required fields

4. **Caching Issues**
   - Clear React Query cache if needed
   - Check cache flush dates for data freshness
   - Verify cache invalidation is working correctly

### Debug Mode

Enable debug logging by setting the log level in route configurations:

```typescript
const ROUTES = {
  endpoint: {
    path: "/endpoint" as const,
    log: "debug", // Enable debug logging
  },
} as const;
```

## Resources

- [WSF API Documentation](https://www.wsdot.wa.gov/ferries/api/)
- [React Query Documentation](https://tanstack.com/query/latest)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/) 
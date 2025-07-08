# WSF Vessels API

Real-time vessel information and position data for Washington State Ferries.

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    WSF Vessels API                              │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  │
│  │ Vessel Locations│  │ Vessel Verbose  │  │ Cache Flush     │  │
│  │   (Real-time)   │  │   (Full info)   │  │   (Invalidation)│  │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘  │
├─────────────────────────────────────────────────────────────────┤
│                    Shared Infrastructure                        │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐            │
│  │   Fetch     │  │   Config    │  │   Utils     │            │
│  │   Utilities │  │   & Types   │  │   & Dates   │            │
│  └─────────────┘  └─────────────┘  └─────────────┘            │
└─────────────────────────────────────────────────────────────────┘
```

## API Endpoints

### 1. Vessel Locations
- **Endpoint**: `/vessellocations`
- **Purpose**: Real-time vessel positions, speeds, and headings
- **Update Frequency**: Every 30 seconds
- **Cache Strategy**: Memory only (30 sec TTL)

### 2. Vessel Verbose
- **Endpoint**: `/vesselverbose`
- **Purpose**: Comprehensive vessel information and specifications
- **Update Frequency**: Every 24 hours
- **Cache Strategy**: Memory + Storage (24h TTL)

### 3. Cache Flush Date
- **Endpoint**: `/cacheflushdate`
- **Purpose**: Cache invalidation trigger
- **Update Frequency**: When data changes
- **Cache Strategy**: Memory + Storage (24h TTL)

## Data Flow

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Component │───▶│   Hook      │───▶│   API       │───▶│   WSF API   │
│   (UI)      │    │   (use*)    │    │   Function  │    │   (External)│
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
                           │                   │                   │
                           ▼                   ▼                   ▼
                   ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
                   │   Cache     │    │   Converter │    │   Response  │
                   │   (Memory)  │    │   Function  │    │   (JSON)    │
                   └─────────────┘    └─────────────┘    └─────────────┘
```

## Usage Examples

### Real-time Vessel Positions

```typescript
import { useVesselLocations } from '@/data/sources/wsf/vessels/vesselLocations';

function VesselMap() {
  const { data: vessels, isLoading, error } = useVesselLocations();
  
  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;
  
  return (
    <div>
      <h2>Live Vessel Positions</h2>
      {vessels?.map(vessel => (
        <VesselMarker key={vessel.vesselID} vessel={vessel} />
      ))}
    </div>
  );
}
```

### Vessel Marker Component

```typescript
function VesselMarker({ vessel }: { vessel: VesselLocation }) {
  return (
    <div className="vessel-marker">
      <h3>{vessel.vesselName}</h3>
      
      <div className="position">
        <p>Position: {vessel.lat.toFixed(4)}, {vessel.lon.toFixed(4)}</p>
        <p>Speed: {vessel.speed} knots</p>
        <p>Heading: {vessel.heading}°</p>
      </div>
      
      <div className="route">
        <p>Route: {vessel.depTermAbrv} → {vessel.arvTermAbrv || 'Unknown'}</p>
        <p>Status: {vessel.inService ? 'In Service' : 'Out of Service'}</p>
      </div>
      
      {vessel.eta && (
        <div className="eta">
          <p>ETA: {vessel.eta.toLocaleString()}</p>
        </div>
      )}
      
      <div className="timestamp">
        <small>Updated: {vessel.timestamp.toLocaleTimeString()}</small>
      </div>
    </div>
  );
}
```

### Vessel Details

```typescript
import { useVesselVerbose } from '@/data/sources/wsf/vessels/vesselVerbose';

function VesselDetails() {
  const { data: vessels, isLoading } = useVesselVerbose();
  
  if (isLoading) return <LoadingSpinner />;
  
  return (
    <div>
      <h2>Vessel Information</h2>
      {vessels?.map(vessel => (
        <VesselDetailCard key={vessel.vesselID} vessel={vessel} />
      ))}
    </div>
  );
}
```

### Vessel Detail Card Component

```typescript
function VesselDetailCard({ vessel }: { vessel: VesselVerbose }) {
  return (
    <div className="vessel-detail-card">
      <h3>{vessel.vesselName} ({vessel.vesselAbrv})</h3>
      
      <div className="specifications">
        <h4>Specifications</h4>
        <p>Class: {vessel.class}</p>
        <p>Built: {vessel.yearBuilt}</p>
        <p>Length: {vessel.length} feet</p>
        <p>Beam: {vessel.beam} feet</p>
        <p>Draft: {vessel.draft} feet</p>
      </div>
      
      <div className="capacity">
        <h4>Capacity</h4>
        <p>Passengers: {vessel.seatingCapacity}</p>
        <p>Vehicles (Enclosed): {vessel.maxEnclosedVehicleCapacity}</p>
        <p>Vehicles (Open): {vessel.maxOpenVehicleCapacity}</p>
        <p>Total Vehicles: {vessel.maxVehicleCapacity}</p>
      </div>
      
      <div className="amenities">
        <h4>Amenities</h4>
        <ul>
          {vessel.hasWiFi && <li>WiFi Available</li>}
          {vessel.hasRestrooms && <li>Restrooms</li>}
          {vessel.hasGalley && <li>Galley/Food Service</li>}
          {vessel.hasElevator && <li>Elevator</li>}
          {vessel.hasAccessibility && <li>Accessibility Features</li>}
        </ul>
      </div>
      
      <div className="status">
        <h4>Status</h4>
        <p>In Service: {vessel.inService ? 'Yes' : 'No'}</p>
        {vessel.lastUpdated && (
          <p>Last Updated: {vessel.lastUpdated.toLocaleString()}</p>
        )}
      </div>
    </div>
  );
}
```

### Combined Vessel View

```typescript
import { useVesselLocations } from '@/data/sources/wsf/vessels/vesselLocations';
import { useVesselVerbose } from '@/data/sources/wsf/vessels/vesselVerbose';

function VesselDashboard() {
  const { data: positions, isLoading: positionsLoading } = useVesselLocations();
  const { data: details, isLoading: detailsLoading } = useVesselVerbose();
  
  if (positionsLoading || detailsLoading) return <LoadingSpinner />;
  
  // Combine position and detail data
  const vessels = positions?.map(position => {
    const detail = details?.find(d => d.vesselID === position.vesselID);
    return { ...position, ...detail };
  });
  
  return (
    <div>
      <h2>Vessel Dashboard</h2>
      {vessels?.map(vessel => (
        <VesselDashboardCard key={vessel.vesselID} vessel={vessel} />
      ))}
    </div>
  );
}
```

### Cache Status

```typescript
import { useCacheFlushDate } from '@/data/sources/wsf/vessels/cacheFlushDateVessels';

function CacheStatus() {
  const { data: cacheInfo } = useCacheFlushDate();
  
  return (
    <div className="cache-status">
      <h3>Vessel Data Cache Status</h3>
      <p>Last updated: {cacheInfo?.cacheDate.toLocaleString()}</p>
      <p>Source: {cacheInfo?.source}</p>
    </div>
  );
}
```

## Data Models

### Vessel Location

```typescript
type VesselLocation = {
  vesselID: number;
  vesselName: string;
  vesselAbrv: string;
  lat: number;
  lon: number;
  speed: number;
  heading: number;
  inService: boolean;
  depTermAbrv: string;
  arvTermAbrv: string | null;
  eta: Date | null;
  timestamp: Date;
};
```

### Vessel Verbose

```typescript
type VesselVerbose = {
  vesselID: number;
  vesselName: string;
  vesselAbrv: string;
  class: string;
  yearBuilt: number;
  length: number;
  beam: number;
  draft: number;
  seatingCapacity: number;
  maxEnclosedVehicleCapacity: number;
  maxOpenVehicleCapacity: number;
  maxVehicleCapacity: number;
  hasWiFi: boolean;
  hasRestrooms: boolean;
  hasGalley: boolean;
  hasElevator: boolean;
  hasAccessibility: boolean;
  inService: boolean;
  lastUpdated: Date | null;
};
```

### Cache Flush Date

```typescript
type CacheFlushDate = {
  cacheDate: Date;
  source: string;
};
```

## Real-time Updates

### Automatic Position Updates
Vessel position data updates every 30 seconds automatically:

```typescript
function LiveVesselMap() {
  const { data: vessels, isLoading } = useVesselLocations();
  
  // Data automatically refreshes every 30 seconds
  // No manual refresh needed for real-time updates
  
  return (
    <div>
      <p>Last updated: {new Date().toLocaleTimeString()}</p>
      {vessels?.map(vessel => (
        <VesselMarker key={vessel.vesselID} vessel={vessel} />
      ))}
    </div>
  );
}
```

### Manual Refresh
```typescript
function VesselMapWithRefresh() {
  const { data: vessels, isLoading, refetch } = useVesselLocations();
  
  return (
    <div>
      <button onClick={() => refetch()}>Refresh Positions</button>
      {vessels?.map(vessel => (
        <VesselMarker key={vessel.vesselID} vessel={vessel} />
      ))}
    </div>
  );
}
```

### Position Tracking
```typescript
function VesselTracker({ vesselId }: { vesselId: number }) {
  const { data: vessels } = useVesselLocations();
  const vessel = vessels?.find(v => v.vesselID === vesselId);
  
  if (!vessel) return <div>Vessel not found</div>;
  
  return (
    <div className="vessel-tracker">
      <h3>Tracking: {vessel.vesselName}</h3>
      <div className="position-info">
        <p>Latitude: {vessel.lat.toFixed(6)}</p>
        <p>Longitude: {vessel.lon.toFixed(6)}</p>
        <p>Speed: {vessel.speed} knots</p>
        <p>Heading: {vessel.heading}°</p>
      </div>
      <div className="route-info">
        <p>From: {vessel.depTermAbrv}</p>
        <p>To: {vessel.arvTermAbrv || 'Unknown'}</p>
        {vessel.eta && <p>ETA: {vessel.eta.toLocaleString()}</p>}
      </div>
    </div>
  );
}
```

## Error Handling

### Graceful Error Handling
```typescript
function VesselMapWithErrorHandling() {
  const { data: vessels, isLoading, error, refetch } = useVesselLocations();
  
  if (isLoading) return <LoadingSpinner />;
  
  if (error) {
    return (
      <div className="error-container">
        <h3>Unable to load vessel positions</h3>
        <p>Error: {error.message}</p>
        <button onClick={() => refetch()}>Try Again</button>
      </div>
    );
  }
  
  if (!vessels || vessels.length === 0) {
    return (
      <div className="no-data">
        <p>No vessels currently in service</p>
      </div>
    );
  }
  
  return (
    <div>
      {vessels.map(vessel => (
        <VesselMarker key={vessel.vesselID} vessel={vessel} />
      ))}
    </div>
  );
}
```

## Performance Optimization

### Selective Loading
```typescript
function SingleVesselView({ vesselId }: { vesselId: number }) {
  const { data: vessels } = useVesselLocations();
  
  // Filter to specific vessel
  const vessel = vessels?.find(v => v.vesselID === vesselId);
  
  if (!vessel) return <div>Vessel not found</div>;
  
  return <VesselMarker vessel={vessel} />;
}
```

### Optimistic Updates
```typescript
function VesselMapOptimistic() {
  const { data: vessels, isLoading } = useVesselLocations();
  
  // Show cached data immediately while loading
  return (
    <div>
      {vessels?.map(vessel => (
        <VesselMarker 
          key={vessel.vesselID} 
          vessel={vessel}
          isLoading={isLoading}
        />
      ))}
    </div>
  );
}
```

## Caching Strategy

### Memory Cache (React Query)
- **Vessel Locations**: 30 seconds TTL
- **Vessel Verbose**: 24 hours TTL
- **Cache Flush Date**: 24 hours TTL

### Storage Cache (AsyncStorage)
- **Vessel Verbose**: 24 hours TTL
- **Cache Flush Date**: 24 hours TTL
- **Vessel Locations**: No storage cache (real-time data)

### Cache Invalidation
```typescript
function useVesselDataWithInvalidation() {
  const { data: cacheInfo } = useCacheFlushDate();
  const { data: vessels, refetch } = useVesselLocations();
  
  // Refetch when cache is invalidated
  useEffect(() => {
    if (cacheInfo) {
      refetch();
    }
  }, [cacheInfo, refetch]);
  
  return { vessels, cacheInfo };
}
```

## Best Practices

### 1. Handle Loading States
Always show loading indicators for better UX:
```typescript
if (isLoading) return <LoadingSpinner />;
```

### 2. Provide Error Feedback
Give users clear error messages and retry options:
```typescript
if (error) return <ErrorMessage error={error} onRetry={refetch} />;
```

### 3. Use Appropriate Cache Strategies
- Real-time data (positions) → Memory cache only
- Reference data (details) → Memory + Storage cache
- Cache metadata → Long-term storage cache

### 4. Optimize Re-renders
Use React.memo for expensive components:
```typescript
const VesselMarker = React.memo(({ vessel }) => {
  // Component implementation
});
```

### 5. Monitor Performance
Track API response times and cache hit rates:
```typescript
const { data, isLoading, error } = useVesselLocations({
  onSuccess: (data) => {
    console.log('Vessel positions loaded:', data.length, 'vessels');
  },
  onError: (error) => {
    console.error('Vessel positions error:', error);
  }
});
```

## Troubleshooting

### Common Issues

1. **No Vessel Data Available**
   - Check if vessels are in service
   - Verify API endpoint is accessible
   - Review cache flush date

2. **Stale Position Data**
   - Clear React Query cache
   - Check cache flush date
   - Force manual refresh

3. **Network Errors**
   - Verify internet connectivity
   - Check API endpoint status
   - Review error logs

### Debug Mode
Enable debug logging to troubleshoot issues:
```typescript
// In vessel API files, set log level to "debug"
const ROUTES = {
  vesselLocations: {
    path: "/vessellocations" as const,
    log: "debug", // Enable debug logging
  },
} as const;
``` 
# WSF Terminals API

Terminal information and space availability data for Washington State Ferries.

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    WSF Terminals API                            │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  │
│  │ Terminal Space  │  │ Terminal Verbose│  │ Cache Flush     │  │
│  │   (Space data)  │  │   (Full info)   │  │   (Invalidation)│  │
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

### 1. Terminal Sailing Space
- **Endpoint**: `/terminalsailingspace`
- **Purpose**: Real-time space availability for vehicles and passengers
- **Update Frequency**: Every 5 minutes
- **Cache Strategy**: Memory only (5 min TTL)

### 2. Terminal Verbose
- **Endpoint**: `/terminalverbose`
- **Purpose**: Comprehensive terminal information including wait times and bulletins
- **Update Frequency**: Every 15 minutes
- **Cache Strategy**: Memory + Storage (15 min TTL)

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

### Terminal Space Availability

```typescript
import { useTerminalSailingSpace } from '@/data/sources/wsf/terminals/terminalSailingSpace';

function TerminalSpace() {
  const { data: terminals, isLoading, error } = useTerminalSailingSpace();
  
  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;
  
  return (
    <div>
      <h2>Terminal Space Availability</h2>
      {terminals?.map(terminal => (
        <TerminalSpaceCard key={terminal.terminalId} terminal={terminal} />
      ))}
    </div>
  );
}
```

### Terminal Space Card Component

```typescript
function TerminalSpaceCard({ terminal }: { terminal: TerminalSailingSpace }) {
  return (
    <div className="terminal-card">
      <h3>{terminal.terminalName}</h3>
      
      {terminal.departingSpaces.map((departure, index) => (
        <div key={index} className="departure">
          <h4>Departure: {departure.departure}</h4>
          <p>Vessel: {departure.vesselName}</p>
          <p>Cancelled: {departure.isCancelled ? 'Yes' : 'No'}</p>
          
          <div className="space-info">
            {departure.spaceForArrivalTerminals.map((space, spaceIndex) => (
              <div key={spaceIndex} className="arrival-space">
                <h5>To: {space.terminalName}</h5>
                <p>Drive-up: {space.driveUpSpaceCount || 'N/A'}</p>
                <p>Reservations: {space.reservableSpaceCount || 'N/A'}</p>
                <p>Total: {space.totalSpaceCount || 'N/A'}</p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
```

### Terminal Verbose Information

```typescript
import { useTerminalVerbose } from '@/data/sources/wsf/terminals/terminalverbose';

function TerminalInfo() {
  const { data: terminals, isLoading } = useTerminalVerbose();
  
  if (isLoading) return <LoadingSpinner />;
  
  return (
    <div>
      <h2>Terminal Information</h2>
      {terminals?.map(terminal => (
        <TerminalInfoCard key={terminal.terminalId} terminal={terminal} />
      ))}
    </div>
  );
}
```

### Terminal Info Card Component

```typescript
function TerminalInfoCard({ terminal }: { terminal: TerminalVerbose }) {
  return (
    <div className="terminal-info-card">
      <h3>{terminal.terminalName}</h3>
      
      <div className="location">
        <h4>Location</h4>
        <p>{terminal.terminalLocation}</p>
        <p>{terminal.terminalAddress}</p>
        <p>{terminal.terminalCity}, {terminal.terminalState} {terminal.terminalZip}</p>
      </div>
      
      <div className="contact">
        <h4>Contact</h4>
        <p>Phone: {terminal.terminalPhone}</p>
        <p>Hours: {terminal.terminalHours}</p>
      </div>
      
      <div className="wait-times">
        <h4>Current Wait Times</h4>
        <p>Vehicles: {terminal.terminalWaitTimes.vehicleWaitTime} minutes</p>
        <p>Walk-on: {terminal.terminalWaitTimes.walkOnWaitTime} minutes</p>
      </div>
      
      <div className="space">
        <h4>Current Space</h4>
        <p>Drive-up: {terminal.terminalSailingSpace.driveUpSpaces}</p>
        <p>Reservations: {terminal.terminalSailingSpace.reservationSpaces}</p>
        <p>Total: {terminal.terminalSailingSpace.totalSpaces}</p>
      </div>
      
      {terminal.terminalBulletins.length > 0 && (
        <div className="bulletins">
          <h4>Bulletins</h4>
          {terminal.terminalBulletins.map(bulletin => (
            <div key={bulletin.bulletinId} className="bulletin">
              <h5>{bulletin.bulletinTitle}</h5>
              <p>{bulletin.bulletinText}</p>
              <small>Posted: {bulletin.bulletinDate.toLocaleString()}</small>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

### Cache Status

```typescript
import { useCacheFlushDateTerminals } from '@/data/sources/wsf/terminals/cacheFlushDateTerminals';

function CacheStatus() {
  const { data: cacheInfo } = useCacheFlushDateTerminals();
  
  return (
    <div className="cache-status">
      <h3>Terminal Data Cache Status</h3>
      <p>Last updated: {cacheInfo?.cacheDate.toLocaleString()}</p>
      <p>Source: {cacheInfo?.source}</p>
    </div>
  );
}
```

## Data Models

### Terminal Sailing Space

```typescript
type TerminalSailingSpace = {
  terminalId: number;
  terminalName: string;
  departingSpaces: DepartingSpace[];
};

type DepartingSpace = {
  departure: string;
  vesselName: string;
  isCancelled: boolean;
  spaceForArrivalTerminals: ArrivalSpace[];
};

type ArrivalSpace = {
  terminalName: string;
  driveUpSpaceCount: number | null;
  reservableSpaceCount: number | null;
  totalSpaceCount: number | null;
};
```

### Terminal Verbose

```typescript
type TerminalVerbose = {
  terminalId: number;
  terminalName: string;
  terminalLocation: string;
  terminalAddress: string;
  terminalCity: string;
  terminalState: string;
  terminalZip: string;
  terminalPhone: string;
  terminalHours: string;
  terminalWaitTimes: TerminalWaitTimes;
  terminalSailingSpace: TerminalCurrentSpace;
  terminalBulletins: TerminalBulletin[];
};

type TerminalWaitTimes = {
  vehicleWaitTime: number;
  walkOnWaitTime: number;
};

type TerminalCurrentSpace = {
  driveUpSpaces: number;
  reservationSpaces: number;
  totalSpaces: number;
};

type TerminalBulletin = {
  bulletinId: number;
  bulletinTitle: string;
  bulletinText: string;
  bulletinDate: Date;
};
```

### Cache Flush Date

```typescript
type CacheFlushDateTerminals = {
  cacheDate: Date;
  source: string;
};
```

## Real-time Updates

### Space Availability Updates
Terminal space data is updated every 5 minutes and cached in memory only for fast access:

```typescript
function TerminalSpaceWithUpdates() {
  const { data: terminals, isLoading } = useTerminalSailingSpace();
  
  // Data automatically refreshes every 5 minutes
  // No manual refresh needed
  
  return (
    <div>
      <p>Last updated: {new Date().toLocaleTimeString()}</p>
      {terminals?.map(terminal => (
        <TerminalSpaceCard key={terminal.terminalId} terminal={terminal} />
      ))}
    </div>
  );
}
```

### Manual Refresh
```typescript
function TerminalSpaceWithRefresh() {
  const { data: terminals, isLoading, refetch } = useTerminalSailingSpace();
  
  return (
    <div>
      <button onClick={() => refetch()}>Refresh Space Data</button>
      {terminals?.map(terminal => (
        <TerminalSpaceCard key={terminal.terminalId} terminal={terminal} />
      ))}
    </div>
  );
}
```

## Error Handling

### Graceful Error Handling
```typescript
function TerminalSpaceWithErrorHandling() {
  const { data: terminals, isLoading, error, refetch } = useTerminalSailingSpace();
  
  if (isLoading) return <LoadingSpinner />;
  
  if (error) {
    return (
      <div className="error-container">
        <h3>Unable to load terminal space data</h3>
        <p>Error: {error.message}</p>
        <button onClick={() => refetch()}>Try Again</button>
      </div>
    );
  }
  
  if (!terminals || terminals.length === 0) {
    return (
      <div className="no-data">
        <p>No terminal space data available</p>
      </div>
    );
  }
  
  return (
    <div>
      {terminals.map(terminal => (
        <TerminalSpaceCard key={terminal.terminalId} terminal={terminal} />
      ))}
    </div>
  );
}
```

## Performance Optimization

### Selective Loading
```typescript
function TerminalSpaceByTerminal({ terminalId }: { terminalId: number }) {
  const { data: terminals } = useTerminalSailingSpace();
  
  // Filter to specific terminal
  const terminal = terminals?.find(t => t.terminalId === terminalId);
  
  if (!terminal) return <div>Terminal not found</div>;
  
  return <TerminalSpaceCard terminal={terminal} />;
}
```

### Optimistic Updates
```typescript
function TerminalSpaceOptimistic() {
  const { data: terminals, isLoading } = useTerminalSailingSpace();
  
  // Show cached data immediately while loading
  return (
    <div>
      {terminals?.map(terminal => (
        <TerminalSpaceCard 
          key={terminal.terminalId} 
          terminal={terminal}
          isLoading={isLoading}
        />
      ))}
    </div>
  );
}
```

## Caching Strategy

### Memory Cache (React Query)
- **Terminal Space**: 5 minutes TTL
- **Terminal Verbose**: 15 minutes TTL
- **Cache Flush Date**: 24 hours TTL

### Storage Cache (AsyncStorage)
- **Terminal Verbose**: 15 minutes TTL
- **Cache Flush Date**: 24 hours TTL
- **Terminal Space**: No storage cache (real-time data)

### Cache Invalidation
```typescript
function useTerminalDataWithInvalidation() {
  const { data: cacheInfo } = useCacheFlushDateTerminals();
  const { data: terminals, refetch } = useTerminalSailingSpace();
  
  // Refetch when cache is invalidated
  useEffect(() => {
    if (cacheInfo) {
      refetch();
    }
  }, [cacheInfo, refetch]);
  
  return { terminals, cacheInfo };
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
- Real-time data (space) → Memory cache only
- Reference data (verbose) → Memory + Storage cache
- Cache metadata → Long-term storage cache

### 4. Optimize Re-renders
Use React.memo for expensive components:
```typescript
const TerminalSpaceCard = React.memo(({ terminal }) => {
  // Component implementation
});
```

### 5. Monitor Performance
Track API response times and cache hit rates:
```typescript
const { data, isLoading, error } = useTerminalSailingSpace({
  onSuccess: (data) => {
    console.log('Terminal space loaded:', data.length, 'terminals');
  },
  onError: (error) => {
    console.error('Terminal space error:', error);
  }
});
```

## Troubleshooting

### Common Issues

1. **No Space Data Available**
   - Check if terminal is active
   - Verify API endpoint is accessible
   - Review cache flush date

2. **Stale Data**
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
// In terminal API files, set log level to "debug"
const ROUTES = {
  terminalSpace: {
    path: "/terminalsailingspace" as const,
    log: "debug", // Enable debug logging
  },
} as const;
``` 
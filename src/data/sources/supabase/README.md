# Supabase Data Source

Real-time database integration for FerryJoy using Supabase (PostgreSQL with real-time subscriptions).

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    Supabase Layer                               │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  │
│  │ Vessel Trips    │  │ Vessel Position │  │   Future        │  │
│  │   (Real-time)   │  │   Minutes       │  │   Features      │  │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘  │
├─────────────────────────────────────────────────────────────────┤
│                    Shared Infrastructure                        │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐            │
│  │   Client    │  │   Realtime  │  │   Utils     │            │
│  │   Setup     │  │   Hooks     │  │   & Types   │            │
│  └─────────────┘  └─────────────┘  └─────────────┘            │
├─────────────────────────────────────────────────────────────────┤
│                    Supabase Database                            │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐            │
│  │   Tables    │  │   RLS       │  │   Functions │            │
│  │   (PostgreSQL)│  │   (Security)│  │   (Triggers)│            │
│  └─────────────┘  └─────────────┘  └─────────────┘            │
└─────────────────────────────────────────────────────────────────┘
```

## Database Schema

### Vessel Trips Table
```sql
CREATE TABLE vessel_trips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vessel_abrv TEXT NOT NULL,
  dep_term_abrv TEXT NOT NULL,
  arv_term_abrv TEXT,
  time_start TIMESTAMP WITH TIME ZONE,
  time_end TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Vessel Position Minutes Table
```sql
CREATE TABLE vessel_position_minutes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID REFERENCES vessel_trips(id) ON DELETE CASCADE,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  lat DOUBLE PRECISION NOT NULL,
  lon DOUBLE PRECISION NOT NULL,
  speed DOUBLE PRECISION,
  heading DOUBLE PRECISION,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Data Flow

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Component │───▶│   Hook      │───▶│   API       │───▶│   Supabase  │
│   (UI)      │    │   (use*)    │    │   Function  │    │   (Database)│
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
                           │                   │                   │
                           ▼                   ▼                   ▼
                   ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
                   │   Cache     │    │   Converter │    │   Response  │
                   │   (Memory)  │    │   Function  │    │   (JSON)    │
                   └─────────────┘    └─────────────┘    └─────────────┘
```

## Real-time Subscriptions

### Subscription Architecture
```
┌─────────────────────────────────────────────────────────────────┐
│                    Real-time Flow                               │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐        │
│  │   Database  │───▶│   Supabase  │───▶│   Hook      │        │
│  │   Change    │    │   Realtime  │    │   (use*)    │        │
│  └─────────────┘    └─────────────┘    └─────────────┘        │
│                              │                                 │
│                              ▼                                 │
│                    ┌─────────────┐    ┌─────────────┐        │
│                    │   Cache     │───▶│  Component  │        │
│                    │   Update    │    │   (UI)      │        │
│                    └─────────────┘    └─────────────┘        │
└─────────────────────────────────────────────────────────────────┘
```

## Usage Examples

### Vessel Trips

```typescript
import { useVesselTrip } from '@/data/sources/supabase/vesselTrips';

function VesselTripsComponent() {
  const { data: vesselTrips, loading, error } = useVesselTrip();
  
  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;
  
  // vesselTrips is a map where keys are vessel abbreviations
  // and values are arrays of VesselTrip objects
  return (
    <div>
      {Object.entries(vesselTrips).map(([vesselAbrv, trips]) => (
        <div key={vesselAbrv}>
          <h3>Vessel {vesselAbrv}</h3>
          {trips.map((trip: VesselTrip) => (
            <TripCard key={trip.id} trip={trip} />
          ))}
        </div>
      ))}
    </div>
  );
}
```

### Trip Card Component

```typescript
function TripCard({ trip }: { trip: VesselTrip }) {
  return (
    <div className="trip-card">
      <h4>Trip {trip.id}</h4>
      <p>Route: {trip.depTermAbrv} → {trip.arvTermAbrv || 'Unknown'}</p>
      {trip.timeStart && (
        <p>Started: {trip.timeStart.toLocaleString()}</p>
      )}
      {trip.timeEnd && (
        <p>Ended: {trip.timeEnd.toLocaleString()}</p>
      )}
      <small>Created: {trip.createdAt.toLocaleString()}</small>
    </div>
  );
}
```

### Vessel Position Minutes

```typescript
import { useVesselPositionMinute } from '@/data/sources/supabase/vesselPositionMinute';

function VesselPositionsComponent() {
  // Note: This hook requires vesselTrips data and loading state
  // It's typically used through the SupabaseData context
  const { vesselTrips, vesselPositionMinutes } = useSupabaseData();
  
  const { data: positions, loading, error } = vesselPositionMinutes;
  
  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;
  
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
            <PositionCard key={position.id} position={position} />
          ))}
          {positionList.length > 5 && (
            <p>... and {positionList.length - 5} more positions</p>
          )}
        </div>
      ))}
    </div>
  );
}
```

### Position Card Component

```typescript
function PositionCard({ position }: { position: VesselPositionMinute }) {
  return (
    <div className="position-card">
      <p>Time: {position.timestamp.toLocaleString()}</p>
      <p>Position: {position.lat.toFixed(4)}, {position.lon.toFixed(4)}</p>
      {position.speed && <p>Speed: {position.speed} knots</p>}
      {position.heading && <p>Heading: {position.heading}°</p>}
    </div>
  );
}
```

### Combined Usage with Context

```typescript
import { useSupabaseData } from '@/data/contexts';

function VesselDashboard() {
  const { vesselTrips, vesselPositionMinutes } = useSupabaseData();
  
  const { data: trips, loading: tripsLoading, error: tripsError } = vesselTrips;
  const { data: positions, loading: positionsLoading, error: positionsError } = vesselPositionMinutes;
  
  if (tripsLoading || positionsLoading) return <LoadingSpinner />;
  if (tripsError || positionsError) return <ErrorMessage error={tripsError || positionsError} />;
  
  return (
    <div>
      <h2>Vessel Dashboard</h2>
      
      <div className="trips-section">
        <h3>Active Trips</h3>
        {Object.entries(trips).map(([vesselAbrv, tripList]) => (
          <div key={vesselAbrv}>
            <h4>Vessel {vesselAbrv}</h4>
            {tripList.map(trip => (
              <TripCard key={trip.id} trip={trip} />
            ))}
          </div>
        ))}
      </div>
      
      <div className="positions-section">
        <h3>Recent Positions</h3>
        {Object.entries(positions).map(([tripId, positionList]) => (
          <div key={tripId}>
            <h4>Trip {tripId}</h4>
            {positionList.slice(0, 3).map(position => (
              <PositionCard key={position.id} position={position} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
```

## Data Models

### Vessel Trip

```typescript
type VesselTrip = {
  id: string;
  vesselAbrv: string;
  depTermAbrv: string;
  arvTermAbrv: string | null;
  timeStart: Date | null;
  timeEnd: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

type VesselTripMap = Record<string, VesselTrip[]>;
```

### Vessel Position Minute

```typescript
type VesselPositionMinute = {
  id: string;
  tripId: string;
  timestamp: Date;
  lat: number;
  lon: number;
  speed: number | null;
  heading: number | null;
  createdAt: Date;
};

type VesselPositionMinuteMap = Record<string, VesselPositionMinute[]>;
```

## Real-time Features

### Automatic Updates
Data automatically updates when database changes occur:

```typescript
function LiveVesselData() {
  const { vesselTrips, vesselPositionMinutes } = useSupabaseData();
  
  // Data automatically updates when database changes
  // No manual refresh needed
  
  return (
    <div>
      <p>Last updated: {new Date().toLocaleTimeString()}</p>
      {/* Your component content */}
    </div>
  );
}
```

### Subscription Management
Subscriptions are automatically managed by the context:

```typescript
// In SupabaseData.tsx context
useEffect(() => {
  // Subscribe to vessel_trips table changes
  const tripsSubscription = supabase
    .channel('vessel_trips_changes')
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'vessel_trips'
    }, handleTripsChange)
    .subscribe();

  // Subscribe to vessel_position_minutes table changes
  const positionsSubscription = supabase
    .channel('vessel_position_minutes_changes')
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'vessel_position_minutes'
    }, handlePositionsChange)
    .subscribe();

  return () => {
    // Cleanup subscriptions on unmount
    tripsSubscription.unsubscribe();
    positionsSubscription.unsubscribe();
  };
}, []);
```

## Error Handling

### Graceful Error Handling
```typescript
function SupabaseComponentWithErrorHandling() {
  const { vesselTrips, vesselPositionMinutes } = useSupabaseData();
  
  const { data: trips, loading: tripsLoading, error: tripsError } = vesselTrips;
  const { data: positions, loading: positionsLoading, error: positionsError } = vesselPositionMinutes;
  
  if (tripsLoading || positionsLoading) return <LoadingSpinner />;
  
  if (tripsError || positionsError) {
    return (
      <div className="error-container">
        <h3>Unable to load vessel data</h3>
        {tripsError && <p>Trip Error: {tripsError}</p>}
        {positionsError && <p>Position Error: {positionsError}</p>}
        <button onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }
  
  return (
    <div>
      {/* Your component content */}
    </div>
  );
}
```

## Performance Optimization

### Selective Loading
```typescript
function SingleVesselView({ vesselAbrv }: { vesselAbrv: string }) {
  const { vesselTrips } = useSupabaseData();
  const { data: trips } = vesselTrips;
  
  // Filter to specific vessel
  const vesselTrips = trips?.[vesselAbrv] || [];
  
  return (
    <div>
      <h3>Vessel {vesselAbrv}</h3>
      {vesselTrips.map(trip => (
        <TripCard key={trip.id} trip={trip} />
      ))}
    </div>
  );
}
```

### Optimistic Updates
```typescript
function VesselDataOptimistic() {
  const { vesselTrips, vesselPositionMinutes } = useSupabaseData();
  
  const { data: trips, loading: tripsLoading } = vesselTrips;
  const { data: positions, loading: positionsLoading } = vesselPositionMinutes;
  
  // Show cached data immediately while loading
  return (
    <div>
      {trips && Object.entries(trips).map(([vesselAbrv, tripList]) => (
        <div key={vesselAbrv}>
          <h4>Vessel {vesselAbrv}</h4>
          {tripList.map(trip => (
            <TripCard 
              key={trip.id} 
              trip={trip}
              isLoading={tripsLoading}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
```

## Caching Strategy

### Memory Cache (React Query)
- **Vessel Trips**: 5 minutes TTL
- **Vessel Position Minutes**: 5 minutes TTL
- **Real-time updates**: Immediate cache invalidation

### Storage Cache (AsyncStorage)
- **Vessel Trips**: 1 hour TTL
- **Vessel Position Minutes**: 1 hour TTL
- **Offline support**: Cached data available when offline

### Cache Invalidation
```typescript
function useVesselDataWithInvalidation() {
  const { vesselTrips, vesselPositionMinutes } = useSupabaseData();
  
  // Cache automatically invalidated on real-time updates
  // Manual invalidation also available if needed
  
  return { vesselTrips, vesselPositionMinutes };
}
```

## Best Practices

### 1. Use Context for Shared Data
Always use the SupabaseData context for accessing vessel data:

```typescript
// ✅ Good
const { vesselTrips, vesselPositionMinutes } = useSupabaseData();

// ❌ Avoid
const { data: trips } = useVesselTrip();
const { data: positions } = useVesselPositionMinute();
```

### 2. Handle Loading States
Always show loading indicators for better UX:
```typescript
if (loading) return <LoadingSpinner />;
```

### 3. Provide Error Feedback
Give users clear error messages and retry options:
```typescript
if (error) return <ErrorMessage error={error} onRetry={refetch} />;
```

### 4. Optimize Re-renders
Use React.memo for expensive components:
```typescript
const TripCard = React.memo(({ trip }) => {
  // Component implementation
});
```

### 5. Monitor Performance
Track subscription performance and data flow:
```typescript
const { vesselTrips, vesselPositionMinutes } = useSupabaseData({
  onSuccess: (data) => {
    console.log('Vessel data loaded:', data);
  },
  onError: (error) => {
    console.error('Vessel data error:', error);
  }
});
```

## Troubleshooting

### Common Issues

1. **No Real-time Updates**
   - Check Supabase connection
   - Verify table permissions
   - Review subscription setup

2. **Stale Data**
   - Clear React Query cache
   - Check subscription status
   - Force manual refresh

3. **Connection Errors**
   - Verify Supabase URL and key
   - Check internet connectivity
   - Review error logs

### Debug Mode
Enable debug logging to troubleshoot issues:
```typescript
// In SupabaseData.tsx context
const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!,
  {
    db: {
      schema: 'public'
    },
    auth: {
      persistSession: true
    },
    realtime: {
      params: {
        eventsPerSecond: 10
      }
    }
  }
);
```

## Configuration

### Environment Variables
```bash
# Required for Supabase connection
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Database Setup
```sql
-- Enable Row Level Security
ALTER TABLE vessel_trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE vessel_position_minutes ENABLE ROW LEVEL SECURITY;

-- Create policies for anonymous access
CREATE POLICY "Allow anonymous read access" ON vessel_trips
  FOR SELECT USING (true);

CREATE POLICY "Allow anonymous read access" ON vessel_position_minutes
  FOR SELECT USING (true);
``` 
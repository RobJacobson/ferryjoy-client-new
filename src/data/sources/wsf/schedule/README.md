# WSF Schedule API

Comprehensive ferry schedule data with 19 endpoints covering routes, terminals, vessels, schedules, time adjustments, and alerts.

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    WSF Schedule API                             │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  │
│  │ Infrastructure  │  │   Terminals     │  │     Routes      │  │
│  │   (2 endpoints) │  │   (4 endpoints) │  │   (6 endpoints) │  │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘  │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  │
│  │   Schedules     │  │Time Adjustments │  │   Shared        │  │
│  │   (4 endpoints) │  │   (3 endpoints) │  │   Utilities     │  │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## API Endpoints Overview

### Infrastructure (2 endpoints)
- `/cacheflushdate` - Cache invalidation trigger
- `/validdaterange` - Valid date range for all operations

### Terminals (4 endpoints)
- `/terminals` - Valid departing terminals for a date
- `/terminalsandmates` - All terminal combinations for a date
- `/terminalsandmatesbyroute` - Terminal combinations for a specific route
- `/terminalmates` - Arriving terminals for a departing terminal

### Routes (6 endpoints)
- `/routes` - Basic route information (with optional filtering)
- `/routeshavingservicedisruptions` - Routes with service disruptions
- `/routedetails` - Detailed route information
- `/schedroutes` - Scheduled routes for seasons
- `/activeseasons` - Active seasons summary
- `/alerts` - Alert information

### Schedules (4 endpoints)
- `/schedule` - Schedule for route or terminal combination
- `/scheduletoday` - Today's schedule
- `/sailings` - Sailings for a scheduled route
- `/allsailings` - All sailings for a scheduled route

### Time Adjustments (3 endpoints)
- `/timeadj` - All time adjustments
- `/timeadjbyroute` - Time adjustments for a route
- `/timeadjbyschedroute` - Time adjustments for a scheduled route

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

## Infrastructure Endpoints

### Cache Flush Date
```typescript
import { useCacheFlushDate } from '@/data/sources/wsf/schedule/infrastructure/cacheFlushDate';

function CacheStatus() {
  const { data: cacheInfo } = useCacheFlushDate();
  
  return (
    <div>
      <p>Last updated: {cacheInfo?.lastUpdated.toLocaleString()}</p>
      <p>Source: {cacheInfo?.source}</p>
    </div>
  );
}
```

### Valid Date Range
```typescript
import { useValidDateRange } from '@/data/sources/wsf/schedule/infrastructure/validDateRange';

function DateRangeInfo() {
  const { data: dateRange } = useValidDateRange();
  
  return (
    <div>
      <p>Valid from: {dateRange?.startDate.toLocaleDateString()}</p>
      <p>Valid to: {dateRange?.endDate.toLocaleDateString()}</p>
    </div>
  );
}
```

## Terminal Endpoints

### All Terminals
```typescript
import { useTerminals } from '@/data/sources/wsf/schedule/terminals';

function TerminalList({ tripDate }: { tripDate: Date }) {
  const { data: terminals, isLoading } = useTerminals(tripDate);
  
  if (isLoading) return <LoadingSpinner />;
  
  return (
    <div>
      {terminals?.map(terminal => (
        <TerminalCard key={terminal.id} terminal={terminal} />
      ))}
    </div>
  );
}
```

### Terminals by Route
```typescript
import { useTerminalsByRoute } from '@/data/sources/wsf/schedule/terminals';

function RouteTerminals({ routeId }: { routeId: number }) {
  const { data: terminals } = useTerminalsByRoute(routeId);
  
  return (
    <div>
      {terminals?.map(terminal => (
        <TerminalCard key={terminal.id} terminal={terminal} />
      ))}
    </div>
  );
}
```

### Terminals and Mates
```typescript
import { useTerminalsAndMates } from '@/data/sources/wsf/schedule/terminals';

function TerminalCombinations({ tripDate }: { tripDate: Date }) {
  const { data: combinations } = useTerminalsAndMates(tripDate);
  
  return (
    <div>
      {combinations?.map(combo => (
        <div key={combo.departingTerminal.id}>
          <h3>From: {combo.departingTerminal.name}</h3>
          <p>To:</p>
          {combo.arrivingTerminals.map(terminal => (
            <p key={terminal.id}>• {terminal.name}</p>
          ))}
        </div>
      ))}
    </div>
  );
}
```

### Terminal Mates
```typescript
import { useTerminalMates } from '@/data/sources/wsf/schedule/terminals';

function TerminalDestinations({ tripDate, terminalId }: { tripDate: Date; terminalId: number }) {
  const { data: destinations } = useTerminalMates(tripDate, terminalId);
  
  return (
    <div>
      <h3>Destinations from this terminal:</h3>
      {destinations?.map(terminal => (
        <p key={terminal.id}>• {terminal.name}</p>
      ))}
    </div>
  );
}
```

## Route Endpoints

### All Routes
```typescript
import { useRoutes } from '@/data/sources/wsf/schedule/routes';

function RouteList() {
  const { data: routes, isLoading } = useRoutes();
  
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

### Routes by Date
```typescript
import { useRoutesByDate } from '@/data/sources/wsf/schedule/routes';

function DailyRoutes({ tripDate }: { tripDate: Date }) {
  const { data: routes } = useRoutesByDate(tripDate);
  
  return (
    <div>
      <h3>Routes for {tripDate.toLocaleDateString()}</h3>
      {routes?.map(route => (
        <RouteCard key={route.id} route={route} />
      ))}
    </div>
  );
}
```

### Routes by Terminals
```typescript
import { useRoutesByTerminals } from '@/data/sources/wsf/schedule/routes';

function DirectRoutes({ tripDate, departingTerminalId, arrivingTerminalId }: {
  tripDate: Date;
  departingTerminalId: number;
  arrivingTerminalId: number;
}) {
  const { data: routes } = useRoutesByTerminals({
    tripDate,
    departingTerminalId,
    arrivingTerminalId
  });
  
  return (
    <div>
      <h3>Direct routes between terminals</h3>
      {routes?.map(route => (
        <RouteCard key={route.id} route={route} />
      ))}
    </div>
  );
}
```

### Routes with Disruptions
```typescript
import { useRoutesWithDisruptions } from '@/data/sources/wsf/schedule/routes';

function DisruptedRoutes({ tripDate }: { tripDate: Date }) {
  const { data: routes } = useRoutesWithDisruptions(tripDate);
  
  return (
    <div>
      <h3>Routes with service disruptions</h3>
      {routes?.map(route => (
        <RouteCard key={route.id} route={route} />
      ))}
    </div>
  );
}
```

### Route Details
```typescript
import { useRouteDetails } from '@/data/sources/wsf/schedule/routes';

function DetailedRoutes({ tripDate }: { tripDate: Date }) {
  const { data: routes } = useRouteDetails(tripDate);
  
  return (
    <div>
      <h3>Detailed route information</h3>
      {routes?.map(route => (
        <DetailedRouteCard key={route.id} route={route} />
      ))}
    </div>
  );
}
```

### Scheduled Routes
```typescript
import { useScheduledRoutes, useScheduledRoutesBySeason } from '@/data/sources/wsf/schedule/routes';

function ScheduledRoutes() {
  const { data: allRoutes } = useScheduledRoutes();
  const { data: seasonRoutes } = useScheduledRoutesBySeason(1); // season ID
  
  return (
    <div>
      <h3>All scheduled routes</h3>
      {allRoutes?.map(route => (
        <ScheduledRouteCard key={route.schedRouteId} route={route} />
      ))}
      
      <h3>Season-specific routes</h3>
      {seasonRoutes?.map(route => (
        <ScheduledRouteCard key={route.schedRouteId} route={route} />
      ))}
    </div>
  );
}
```

### Active Seasons
```typescript
import { useActiveSeasons } from '@/data/sources/wsf/schedule/routes';

function SeasonInfo() {
  const { data: seasons } = useActiveSeasons();
  
  return (
    <div>
      <h3>Active seasons</h3>
      {seasons?.map(season => (
        <div key={season.seasonId}>
          <h4>{season.seasonName}</h4>
          <p>Active: {season.isActive ? 'Yes' : 'No'}</p>
          <p>Period: {season.startDate.toLocaleDateString()} - {season.endDate.toLocaleDateString()}</p>
        </div>
      ))}
    </div>
  );
}
```

### Alerts
```typescript
import { useAlerts } from '@/data/sources/wsf/schedule/routes';

function AlertList() {
  const { data: alerts } = useAlerts();
  
  return (
    <div>
      <h3>Current alerts</h3>
      {alerts?.map(alert => (
        <AlertCard key={alert.alertId} alert={alert} />
      ))}
    </div>
  );
}
```

## Schedule Endpoints

### Schedule by Route
```typescript
import { useScheduleByRoute } from '@/data/sources/wsf/schedule/schedules';

function RouteSchedule({ tripDate, routeId }: { tripDate: Date; routeId: number }) {
  const { data: schedules } = useScheduleByRoute(tripDate, routeId);
  
  return (
    <div>
      {schedules?.map(schedule => (
        <ScheduleCard key={schedule.id} schedule={schedule} />
      ))}
    </div>
  );
}
```

### Schedule by Terminals
```typescript
import { useScheduleByTerminals } from '@/data/sources/wsf/schedule/schedules';

function TerminalSchedule({ tripDate, departingTerminalId, arrivingTerminalId }: {
  tripDate: Date;
  departingTerminalId: number;
  arrivingTerminalId: number;
}) {
  const { data: schedules } = useScheduleByTerminals(tripDate, departingTerminalId, arrivingTerminalId);
  
  return (
    <div>
      {schedules?.map(schedule => (
        <ScheduleCard key={schedule.id} schedule={schedule} />
      ))}
    </div>
  );
}
```

### Today's Schedule
```typescript
import { useScheduleTodayByRoute, useScheduleTodayByTerminals } from '@/data/sources/wsf/schedule/schedules';

function TodaysSchedule() {
  const { data: routeSchedules } = useScheduleTodayByRoute(1, false); // routeId, onlyRemainingTimes
  const { data: terminalSchedules } = useScheduleTodayByTerminals(1, 2, true); // depTermId, arvTermId, onlyRemainingTimes
  
  return (
    <div>
      <h3>Today's schedules by route</h3>
      {routeSchedules?.map(schedule => (
        <ScheduleCard key={schedule.id} schedule={schedule} />
      ))}
      
      <h3>Today's schedules by terminals</h3>
      {terminalSchedules?.map(schedule => (
        <ScheduleCard key={schedule.id} schedule={schedule} />
      ))}
    </div>
  );
}
```

### Sailings
```typescript
import { useSailings, useAllSailings } from '@/data/sources/wsf/schedule/schedules';

function SailingInfo() {
  const { data: sailings } = useSailings(1); // schedRouteId
  const { data: allSailings } = useAllSailings(1, 2024); // schedRouteId, year
  
  return (
    <div>
      <h3>Current sailings</h3>
      {sailings?.map(sailing => (
        <SailingCard key={sailing.sailingId} sailing={sailing} />
      ))}
      
      <h3>All sailings for 2024</h3>
      {allSailings?.map(sailing => (
        <SailingCard key={sailing.sailingId} sailing={sailing} />
      ))}
    </div>
  );
}
```

## Time Adjustment Endpoints

### All Time Adjustments
```typescript
import { useTimeAdjustments } from '@/data/sources/wsf/schedule/timeAdjustments';

function AllAdjustments() {
  const { data: adjustments } = useTimeAdjustments();
  
  return (
    <div>
      <h3>All time adjustments</h3>
      {adjustments?.map(adjustment => (
        <AdjustmentCard key={adjustment.adjustmentId} adjustment={adjustment} />
      ))}
    </div>
  );
}
```

### Time Adjustments by Route
```typescript
import { useTimeAdjustmentsByRoute } from '@/data/sources/wsf/schedule/timeAdjustments';

function RouteAdjustments({ routeId }: { routeId: number }) {
  const { data: adjustments } = useTimeAdjustmentsByRoute(routeId);
  
  return (
    <div>
      <h3>Time adjustments for route {routeId}</h3>
      {adjustments?.map(adjustment => (
        <AdjustmentCard key={adjustment.adjustmentId} adjustment={adjustment} />
      ))}
    </div>
  );
}
```

### Time Adjustments by Scheduled Route
```typescript
import { useTimeAdjustmentsBySchedRoute } from '@/data/sources/wsf/schedule/timeAdjustments';

function ScheduledRouteAdjustments({ schedRouteId }: { schedRouteId: number }) {
  const { data: adjustments } = useTimeAdjustmentsBySchedRoute(schedRouteId);
  
  return (
    <div>
      <h3>Time adjustments for scheduled route {schedRouteId}</h3>
      {adjustments?.map(adjustment => (
        <AdjustmentCard key={adjustment.adjustmentId} adjustment={adjustment} />
      ))}
    </div>
  );
}
```

## Data Models

### Route
```typescript
type Route = {
  id: number;
  name: string;
  description: string;
  abbreviation: string;
  color: string;
  isActive: boolean;
  terminals: Terminal[];
};
```

### Terminal
```typescript
type Terminal = {
  id: number;
  name: string;
  abbreviation: string;
  latitude: number;
  longitude: number;
  isActive: boolean;
};
```

### Schedule
```typescript
type Schedule = {
  id: number;
  routeId: number;
  tripDate: Date;
  departures: ScheduleDeparture[];
};
```

### Time Adjustment
```typescript
type TimeAdjustment = {
  adjustmentId: number;
  routeId: number;
  schedRouteId: number;
  departureTime: Date;
  adjustedTime: Date;
  reason: string;
  isActive: boolean;
};
```

## Error Handling

```typescript
function ScheduleComponent() {
  const { data, isLoading, error, refetch } = useRoutes();
  
  if (isLoading) return <LoadingSpinner />;
  
  if (error) {
    return (
      <div>
        <p>Error loading schedule data: {error.message}</p>
        <button onClick={() => refetch()}>Retry</button>
      </div>
    );
  }
  
  return (
    <div>
      {data?.map(item => (
        <DataCard key={item.id} data={item} />
      ))}
    </div>
  );
}
```

## Caching Strategy

### Cache Categories
1. **Infrastructure** (24h storage TTL)
   - Cache flush date
   - Valid date range

2. **Reference Data** (24h storage TTL)
   - Terminals
   - Routes
   - Active seasons

3. **Schedule Data** (1h storage TTL)
   - Schedules
   - Sailings
   - Time adjustments

4. **Real-time Data** (5min memory TTL only)
   - Schedule today
   - Alerts
   - Routes with disruptions

### Cache Invalidation
- All cached data invalidated when cache flush date changes
- Individual features can check cache flush date independently
- Memory cache serves as first-level cache
- AsyncStorage serves as second-level cache

## Best Practices

1. **Always handle loading states**: Show appropriate loading indicators
2. **Handle errors gracefully**: Provide retry mechanisms and user feedback
3. **Use appropriate cache strategies**: Different TTLs for different data types
4. **Validate date ranges**: Check valid date range before making requests
5. **Monitor cache flush dates**: Refresh data when cache is invalidated
6. **Use TypeScript**: Leverage type safety for all API interactions

## Performance Tips

1. **Lazy load data**: Only fetch data when components are mounted
2. **Use React Query caching**: Leverage built-in caching and background updates
3. **Optimize re-renders**: Use appropriate dependency arrays in hooks
4. **Batch requests**: Group related API calls when possible
5. **Monitor bundle size**: Import only what you need from each module 
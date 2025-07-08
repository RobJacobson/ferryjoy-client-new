# WSF Schedule API Implementation Plan

## Overview
This plan implements all 19 endpoints from the WSF Schedule API documentation, organized by functionality with proper caching strategies and consolidated folder structure.

## API Endpoints Analysis

### Core Infrastructure (2 endpoints)
- `/cacheflushdate` - Cache invalidation trigger
- `/validdaterange` - Valid date range for all operations

### Terminal Operations (4 endpoints)
- `/terminals` - Valid departing terminals for a date
- `/terminalsandmates` - All terminal combinations for a date
- `/terminalsandmatesbyroute` - Terminal combinations for a specific route
- `/terminalmates` - Arriving terminals for a departing terminal

### Route Operations (6 endpoints)
- `/routes` - Basic route information (with optional filtering)
- `/routeshavingservicedisruptions` - Routes with service disruptions
- `/routedetails` - Detailed route information
- `/schedroutes` - Scheduled routes for seasons
- `/activeseasons` - Active seasons summary
- `/alerts` - Alert information

### Schedule Operations (4 endpoints)
- `/schedule` - Schedule for route or terminal combination
- `/scheduletoday` - Today's schedule
- `/sailings` - Sailings for a scheduled route
- `/allsailings` - All sailings for a scheduled route

### Time Adjustment Operations (3 endpoints)
- `/timeadj` - All time adjustments
- `/timeadjbyroute` - Time adjustments for a route
- `/timeadjbyschedroute` - Time adjustments for a scheduled route

## Consolidated Folder Structure

```
src/data/sources/wsf/schedule/
├── index.ts                              # Export all schedule features
├── shared/                               # Schedule-specific shared utilities
│   ├── cache.ts                          # AsyncStorage caching strategy
│   ├── cacheFlushDate.ts                 # Cache flush date management
│   └── index.ts
├── infrastructure/                       # Core infrastructure features
│   ├── cacheFlushDate/                   # /cacheflushdate
│   │   ├── types.ts
│   │   ├── api.ts
│   │   ├── converter.ts
│   │   ├── hook.ts
│   │   └── index.ts
│   ├── validDateRange/                   # /validdaterange
│   │   ├── types.ts
│   │   ├── api.ts
│   │   ├── converter.ts
│   │   ├── hook.ts
│   │   └── index.ts
│   └── index.ts
├── terminals/                            # All terminal-related endpoints (4 endpoints)
│   ├── types.ts                          # All terminal types
│   ├── api.ts                            # All terminal API calls
│   ├── converter.ts                      # All terminal converters
│   ├── hook.ts                           # All terminal hooks
│   └── index.ts
├── routes/                               # All route-related endpoints (6 endpoints)
│   ├── types.ts                          # All route, season, and alert types
│   ├── api.ts                            # All route, season, and alert API calls
│   ├── converter.ts                      # All route, season, and alert converters
│   ├── hook.ts                           # All route, season, and alert hooks
│   └── index.ts
├── schedules/                            # All schedule-related endpoints (4 endpoints)
│   ├── types.ts                          # All schedule types
│   ├── api.ts                            # All schedule API calls
│   ├── converter.ts                      # All schedule converters
│   ├── hook.ts                           # All schedule hooks
│   └── index.ts
├── timeAdjustments/                      # All time adjustment endpoints (3 endpoints)
│   ├── types.ts                          # All time adjustment types
│   ├── api.ts                            # All time adjustment API calls
│   ├── converter.ts                      # All time adjustment converters
│   ├── hook.ts                           # All time adjustment hooks
│   └── index.ts
└── index.ts                              # Main schedule exports
```

## Implementation Phases

### Phase 1: Infrastructure & Shared Utilities
1. **Extend WSF shared utilities**
   - Add "schedule" source type to `config.ts`
   - Add `SCHEDULE_API_BASE` constant
   - Create parameterized fetch functions in `fetch.ts`
   - Extend API factory for complex parameters

2. **Create schedule-specific shared utilities**
   - `cache.ts` - AsyncStorage caching with TTL
   - `cacheFlushDate.ts` - Cache invalidation management

3. **Implement core infrastructure**
   - `cacheFlushDate` - Cache invalidation trigger
   - `validDateRange` - Valid date range for all operations

### Phase 2: Terminal Operations (Consolidated)
Implement all 4 terminal endpoints in a single feature:
- `/terminals` - Basic terminal information
- `/terminalsandmates` - Terminal combinations
- `/terminalsandmatesbyroute` - Route-specific terminals
- `/terminalmates` - Arriving terminals for departing terminal

### Phase 3: Route Operations (Consolidated)
Implement all 6 route-related endpoints in a single feature:
- `/routes` - Basic route information (with filtering)
- `/routeshavingservicedisruptions` - Disrupted routes
- `/routedetails` - Detailed route information
- `/schedroutes` - Season-based routes
- `/activeseasons` - Active seasons (used for route filtering)
- `/alerts` - Route-related alerts and disruptions

### Phase 4: Schedule Operations (Consolidated)
Implement all 4 schedule endpoints in a single feature:
- `/schedule` - Main schedule data (with filtering)
- `/scheduletoday` - Today's schedule
- `/sailings` - Sailings for scheduled routes
- `/allsailings` - Complete sailing information

### Phase 5: Time Adjustments (Consolidated)
Implement all 3 time adjustment endpoints in a single feature:
- `/timeadj` - All time adjustments
- `/timeadjbyroute` - Route-specific adjustments
- `/timeadjbyschedroute` - Scheduled route adjustments

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

## Consolidated API Call Mapping

### Infrastructure
| Endpoint | Hook Name | Parameters |
|----------|-----------|------------|
| `/cacheflushdate` | `useCacheFlushDate` | None |
| `/validdaterange` | `useValidDateRange` | None |

### Terminals (Consolidated)
| Endpoint | Hook Name | Parameters |
|----------|-----------|------------|
| `/terminals` | `useTerminals` | `tripDate: Date` |
| `/terminalsandmates` | `useTerminalsAndMates` | `tripDate: Date` |
| `/terminalsandmatesbyroute` | `useTerminalsAndMatesByRoute` | `tripDate: Date`, `routeId: number` |
| `/terminalmates` | `useTerminalMates` | `tripDate: Date`, `terminalId: number` |

### Routes (Consolidated)
| Endpoint | Hook Name | Parameters |
|----------|-----------|------------|
| `/routes` | `useRoutes` | `tripDate: Date` |
| `/routes` | `useRoutesByTerminals` | `tripDate: Date`, `depTermId: number`, `arvTermId: number` |
| `/routeshavingservicedisruptions` | `useRoutesWithDisruptions` | `tripDate: Date` |
| `/routedetails` | `useRouteDetails` | `tripDate: Date` |
| `/routedetails` | `useRouteDetailsByTerminals` | `tripDate: Date`, `depTermId: number`, `arvTermId: number` |
| `/routedetails` | `useRouteDetailsByRoute` | `tripDate: Date`, `routeId: number` |
| `/schedroutes` | `useScheduledRoutes` | None |
| `/schedroutes` | `useScheduledRoutesBySeason` | `scheduleId: number` |
| `/activeseasons` | `useActiveSeasons` | None |
| `/alerts` | `useAlerts` | None |

### Schedules (Consolidated)
| Endpoint | Hook Name | Parameters |
|----------|-----------|------------|
| `/schedule` | `useScheduleByRoute` | `tripDate: Date`, `routeId: number` |
| `/schedule` | `useScheduleByTerminals` | `tripDate: Date`, `depTermId: number`, `arvTermId: number` |
| `/scheduletoday` | `useScheduleTodayByRoute` | `routeId: number`, `onlyRemainingTimes: boolean` |
| `/scheduletoday` | `useScheduleTodayByTerminals` | `depTermId: number`, `arvTermId: number`, `onlyRemainingTimes: boolean` |
| `/sailings` | `useSailings` | `schedRouteId: number` |
| `/allsailings` | `useAllSailings` | `schedRouteId: number`, `year: number` |

### Time Adjustments (Consolidated)
| Endpoint | Hook Name | Parameters |
|----------|-----------|------------|
| `/timeadj` | `useTimeAdjustments` | None |
| `/timeadjbyroute` | `useTimeAdjustmentsByRoute` | `routeId: number` |
| `/timeadjbyschedroute` | `useTimeAdjustmentsBySchedRoute` | `schedRouteId: number` |

## Benefits of Consolidated Structure

### 1. **Reduced Complexity**
- 5 main feature folders instead of 19 endpoint folders
- Related functionality grouped together
- Easier to understand relationships between endpoints

### 2. **Shared Resources**
- Common types for related endpoints
- Shared converter logic for similar data structures
- Unified API patterns within each domain

### 3. **Better Maintenance**
- Fewer files to maintain
- Changes to related endpoints in one place
- Consistent patterns within each domain

### 4. **Improved Type Safety**
- Shared types prevent inconsistencies
- Easier to maintain type relationships
- Better IntelliSense support

### 5. **Logical Grouping**
- Route-related data (routes, seasons, alerts) grouped together
- Terminal operations grouped together
- Schedule operations grouped together
- Time adjustments grouped together

## Example: Consolidated Routes Structure

```typescript
// routes/types.ts
export type Route = {
  // Common route structure
}
export type ActiveSeason = {
  // Season information
}
export type Alert = {
  // Alert information
}

// routes/api.ts
export const fetchRoutes = async (tripDate: Date): Promise<Route[]>
export const fetchRoutesByTerminals = async (tripDate: Date, depTermId: number, arvTermId: number): Promise<Route[]>
export const fetchRoutesWithDisruptions = async (tripDate: Date): Promise<Route[]>
export const fetchRouteDetails = async (tripDate: Date): Promise<Route[]>
export const fetchScheduledRoutes = async (): Promise<Route[]>
export const fetchScheduledRoutesBySeason = async (scheduleId: number): Promise<Route[]>
export const fetchActiveSeasons = async (): Promise<ActiveSeason[]>
export const fetchAlerts = async (): Promise<Alert[]>

// routes/converter.ts
export const toRoute = (apiResponse: RouteApiResponse): Route => // Shared converter
export const toActiveSeason = (apiResponse: ActiveSeasonApiResponse): ActiveSeason => // Season converter
export const toAlert = (apiResponse: AlertApiResponse): Alert => // Alert converter

// routes/hook.ts
export const useRoutes = (tripDate: Date) => // Basic routes
export const useRoutesByTerminals = (tripDate: Date, depTermId: number, arvTermId: number) => // Filtered routes
export const useRoutesWithDisruptions = (tripDate: Date) => // Disrupted routes
export const useRouteDetails = (tripDate: Date) => // Detailed routes
export const useScheduledRoutes = () => // All scheduled routes
export const useScheduledRoutesBySeason = (scheduleId: number) => // Season-specific routes
export const useActiveSeasons = () => // Active seasons
export const useAlerts = () => // Route alerts
```

## Key Implementation Notes

1. **Date Parameters**: All date parameters use JavaScript Date objects (not strings)
2. **API Key**: Uses existing `EXPO_PUBLIC_WSDOT_ACCESS_TOKEN`
3. **Error Handling**: Reuses existing WSF error patterns
4. **Date Conversion**: Uses existing `parseWsfDate` function for API responses
5. **Type Safety**: Full TypeScript support with proper generics
6. **Caching**: Two-tier caching (memory + AsyncStorage) with cache flush date invalidation
7. **Consolidation**: Related endpoints share common patterns while maintaining separate hooks for flexibility
8. **Logical Grouping**: Route-related data (routes, seasons, alerts) grouped together for better organization
9. **Type Definitions**: Uses type aliases instead of interfaces for better consistency 
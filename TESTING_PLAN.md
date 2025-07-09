# Unit Testing Plan for WSF API Endpoints

## Overview

This document outlines a comprehensive testing strategy for the Washington State Ferries (WSF) API endpoints in the `src/data/wsf` directory. The plan follows JavaScript/TypeScript best practices and ensures robust test coverage for all API functions, hooks, and utilities.

## Testing Infrastructure

### Dependencies Added
- **Vitest** - Modern test runner (Jest alternative)
- **@testing-library/react** - React component testing utilities
- **@testing-library/react-hooks** - React hooks testing utilities
- **jsdom** - DOM environment for testing
- **@vitest/ui** - Visual test interface

### Configuration
- `vitest.config.ts` - Test configuration with path aliases
- `src/test/setup.ts` - Global test setup and mocks
- `src/test/utils.ts` - Test utilities and mock data

## Test Structure

### 1. API Function Tests (`__tests__/api.test.ts`)

**Purpose**: Test pure API functions that fetch data from WSF endpoints

**Coverage**:
- ✅ Successful API calls
- ✅ Error handling and graceful degradation
- ✅ Parameter validation
- ✅ URL construction
- ✅ Response transformation

**Example Test Structure**:
```typescript
describe('Vessel Locations API', () => {
  describe('getVesselLocations', () => {
    it('should fetch all vessel locations successfully', async () => {
      // Mock successful response
      // Call API function
      // Assert correct parameters and response
    });

    it('should handle API errors gracefully', async () => {
      // Mock error response
      // Call API function
      // Assert graceful error handling
    });
  });
});
```

### 2. React Query Hook Tests (`__tests__/hook.test.ts`)

**Purpose**: Test React Query hooks that wrap API functions

**Coverage**:
- ✅ Hook initialization and loading states
- ✅ Successful data fetching
- ✅ Error states and error handling
- ✅ Query key management
- ✅ Conditional fetching (enabled/disabled)
- ✅ Cache behavior

**Example Test Structure**:
```typescript
describe('Vessel Locations Hooks', () => {
  describe('useVesselLocations', () => {
    it('should fetch vessel locations successfully', async () => {
      // Mock API function
      // Render hook with QueryClientProvider
      // Assert loading states and final data
    });

    it('should handle API errors gracefully', async () => {
      // Mock API error
      // Render hook
      // Assert error states
    });
  });
});
```

### 3. Utility Function Tests (`__tests__/utils.test.ts`)

**Purpose**: Test shared utility functions for data transformation

**Coverage**:
- ✅ Date string parsing (WSF format, ISO, US format)
- ✅ PascalCase to camelCase conversion
- ✅ Nested object transformation
- ✅ Array transformation
- ✅ Edge cases (null, undefined, invalid dates)

**Example Test Structure**:
```typescript
describe('WSF Data Transformation', () => {
  describe('transformWsfData', () => {
    it('should transform WSF date format to JavaScript Date objects', () => {
      // Test /Date(timestamp)/ format
      // Test YYYY-MM-DD format
      // Test MM/DD/YYYY format
    });

    it('should convert PascalCase keys to camelCase', () => {
      // Test key conversion
      // Test nested object conversion
    });
  });
});
```

## Test Categories by Module

### Vessels API (`/vessels`)

#### 1. Vessel Locations (`/vessellocations`)
- **API Functions**: `getVesselLocations`, `getVesselLocationsByVesselId`
- **Hooks**: `useVesselLocations`, `useVesselLocationsByVesselId`
- **Data Type**: `VesselLocation[]`
- **Update Frequency**: Every 30 seconds

**Test Scenarios**:
- Fetch all vessel locations
- Fetch specific vessel by ID
- Handle network errors
- Handle invalid vessel IDs
- Test real-time data updates

#### 2. Vessel Verbose (`/vesselverbose`)
- **API Functions**: `getVesselVerbose`, `getVesselVerboseByVesselId`
- **Hooks**: `useVesselVerbose`, `useVesselVerboseByVesselId`
- **Data Type**: `VesselVerbose[]`
- **Update Frequency**: Daily (static data)

**Test Scenarios**:
- Fetch all vessel details
- Fetch specific vessel details
- Handle missing vessel data
- Test vessel specifications and amenities

#### 3. Cache Flush Date (`/cacheflushdate`)
- **API Functions**: `getVesselsCacheFlushDate`
- **Hooks**: `useVesselsCacheFlushDate`
- **Data Type**: `VesselsCacheFlushDate`
- **Update Frequency**: When cache is invalidated

**Test Scenarios**:
- Fetch cache flush date
- Handle cache invalidation
- Test cache management

### Terminals API (`/terminals`)

#### 1. Terminal Sailing Space (`/terminalsailingspace`)
- **API Functions**: `getTerminalSailingSpace`, `getTerminalSailingSpaceByTerminalId`
- **Hooks**: `useTerminalSailingSpace`, `useTerminalSailingSpaceByTerminalId`
- **Data Type**: `TerminalSailingSpace[]`
- **Update Frequency**: Every 5 minutes

**Test Scenarios**:
- Fetch all terminal space data
- Fetch specific terminal space data
- Test space availability calculations
- Handle wait time data

#### 2. Terminal Verbose (`/terminalverbose`)
- **API Functions**: `getTerminalVerbose`, `getTerminalVerboseByTerminalId`
- **Hooks**: `useTerminalVerbose`, `useTerminalVerboseByTerminalId`
- **Data Type**: `TerminalVerbose[]`
- **Update Frequency**: Weekly (static data)

**Test Scenarios**:
- Fetch all terminal details
- Fetch specific terminal details
- Test terminal facilities and amenities
- Test accessibility features

#### 3. Terminal Wait Times (`/terminalwaittimes`)
- **API Functions**: `getTerminalWaitTimes`, `getTerminalWaitTimesByTerminalId`
- **Hooks**: `useTerminalWaitTimes`, `useTerminalWaitTimesByTerminalId`
- **Data Type**: `TerminalWaitTime[]`
- **Update Frequency**: Real-time

**Test Scenarios**:
- Fetch wait time data
- Test wait time calculations
- Handle service disruptions

### Schedule API (`/schedule`)

#### 1. Routes (`/routes`)
- **API Functions**: `getRoutes`, `getRouteByRouteId`
- **Hooks**: `useRoutes`, `useRouteByRouteId`
- **Data Type**: `Route[]`
- **Update Frequency**: Daily

**Test Scenarios**:
- Fetch all routes
- Fetch specific route
- Test route information
- Handle inactive routes

#### 2. Schedules (`/schedules`)
- **API Functions**: `getSchedules`, `getSchedulesByRouteId`
- **Hooks**: `useSchedules`, `useSchedulesByRouteId`
- **Data Type**: `Schedule[]`
- **Update Frequency**: Daily

**Test Scenarios**:
- Fetch all schedules
- Fetch route-specific schedules
- Test departure and arrival times
- Handle schedule changes

#### 3. Alerts (`/alerts`)
- **API Functions**: `getAlerts`, `getAlertsByRouteId`
- **Hooks**: `useAlerts`, `useAlertsByRouteId`
- **Data Type**: `Alert[]`
- **Update Frequency**: Real-time

**Test Scenarios**:
- Fetch all alerts
- Fetch route-specific alerts
- Test alert severity levels
- Handle active/inactive alerts

#### 4. Active Seasons (`/activeseasons`)
- **API Functions**: `getActiveSeasons`
- **Hooks**: `useActiveSeasons`
- **Data Type**: `ActiveSeason[]`
- **Update Frequency**: Weekly

**Test Scenarios**:
- Fetch active seasons
- Test seasonal service information
- Handle season transitions

## Shared Utilities Testing

### 1. Data Transformation (`utils.ts`)
- **Function**: `transformWsfData`
- **Purpose**: Convert WSF API responses to application format
- **Type System**: Uses `JsonValue` input and `JsonX` output types

**Test Cases**:
- WSF date format parsing (`/Date(timestamp)/`)
- ISO date format parsing (`YYYY-MM-DD`)
- US date format parsing (`MM/DD/YYYY`)
- PascalCase to camelCase conversion
- Nested object transformation
- Array transformation
- Edge cases (null, undefined, invalid dates)
- Type safety with `Record<string, any>` for testing

### 2. Fetch Utilities (`fetch.ts`, `fetchInternal.ts`)
- **Functions**: `fetchWsf`, `fetchWsfArray`, `fetchInternal`
- **Purpose**: Platform-specific fetch implementation

**Test Cases**:
- Web JSONP implementation
- Mobile native fetch
- Error handling and retries
- CORS handling
- Timeout handling
- Response transformation

### 3. Date Utilities (`dateUtils.ts`)
- **Functions**: `buildWsfUrl`, date parsing utilities
- **Purpose**: URL construction and date handling

**Test Cases**:
- URL template substitution
- Date validation
- Date format detection
- Error handling for invalid dates

## Test Data and Mocking Strategy

### Mock Data Structure
```typescript
// Realistic WSF API responses
export const mockVesselLocationResponse: VesselLocation[] = [
  {
    vesselID: 1,
    vesselName: 'M/V Cathlamet',
    longitude: -122.3321,
    latitude: 47.6062,
    heading: 180,
    speed: 12.5,
    inService: true,
    atDock: false,
    departingTerminalId: 1,
    departingTerminalName: 'Seattle',
    arrivingTerminalId: 2,
    arrivingTerminalName: 'Bainbridge Island',
    scheduledDeparture: new Date('2023-12-21T14:30:00.000Z'),
    estimatedArrival: new Date('2023-12-21T15:00:00.000Z'),
    lastUpdated: new Date('2023-12-21T14:30:00.000Z'),
  },
];

// Raw WSF API responses (before transformation)
export const mockRawVesselLocationResponse = [
  {
    VesselID: 1,
    VesselName: 'M/V Cathlamet',
    Longitude: -122.3321,
    Latitude: 47.6062,
    Heading: 180,
    Speed: 12.5,
    InService: true,
    AtDock: false,
    DepartingTerminalId: 1,
    DepartingTerminalName: 'Seattle',
    ArrivingTerminalId: 2,
    ArrivingTerminalName: 'Bainbridge Island',
    ScheduledDeparture: '/Date(1703123400000)/',
    EstimatedArrival: '/Date(1703124000000)/',
    LastUpdated: '/Date(1703123456789)/',
  },
];
```

### Mocking Strategy
1. **API Functions**: Mock `fetchWsfArray` and `fetchWsf` functions
2. **React Query**: Mock API functions and test hook behavior
3. **Platform**: Mock React Native Platform for web testing
4. **Logger**: Mock logger to avoid console output in tests
5. **Document**: Mock document for JSONP testing

## Test Execution Commands

```bash
# Run all tests
bun test

# Run tests in watch mode
bun test:watch

# Run tests with coverage
bun test:coverage

# Run tests with UI
bun test:ui

# Run specific test file
bun test src/data/wsf/vessels/vesselLocations/__tests__/api.test.ts

# Run tests matching pattern
bun test --grep "Vessel Locations"
```

## Coverage Goals

### Target Coverage Metrics
- **Statements**: 90%+
- **Branches**: 85%+
- **Functions**: 95%+
- **Lines**: 90%+

### Critical Paths
- ✅ API function error handling
- ✅ Data transformation edge cases
- ✅ React Query hook states
- ✅ Date parsing and validation
- ✅ URL construction and parameter handling

## Best Practices Implemented

### 1. Test Organization
- **AAA Pattern**: Arrange, Act, Assert
- **Descriptive Test Names**: Clear what is being tested
- **Grouped Tests**: Logical test suites by functionality
- **Isolated Tests**: No test dependencies

### 2. Mocking Strategy
- **Minimal Mocking**: Only mock external dependencies
- **Realistic Data**: Use actual WSF API response formats
- **Consistent Mocks**: Reusable mock data across tests
- **Platform Agnostic**: Tests work on web and mobile

### 3. Error Testing
- **Graceful Degradation**: Test error handling paths
- **Network Errors**: Simulate network failures
- **Invalid Data**: Test malformed responses
- **Edge Cases**: Test boundary conditions

### 4. Performance Considerations
- **Fast Tests**: Minimal setup and teardown
- **Parallel Execution**: Tests can run concurrently
- **Efficient Mocks**: Lightweight mock implementations
- **Memory Management**: Proper cleanup after tests

## Integration with CI/CD

### GitHub Actions Integration
```yaml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: oven-sh/setup-bun@v1
      - run: bun install
      - run: bun test:coverage
      - run: bun run check:all
```

### Pre-commit Hooks
- Run tests before commit
- Check coverage thresholds
- Lint and format code
- Type checking

## Future Enhancements

### 1. Integration Tests
- End-to-end API testing
- Real WSF API integration (with rate limiting)
- Performance benchmarking

### 2. Visual Regression Tests
- Component screenshot testing
- Map visualization testing
- UI state testing

### 3. Load Testing
- API performance under load
- Memory usage monitoring
- Network resilience testing

### 4. Accessibility Testing
- Screen reader compatibility
- Keyboard navigation
- Color contrast validation

## Conclusion

This comprehensive testing plan ensures robust coverage of all WSF API endpoints, utilities, and React Query hooks. The implementation follows JavaScript/TypeScript best practices and provides a solid foundation for maintaining code quality and reliability.

The testing strategy covers:
- ✅ Unit tests for all API functions
- ✅ React Query hook testing
- ✅ Data transformation utilities
- ✅ Error handling and edge cases
- ✅ Mock data and realistic scenarios
- ✅ Performance and reliability considerations

This plan provides a roadmap for implementing comprehensive unit tests that will catch bugs early, ensure code quality, and provide confidence in the WSF API integration. 
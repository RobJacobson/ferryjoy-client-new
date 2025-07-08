# WSF Shared Utilities

Shared utilities and infrastructure for all WSF API integrations.

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    WSF Shared Layer                             │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  │
│  │   Fetch         │  │   Config        │  │   Utils         │  │
│  │   Utilities     │  │   & Types       │  │   & Dates       │  │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘  │
├─────────────────────────────────────────────────────────────────┤
│                    Core Functions                               │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐            │
│  │   fetchWsf  │  │ fetchWsfArray│  │   fetchInternal│        │
│  │   (Single)  │  │   (Array)   │  │   (Core)    │            │
│  └─────────────┘  └─────────────┘  └─────────────┘            │
├─────────────────────────────────────────────────────────────────┤
│                    Platform Support                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐            │
│  │   Web       │  │   Native    │  │   JSONP     │            │
│  │   (fetch)   │  │   (fetch)   │  │   (fallback)│            │
│  └─────────────┘  └─────────────┘  └─────────────┘            │
└─────────────────────────────────────────────────────────────────┘
```

## Core Files

### 1. `fetch.ts` - Main Fetch Utilities
Primary fetch functions with type safety and parameter substitution.

#### `fetchWsf<T, E>()`
Fetches single objects or arrays from WSF APIs.

```typescript
// Single object
const vessel = await fetchWsf<VesselResponse>("vessels", "/vessel/{vesselID}", {
  vesselID: 123
});

// Array with path config
const vessels = await fetchWsf<VesselResponse[]>("vessels", {
  path: "/vessels",
  log: "info"
});
```

#### `fetchWsfArray<T, E>()`
Convenience function for fetching arrays, returns empty array on failure.

```typescript
const vessels = await fetchWsfArray<VesselResponse>("vessels", "/vessels");
// Returns VesselResponse[] or [] if fetch fails
```

#### Parameter Substitution
Automatic conversion of camelCase parameters to PascalCase for WSF API:

```typescript
// Input parameters (camelCase)
const params = {
  tripDate: new Date("2024-01-15"),
  routeID: 123,
  departingTerminalID: 456
};

// URL template
"/routes/{tripDate}/{routeID}/{departingTerminalID}"

// Result: "/routes/2024-01-15/123/456"
```

### 2. `config.ts` - Configuration
API configuration and type definitions.

```typescript
// API sources
export type WsfSource = "vessels" | "terminals" | "schedule";

// Base URLs
export const API_BASES = {
  vessels: "https://www.wsdot.wa.gov/ferries/api/vessels/rest",
  terminals: "https://www.wsdot.wa.gov/ferries/api/terminals/rest", 
  schedule: "https://www.wsdot.wa.gov/ferries/api/schedule/rest"
};

// Logging modes
export type LoggingMode = "debug" | "info" | "warn" | "error";
```

### 3. `fetchInternal.ts` - Core Fetch Logic
Internal fetch implementation with error handling and logging.

```typescript
export const fetchInternal = async <T>(
  url: string,
  endpoint: string,
  logMode?: LoggingMode
): Promise<T | null> => {
  // Handles network requests, error handling, and logging
};
```

### 4. `fetchJsonp.ts` - JSONP Implementation
Fallback for environments where CORS is restricted.

```typescript
export const fetchJsonp = <T>(url: string): Promise<T> => {
  // JSONP implementation for cross-origin requests
};
```

### 5. `fetchNative.ts` - Native Fetch
Platform-specific fetch implementation.

```typescript
export const fetchNative = async <T>(url: string): Promise<T> => {
  // Uses platform's native fetch implementation
};
```

### 6. `utils.ts` - Date Utilities
WSF-specific date parsing utilities.

```typescript
// Parse WSF date format: "/Date(1750981529000-0700)/"
export const parseWsfDate = (dateString: WsfDateString): Date => {
  const middle = dateString.slice(6, 19);
  const timestamp = parseInt(middle);
  return new Date(timestamp);
};
```

## Type System

### Path Templates
Strongly-typed parameter extraction from URL templates:

```typescript
// Extract parameter names from path
type ExtractParams<T extends string> =
  T extends `${string}{${infer Param}}${infer Rest}`
    ? Param | ExtractParams<Rest>
    : never;

// Example: "/routes/{tripDate}/{routeID}" -> "tripDate" | "routeID"
```

### Parameter Types
Automatic parameter object types from path templates:

```typescript
// From path template
type Params = ParamsFromPath<"/routes/{tripDate}/{routeID}">;
// Result: { tripDate: Date | string | number; routeID: Date | string | number; }
```

### Path Configuration
Type-safe path configuration with optional logging:

```typescript
type PathConfig<T extends string = string> = {
  path: T;
  log?: LoggingMode;
  params?: ParamsFromPath<T>;
};
```

## Usage Examples

### Basic Fetch
```typescript
import { fetchWsf } from './fetch';

// Fetch single vessel
const vessel = await fetchWsf<VesselResponse>("vessels", "/vessel/{vesselID}", {
  vesselID: 123
});

// Fetch with path config
const vessels = await fetchWsf<VesselResponse[]>("vessels", {
  path: "/vessels",
  log: "info"
});
```

### Array Fetch
```typescript
import { fetchWsfArray } from './fetch';

// Always returns array (empty if error)
const vessels = await fetchWsfArray<VesselResponse>("vessels", "/vessels");
```

### Date Handling
```typescript
import { parseWsfDate } from './utils';

// Parse WSF date format
const date = parseWsfDate("/Date(1750981529000-0700)/");
// Returns: Date object
```

### Error Handling
```typescript
import { fetchWsf } from './fetch';

try {
  const data = await fetchWsf<ResponseType>("source", "/endpoint");
  if (data) {
    // Handle success
  } else {
    // Handle null response (fetch failed)
  }
} catch (error) {
  // Handle unexpected errors
}
```

## Configuration

### Environment Variables
```bash
# Required for WSF API access
EXPO_PUBLIC_WSDOT_ACCESS_TOKEN=your_api_key_here
```

### Logging Configuration
```typescript
// Set log level per endpoint
const ROUTES = {
  endpoint: {
    path: "/endpoint" as const,
    log: "debug", // debug | info | warn | error
  },
} as const;
```

## Error Handling

### Network Errors
- Automatic retry with exponential backoff
- Graceful degradation when APIs are unavailable
- Clear error messages for debugging

### Type Errors
- Strong typing prevents runtime errors
- Type-safe parameter substitution
- Compile-time validation of API responses

### CORS Issues
- JSONP fallback for cross-origin requests
- Platform-specific fetch implementations
- Automatic fallback handling

## Performance

### Caching
- React Query provides memory caching
- Configurable cache invalidation
- Background refetching for fresh data

### Optimization
- Lazy loading of data
- Parameter validation at compile time
- Efficient URL template substitution

### Monitoring
- Request logging for debugging
- Performance metrics collection
- Error tracking and reporting

## Development

### Adding New API Sources

1. **Update Config**
```typescript
// Add to WsfSource type
export type WsfSource = "vessels" | "terminals" | "schedule" | "newSource";

// Add base URL
export const API_BASES = {
  // ... existing
  newSource: "https://api.example.com/rest"
};
```

2. **Use in API Functions**
```typescript
const data = await fetchWsf<ResponseType>("newSource", "/endpoint");
```

### Testing

```typescript
// Test fetch utilities
describe('fetchWsf', () => {
  it('should handle parameter substitution', async () => {
    const result = await fetchWsf<TestResponse>("test", "/test/{param}", {
      param: "value"
    });
    expect(result).toBeDefined();
  });
});

// Test date parsing
describe('parseWsfDate', () => {
  it('should parse WSF date format', () => {
    const date = parseWsfDate("/Date(1750981529000-0700)/");
    expect(date).toBeInstanceOf(Date);
  });
});
```

## Troubleshooting

### Common Issues

1. **CORS Errors**
   - Check if JSONP fallback is working
   - Verify API endpoints are accessible
   - Review network configuration

2. **Type Errors**
   - Ensure parameter names match path templates
   - Check that response types are correct
   - Verify all required types are imported

3. **Date Parsing Issues**
   - Verify WSF date format hasn't changed
   - Check timezone handling
   - Review date conversion logic

### Debug Mode

Enable debug logging to see detailed request/response information:

```typescript
const ROUTES = {
  endpoint: {
    path: "/endpoint" as const,
    log: "debug", // Enable debug logging
  },
} as const;
```

## Best Practices

1. **Always use typed parameters**: Leverage TypeScript for compile-time validation
2. **Handle null responses**: Check for null before using data
3. **Use appropriate log levels**: Debug for development, info for production
4. **Test error scenarios**: Ensure graceful handling of API failures
5. **Monitor performance**: Track request times and success rates 
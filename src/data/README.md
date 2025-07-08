# Data Layer Overview

The data layer provides a unified interface for accessing external data sources with type safety, caching, and real-time updates.

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Data Layer                               │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  │
│  │   Supabase      │  │   WSF APIs      │  │   Future APIs   │  │
│  │   (Database)    │  │   (External)    │  │   (Planned)     │  │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘  │
├─────────────────────────────────────────────────────────────────┤
│                    Shared Utilities                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐            │
│  │   Caching   │  │   Fetching  │  │   Types     │            │
│  │   Strategy  │  │   Utilities │  │   & Utils   │            │
│  └─────────────┘  └─────────────┘  └─────────────┘            │
├─────────────────────────────────────────────────────────────────┤
│                    React Query Layer                            │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐            │
│  │   Hooks     │  │   Caching   │  │   Real-time │            │
│  │   (use*)    │  │   (Memory)  │  │   Updates   │            │
│  └─────────────┘  └─────────────┘  └─────────────┘            │
└─────────────────────────────────────────────────────────────────┘
```

## Data Sources

### 1. Supabase (Database)
- **Purpose**: Primary database for user data, preferences, and application state
- **Features**: Real-time subscriptions, row-level security, PostgreSQL
- **Location**: `src/data/sources/supabase/`

### 2. Washington State Ferries (WSF) APIs
- **Purpose**: External ferry data including schedules, vessel positions, and terminal information
- **Features**: Multiple API endpoints, caching, type-safe fetching
- **Location**: `src/data/sources/wsf/`

## Data Flow

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Component │───▶│   Hook      │───▶│   API       │
│   (UI)      │    │   (use*)    │    │   Function  │
└─────────────┘    └─────────────┘    └─────────────┘
                           │                   │
                           ▼                   ▼
                   ┌─────────────┐    ┌─────────────┐
                   │   Cache     │    │   External  │
                   │   (Memory)  │    │   API       │
                   └─────────────┘    └─────────────┘
                           │                   │
                           ▼                   ▼
                   ┌─────────────┐    ┌─────────────┐
                   │   Storage   │    │   Response  │
                   │   (Disk)    │    │   (JSON)    │
                   └─────────────┘    └─────────────┘
```

## Key Features

### Type Safety
- Full TypeScript support with strict typing
- Domain models separate from API response types
- Converter functions for data transformation

### Caching Strategy
- **Memory Cache**: Fast access for frequently used data
- **Storage Cache**: Persistent cache for offline access
- **Cache Invalidation**: Automatic invalidation based on data freshness

### Real-time Updates
- Supabase real-time subscriptions
- Polling for external APIs where needed
- Optimistic updates for better UX

### Error Handling
- Graceful degradation when APIs are unavailable
- Retry logic with exponential backoff
- User-friendly error messages

## Usage Example

```typescript
// Using a data hook in a component
import { useRoutes } from '@/data/sources/wsf/schedule/routes';

function RouteList() {
  const { data: routes, isLoading, error } = useRoutes();
  
  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;
  
  return (
    <div>
      {routes?.map(route => (
        <RouteCard key={route.id} route={route} />
      ))}
    </div>
  );
}
```

## Directory Structure

```
src/data/
├── README.md                    # This file
├── contexts/                    # React contexts for data
├── sources/                     # Data source implementations
│   ├── supabase/               # Supabase database client
│   │   ├── README.md           # Supabase documentation
│   │   ├── client.ts           # Supabase client setup
│   │   ├── types.ts            # Database types
│   │   └── ...                 # Feature modules
│   └── wsf/                    # Washington State Ferries APIs
│       ├── README.md           # WSF overview
│       ├── shared/             # Shared utilities
│       │   └── README.md       # Shared utilities docs
│       ├── schedule/           # Schedule API (19 endpoints)
│       │   └── README.md       # Schedule API docs
│       ├── terminals/          # Terminals API
│       │   └── README.md       # Terminals API docs
│       └── vessels/            # Vessels API
│           └── README.md       # Vessels API docs
├── types/                      # Shared type definitions
└── utils/                      # Data utilities
```

## Best Practices

1. **Always use hooks**: Never call API functions directly from components
2. **Handle loading states**: Show appropriate loading indicators
3. **Error boundaries**: Wrap data-dependent components in error boundaries
4. **Type safety**: Use TypeScript for all data operations
5. **Caching**: Leverage React Query's caching capabilities
6. **Real-time**: Use real-time subscriptions when available

## Contributing

When adding new data sources:

1. Create a new directory under `sources/`
2. Follow the established pattern: `types.ts`, `api.ts`, `converter.ts`, `hook.ts`
3. Add comprehensive TypeScript types
4. Include error handling and loading states
5. Document the API in a README file
6. Add tests for the new functionality
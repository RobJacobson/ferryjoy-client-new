# Convex Functions Directory

This directory contains all Convex functions organized by domain and purpose.

## Structure

```
src/data/convex/
├── _generated/           # Auto-generated files (don't edit)
├── schema.ts            # Database schema definition
├── utils.ts             # Shared utilities and helpers
├── 
├── functions/           # Group functions by domain
│   ├── vessels/
│   │   ├── index.ts     # Export all vessel functions
│   │   ├── queries.ts   # Vessel query functions
│   │   ├── mutations.ts # Vessel mutation functions
│   │   ├── types.ts     # Vessel-specific types
│   │   └── legacy.ts    # Old vessel functions (deprecated)
│   ├── terminals/
│   │   ├── index.ts
│   │   ├── queries.ts
│   │   ├── mutations.ts
│   │   └── types.ts
│   └── users/
│       ├── index.ts
│       ├── preferences.ts
│       └── types.ts
├── 
├── api/                 # External API integrations
│   ├── wsf/
│   │   ├── vessels.ts   # WSF vessel API functions
│   │   ├── cache.ts     # WSF cache functions
│   │   └── index.ts
│   └── wsdot/
│       ├── alerts.ts
│       └── traffic.ts
└── 
└── vesselLocations.ts   # DEPRECATED - Use new structure
```

## Usage

### Vessel Functions

```typescript
import { api } from "./_generated/api";

// Query functions
const vessels = await convex.query(api.functions.vessels.getAll);
const vessel = await convex.query(api.functions.vessels.getByVesselId, { vesselId: 1 });
const activeVessels = await convex.query(api.functions.vessels.getActiveVessels);

// Mutation functions
await convex.mutation(api.functions.vessels.insert, vesselData);
await convex.mutation(api.functions.vessels.update, { id, ...data });
await convex.mutation(api.functions.vessels.remove, { id });
```

### API Integration

```typescript
import { fetchAndStoreVesselLocations } from "./api/wsf/vessels";

// Fetch and store vessel locations from WSF API
await fetchAndStoreVesselLocations();
```

### Utilities

```typescript
import { toConvex, fromConvex } from "./utils";

// Convert between API format and Convex format
const convexData = toConvex(apiData);
const apiData = fromConvex(convexData);
```

## Adding New Functions

1. **Create domain folder**: `functions/your-domain/`
2. **Add types**: `types.ts` with argument validators
3. **Add queries**: `queries.ts` for read operations
4. **Add mutations**: `mutations.ts` for write operations
5. **Export from index**: `index.ts` to expose functions
6. **Update main index**: Add to `functions/index.ts`

## Best Practices

- **Domain-driven**: Group functions by business domain
- **Separation of concerns**: Keep queries and mutations separate
- **Type safety**: Use shared types for arguments
- **Reusable utilities**: Common functions in `utils.ts`
- **Clean imports**: Use index files for clean exports

# Drizzle ORM + Supabase Setup

This directory contains the Drizzle ORM configuration for connecting to your Supabase PostgreSQL database.

## What is Drizzle ORM?

Drizzle ORM is a modern TypeScript ORM that provides:
- **Type-safe database queries** with full TypeScript support
- **Schema-first approach** where you define your database structure in code
- **Lightweight and performant** compared to other ORMs
- **Excellent developer experience** with autocomplete and type checking

## Setup Instructions

### 1. Get Your Supabase Connection String

1. Go to your Supabase project dashboard
2. Navigate to Settings → Database
3. Copy the connection string from the "Connection string" section
4. Replace `[YOUR-PASSWORD]` with your database password

### 2. Set Environment Variables

Add your database connection string to your `.env` file:

```bash
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres
```

### 3. Generate and Run Migrations

```bash
# Generate migration files based on your schema
bun run db:generate

# Push the schema to your database (for development)
bun run db:push

# Or run migrations (for production)
bun run db:migrate
```

### 4. Open Drizzle Studio (Optional)

```bash
bun run db:studio
```

This opens a web interface where you can view and edit your database data.

## Database Schema

The schema is defined in `schema.ts` and includes:

- **Users**: User accounts and profiles
- **Vessels**: Ferry vessel information and current positions
- **Vessel Positions**: Historical position data for vessels
- **Trips**: Trip information and status

## Usage Examples

### Basic Database Operations

```typescript
import { db } from '@/db';
import { vessels, users } from '@/db/schema';
import { eq } from 'drizzle-orm';

// Insert a new vessel
const newVessel = await db.insert(vessels).values({
  name: 'MV Cathlamet',
  vesselId: 'CATHLAMET',
  inService: true,
  latitude: 47.6062,
  longitude: -122.3321,
}).returning();

// Query vessels
const allVessels = await db.select().from(vessels);
const inServiceVessels = await db.select().from(vessels).where(eq(vessels.inService, true));
```

### Using Pre-built Operations

```typescript
import { vesselOperations, userOperations } from '@/db/operations';

// Create a new user
const user = await userOperations.create({
  email: 'user@example.com',
  name: 'John Doe',
});

// Update vessel position
await vesselOperations.updatePosition('CATHLAMET', {
  latitude: 47.6062,
  longitude: -122.3321,
  heading: 180.5,
  speed: 12.3,
  inService: true,
});
```

## Available Scripts

- `bun run db:generate` - Generate migration files from schema changes
- `bun run db:push` - Push schema changes directly to database (development)
- `bun run db:migrate` - Run pending migrations (production)
- `bun run db:studio` - Open Drizzle Studio web interface
- `bun run db:drop` - Drop all tables (⚠️ destructive)

## Type Safety

Drizzle provides full TypeScript support. The schema automatically generates types:

```typescript
import type { Vessel, NewVessel } from '@/db/schema';

// These are fully typed
const vessel: Vessel = {
  id: 1,
  name: 'MV Cathlamet',
  vesselId: 'CATHLAMET',
  // ... other properties
};

const newVessel: NewVessel = {
  name: 'MV Cathlamet',
  vesselId: 'CATHLAMET',
  // ... other properties (id is optional for inserts)
};
```

## Best Practices

1. **Always use the pre-built operations** in `operations.ts` for common tasks
2. **Use transactions** for operations that modify multiple tables
3. **Handle errors gracefully** - database operations can fail
4. **Use prepared statements** (Drizzle does this automatically)
5. **Keep migrations in version control** - they represent your database evolution

## Troubleshooting

### Connection Issues
- Verify your `DATABASE_URL` is correct
- Check that your Supabase database is running
- Ensure your IP is whitelisted in Supabase (if using IP restrictions)

### Migration Issues
- Always backup your database before running migrations
- Test migrations on a development database first
- Use `db:push` for development, `db:migrate` for production

### Type Issues
- Run `bun run typecheck` to verify TypeScript types
- Make sure you're importing types from the schema file
- Check that your schema changes are reflected in generated types 
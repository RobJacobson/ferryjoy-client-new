# Data Layer Specifications

This document explains the internal functioning and data flow of the data model in the FerryJoy application, covering:
- The Washington State Ferries (WSF) API
- Supabase (as a data store for WSF data)
- React Query (for data fetching, caching, and state management)

---

## 1. High-Level Data Flow

```
+-------------------+        +----------------+        +-------------------+        +-------------------+
|                   |        |                |        |                   |        |                   |
|  WSF API (Remote) +------->+  Supabase DB   +------->+  React Query      +------->+  React Components |
|                   |        |  (Cloud SQL)   |        |  (Client Cache)   |        |  (UI/UX)          |
+-------------------+        +----------------+        +-------------------+        +-------------------+
        |                          ^
        |                          |
        |      (ETL/Sync jobs)     |
        +--------------------------+
```

- **WSF API**: Provides real-time ferry and vessel data (public endpoint)
- **Supabase**: Stores a copy of WSF data for historical queries, analytics, and offline access
- **React Query**: Handles fetching, caching, and background updates for both WSF and Supabase data
- **React Components**: Consume hooks to display live and historical data

---

## 2. WSF API Integration

- **Purpose**: Fetches real-time vessel locations, verbose vessel info, and cache flush dates
- **Implementation**: Each WSF feature has its own folder (e.g., `vesselLocations/`, `vesselVerbose/`)
- **Files**:
  - `api.ts`: Fetches data from the WSF API
  - `converter.ts`: Maps API responses to domain models
  - `hook.ts`: Provides a React Query hook for components

**Example Data Flow:**
```
+-------------------+      +-------------------+      +-------------------+
|  WSF API          | ---> |  api.ts           | ---> |  converter.ts     |
|  (REST endpoint)  |      |  (fetch data)     |      |  (map/transform)  |
+-------------------+      +-------------------+      +-------------------+
                                                        |
                                                        v
                                                +-------------------+
                                                |  hook.ts          |
                                                |  (React Query)    |
                                                +-------------------+
                                                        |
                                                        v
                                                +-------------------+
                                                |  Component        |
                                                +-------------------+
```

---

## 3. Supabase Integration

- **Purpose**: Stores historical and real-time ferry data, supports analytics, and enables offline queries
- **Implementation**: Each Supabase feature (e.g., `vesselTrips/`) mirrors the WSF structure
- **Files**:
  - `api.ts`: Queries Supabase using the client
  - `converter.ts`: Maps DB rows to domain models
  - `hook.ts`: Provides a React hook for consuming data

**Example Data Flow:**
```
+-------------------+      +-------------------+      +-------------------+
|  Supabase DB      | ---> |  api.ts           | ---> |  converter.ts     |
|  (Postgres)       |      |  (query)          |      |  (map/transform)  |
+-------------------+      +-------------------+      +-------------------+
                                                        |
                                                        v
                                                +-------------------+
                                                |  hook.ts          |
                                                |  (React state)    |
                                                +-------------------+
                                                        |
                                                        v
                                                +-------------------+
                                                |  Component        |
                                                +-------------------+
```

---

## 4. React Query & Data Synchronization

- **Purpose**: Provides a unified, cache-first data layer for both WSF and Supabase data
- **How it works**:
  - Hooks in each feature folder use React Query to fetch and cache data
  - React Query automatically refetches data in the background and on window focus
  - Components subscribe to data via hooks and re-render on updates

**React Query Data Flow:**
```
+-------------------+
|  hook.ts          |
|  (useQuery)       |
+-------------------+
        |
        v
+-------------------+
|  React Query      |
|  (cache/store)    |
+-------------------+
        |
        v
+-------------------+
|  Component        |
+-------------------+
```

---

## 5. Data Synchronization: WSF → Supabase

- **How data gets from WSF to Supabase:**
  - A backend job (not shown in this repo) periodically fetches WSF data and inserts/updates it in Supabase
  - This enables historical queries, analytics, and offline support

**Synchronization Flow:**
```
+-------------------+      +-------------------+
|  WSF API          | ---> |  Backend Job      |
|  (live data)      |      |  (ETL/Sync)       |
+-------------------+      +-------------------+
                                |
                                v
                        +-------------------+
                        |  Supabase DB      |
                        +-------------------+
```

---

## 6. Summary Table

| Layer         | Source      | Fetching         | Transformation | Consumption      |
|---------------|-------------|------------------|----------------|-----------------|
| WSF API       | Remote API  | api.ts           | converter.ts   | hook.ts         |
| Supabase      | Cloud DB    | api.ts           | converter.ts   | hook.ts         |
| React Query   | Client      | hook.ts/useQuery | n/a            | Component       |

---

## 7. Key Points
- **Only types and hooks are exported** from each feature folder; API and converter files are internal
- **React Query** is the single source of truth for all data in the UI
- **Supabase** acts as a persistent, queryable store for WSF data
- **WSF API** provides the freshest real-time data, but Supabase is used for history/analytics
- **Data flow is always: Source → API → Converter → Hook → Component**

---

This architecture ensures a clean, maintainable, and scalable data layer for the FerryJoy application. 
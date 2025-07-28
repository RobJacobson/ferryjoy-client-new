# Data Layer Specifications

This document explains the internal functioning and data flow of the data model in the FerryJoy application, covering:
- The Washington State Ferries (WSF) API
- React Query (for data fetching, caching, and state management)

---

## 1. High-Level Data Flow

```
+-------------------+        +-------------------+        +-------------------+
|                   |        |                   |        |                   |
|  WSF API (Remote) +------->+  React Query      +------->+  React Components |
|                   |        |  (Client Cache)   |        |  (UI/UX)          |
+-------------------+        +-------------------+        +-------------------+
```

- **WSF API**: Provides real-time ferry and vessel data (public endpoint)
- **React Query**: Handles fetching, caching, and background updates for WSF data
- **React Components**: Consume hooks to display live data

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

## 3. React Query & Data Synchronization

- **Purpose**: Provides a unified, cache-first data layer for WSF data
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

## 4. Summary Table

| Layer         | Source      | Fetching         | Transformation | Consumption      |
|---------------|-------------|------------------|----------------|-----------------|
| WSF API       | Remote API  | api.ts           | converter.ts   | hook.ts         |
| React Query   | Client      | hook.ts/useQuery | n/a            | Component       |

---

## 5. Key Points
- **Only types and hooks are exported** from each feature folder; API and converter files are internal
- **React Query** is the single source of truth for all data in the UI
- **WSF API** provides real-time ferry and vessel data
- **Data flow is always: Source → API → Converter → Hook → Component**

---

This architecture ensures a clean, maintainable, and scalable data layer for the FerryJoy application. 
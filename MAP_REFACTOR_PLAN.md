# Map Architecture Refactor Plan

## Overview

This document outlines the refactor plan to move from the current shared codebase pattern with complex adapters to a co-located feature-based architecture with targeted translation layers.

## Current Architecture

The current map architecture uses a shared codebase pattern with Metro bundler's platform-specific file resolution:

### Current Structure
```
src/shared/mapbox/
├── MapView/
│   ├── MapView.tsx              # Native implementation (@rnmapbox/maps)
│   ├── MapView.web.tsx          # Web implementation (react-map-gl/mapbox)
│   ├── types.ts                 # Shared types
│   └── index.tsx                # Platform-specific exports
├── CircleLayer/
│   ├── CircleLayer.tsx          # Native implementation
│   ├── CircleLayer.web.tsx      # Web implementation with property transformations
│   ├── types.ts                 # Shared types
│   └── index.ts                 # Platform-specific exports
├── LineLayer/
│   ├── LineLayer.tsx            # Native implementation
│   ├── LineLayer.web.tsx        # Web implementation with property transformations
│   ├── types.ts                 # Shared types
│   └── index.ts                 # Platform-specific exports
├── ShapeSource/
│   ├── ShapeSource.tsx          # Native implementation
│   ├── ShapeSource.web.tsx      # Web implementation
│   ├── types.ts                 # Shared types
│   └── index.ts                 # Platform-specific exports
└── types.ts                     # Shared types across all components
```

### How It Works
1. **Metro Resolution**: Metro automatically selects `.web.tsx` for web, `.tsx` for native
2. **Shared Interface**: All components use the same props and types
3. **Platform Adapters**: Web implementations transform props to match react-map-gl API
4. **Feature Components**: Components like `VesselLayer` use the shared interface

### Feature Components Structure
```
src/features/map/components/
├── MainMap.tsx                   # Main map container using shared mapbox components
├── VesselLayer.tsx               # Vessel visualization using CircleLayer, SymbolLayer
├── RoutesLayer.tsx               # Route lines using LineLayer
├── VesselLines.tsx               # Vessel track lines using LineLayer
├── TerminalLayer.tsx             # Terminal markers using CircleLayer
├── VesselEtaMarkers.tsx          # ETA markers using MarkerView
├── BoundingBoxLayer.tsx          # Bounding box visualization
├── TerminalOverlay.tsx           # Terminal information overlay
├── DebugPanel.tsx                # Debug information panel
├── VesselMarkers/                # Vessel marker components
│   ├── index.ts
│   ├── VesselMarkers.tsx
│   ├── vesselMarkerConstants.ts
│   └── vesselMarkerUtils.ts
└── callout/                      # Map callout components
    └── temp.css
```

### Feature Components Usage
- **MainMap**: Orchestrates all map components and handles layout
- **VesselLayer**: Renders vessel positions with circles and direction indicators
- **RoutesLayer**: Displays ferry routes as styled lines
- **VesselLines**: Shows vessel tracks and paths
- **TerminalLayer**: Renders terminal locations and information
- **VesselEtaMarkers**: Displays ETA information for vessels
- **DebugPanel**: Shows debug information and controls

These feature components use the abstract mapbox components (`CircleLayer`, `LineLayer`, etc.) from `src/shared/mapbox/` to build concrete map features.

### Current Issues

1. **Complex Adapter Pattern**: Each component requires platform-specific transformation logic
2. **API Mismatches**: Different underlying libraries have different APIs requiring extensive translation
3. **Debugging Difficulty**: Platform-specific issues are hard to isolate
4. **Performance Overhead**: Transformation layers add runtime cost
5. **Maintenance Burden**: Two implementations per component to maintain
6. **Abstract Components**: Generic components like `CircleLayer` don't represent concrete features
7. **Property Transformation**: Web adapters require `filterUndefined` and camelCase → kebab-case conversion

## New Architecture

### Component Architecture

#### Map Component
The `Map` component is a low-level, platform-specific implementation that handles:
- Direct integration with `@rnmapbox/maps` (native) or `react-map-gl/mapbox` (web)
- Camera state management and coordinate handling
- Basic map rendering and event handling
- Platform-specific optimizations

#### MainMap Component (Future)
The `MainMap` component will be a high-level wrapper that provides:
- **Content Management**: Layers, markers, and other map content
- **Business Logic**: Vessel data, routes, terminals integration
- **State Coordination**: Context providers and data flow
- **User Interactions**: Gestures, selections, and UI controls

This separation of concerns allows:
- **Map**: Focus on core map functionality and platform differences
- **MainMap**: Focus on application-specific features and content
- **Reusability**: Map can be used independently for different use cases
- **Testability**: Each component can be tested in isolation

### Native-First Design
The new architecture uses **native formats as the canonical standard** throughout the application:

- **Camera State**: Uses native `CameraState` type with `centerCoordinate`, `zoomLevel`, `heading`, `pitch`
- **Coordinates**: Uses `[longitude, latitude]` arrays (native format) as standard
- **Translation**: Only translates from native to web when absolutely necessary
- **Types**: Uses TypeScript types instead of interfaces for better performance
- **API Compatibility**: Coordinate types match existing VesselPosition API (`Longitude`, `Latitude` properties)

### Structure
```
src/features/refactored-map/
├── components/
│   ├── RoutesLayer/
│   │   ├── RoutesLayer.tsx          # Native implementation
│   │   ├── RoutesLayer.web.tsx      # Web implementation  
│   │   ├── shared.ts                # Shared logic, constants, types
│   │   └── index.ts                 # Platform-specific exports
│   ├── VesselLayer/
│   │   ├── VesselLayer.tsx          # Native implementation
│   │   ├── VesselLayer.web.tsx      # Web implementation
│   │   ├── shared.ts                # Shared vessel styling, constants
│   │   └── index.ts                 # Platform-specific exports
│   └── Map/
│       ├── Map.tsx                  # Native implementation
│       ├── Map.web.tsx              # Web implementation
│       ├── shared.ts                # Shared layout logic
│       └── index.ts                 # Platform-specific exports
├── utils/
│   ├── types.ts                     # All type definitions
│   ├── propTranslation.ts           # Property format conversion
│   ├── cameraTranslation.ts         # Camera state conversion
│   ├── mapbox.ts                    # Mapbox utilities and constants
│   └── index.ts                     # Main exports
```
│   ├── VesselLines/
│   │   ├── VesselLines.tsx          # Native implementation
│   │   ├── VesselLines.web.tsx      # Web implementation
│   │   ├── shared.ts                # Shared vessel line styling
│   │   └── index.ts                 # Platform-specific exports
│   ├── TerminalLayer/
│   │   ├── TerminalLayer.tsx        # Native implementation
│   │   ├── TerminalLayer.web.tsx    # Web implementation
│   │   ├── shared.ts                # Shared terminal styling
│   │   └── index.ts                 # Platform-specific exports
│   ├── VesselEtaMarkers/
│   │   ├── VesselEtaMarkers.tsx     # Native implementation
│   │   ├── VesselEtaMarkers.web.tsx # Web implementation
│   │   ├── shared.ts                # Shared ETA marker styling
│   │   └── index.ts                 # Platform-specific exports
│   └── MainMap/
│       ├── MainMap.tsx              # Native implementation
│       ├── MainMap.web.tsx          # Web implementation
│       ├── shared.ts                # Shared map layout logic
│       └── index.ts                 # Platform-specific exports
├── utils/
│   ├── translation.ts                # Targeted translation functions
│   └── mapbox.ts                    # Enhanced mapbox utilities
└── index.ts                         # Main exports
```

### Key Principles

1. **Co-located Platform Implementations**: Native and web versions live together
2. **Targeted Translation**: Only translate what's needed (camelCase → kebab-case, etc.)
3. **Shared Logic**: Common constants, types, and utilities in `shared.ts`
4. **Metro Resolution**: Leverage Metro's platform-specific file resolution
5. **No Complex Adapters**: Simple translation functions instead of full adapter pattern
6. **Consistent Import Naming**: Use `MapboxRN` for native and `MapboxGL` for web imports

## Import Naming Convention

### Mapbox Library Imports
To maintain clear distinction between platforms and improve code readability:

**Native Platform (@rnmapbox/maps):**
```typescript
import MapboxRN from "@rnmapbox/maps";
<MapboxRN.ShapeSource> <MapboxRN.LineLayer> <MapboxRN.CircleLayer>
```

**Web Platform (react-map-gl/mapbox):**
```typescript
import MapboxGL from "react-map-gl/mapbox";
<MapboxGL.Source> <MapboxGL.Layer> <MapboxGL>
```

### Import Patterns

**Main Map Component (MapComponent):**
```typescript
// Native
import MapboxRN from "@rnmapbox/maps";
<MapboxRN.MapView> <MapboxRN.Camera>

// Web  
import MapboxGL from "react-map-gl/mapbox";
<MapboxGL>
```

**Layer Components (RoutesLayer, VesselLayer):**
```typescript
// Native
import MapboxRN from "@rnmapbox/maps";
<MapboxRN.ShapeSource> <MapboxRN.LineLayer> <MapboxRN.CircleLayer>

// Web
import { Layer, Source } from "react-map-gl/mapbox";
<Source> <Layer>
```

### Benefits
- **Clear Platform Intent**: `MapboxRN` vs `MapboxGL` immediately indicates platform
- **Consistent Namespacing**: All map components use the same prefix pattern
- **Easy Refactoring**: Simple import change when moving between platforms
- **Better IDE Support**: Autocomplete shows platform-specific components

## Platform-Specific Challenges

### Camera Handling

The two platforms handle camera controls very differently:

#### Native (@rnmapbox/maps)
- Uses `<Mapbox.Camera>` component with imperative methods
- Camera is a child component of MapView
- Methods: `setCamera()`, `flyTo()`, `fitBounds()`
- Props: `centerCoordinate`, `zoomLevel`, `heading`, `pitch`

#### Web (react-map-gl/mapbox)
- Uses `viewState` and `onMove` callbacks
- Camera state is managed in React state
- Methods: `flyTo()`, `fitBounds()` on MapRef
- Props: `longitude`, `latitude`, `zoom`, `bearing`, `pitch`

#### Strategy
- **Native**: Use `<Mapbox.Camera>` component with imperative refs
- **Web**: Use `viewState` state management with `onMove` callbacks
- **Shared Logic**: Extract camera positioning logic to `shared.ts`
- **Translation**: Convert between coordinate formats and prop names

### Translation Layer

### `src/features/refactored-map/utils/translation.ts`

```typescript
/**
 * Convert camelCase property names to kebab-case for Mapbox GL JS
 * Example: circleColor → circle-color
 */
export const camelToKebab = (obj: Record<string, any>): Record<string, any> => {
  const converted: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    const kebabKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
    converted[kebabKey] = value;
  }
  return converted;
};

/**
 * Convert specific prop names that differ between platforms
 */
export const translateProps = (props: Record<string, any>): Record<string, any> => {
  const translations: Record<string, string> = {
    sourceID: 'source', // Native: sourceID, Web: source
    sourceLayerID: 'source-layer', // Native: sourceLayerID, Web: source-layer
  };
  
  const converted: Record<string, any> = {};
  for (const [key, value] of Object.entries(props)) {
    const translatedKey = translations[key] || key;
    converted[translatedKey] = value;
  }
  return converted;
};

/**
 * Filter out undefined values from style objects for Mapbox GL JS compatibility
 */
export const filterUndefined = (obj: Record<string, any>): Record<string, any> => {
  const filtered: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      filtered[key] = value;
    }
  }
  return filtered;
};

/**
 * Convert style object for web platform with all necessary translations
 */
export const toWebStyle = (style: Record<string, any>): Record<string, any> => {
  return filterUndefined(camelToKebab(style));
};

/**
 * Convert props for web platform
 */
export const toWebProps = (props: Record<string, any>): Record<string, any> => {
  return filterUndefined(translateProps(props));
};

/**
 * Convert camera props from native to web format
 */
export const toWebCameraProps = (props: Record<string, any>): Record<string, any> => {
  const translations: Record<string, string> = {
    centerCoordinate: 'center', // Native: centerCoordinate, Web: center
    zoomLevel: 'zoom', // Native: zoomLevel, Web: zoom
    heading: 'bearing', // Native: heading, Web: bearing
  };
  
  const converted: Record<string, any> = {};
  for (const [key, value] of Object.entries(props)) {
    const translatedKey = translations[key] || key;
    converted[translatedKey] = value;
  }
  return converted;
};

/**
 * Coordinate type definitions
 */
export type WebCoordinates = {
  longitude: number;
  latitude: number;
};

export type NativeCoordinates = [number, number];

/**
 * Convert coordinate format from native to web
 * Native: [longitude, latitude] as array
 * Web: { longitude, latitude } as object
 */
export const toWebCoordinates = (coords: NativeCoordinates): WebCoordinates => ({
  longitude: coords[0],
  latitude: coords[1],
});

## Implementation Steps

### Phase 1: Foundation (Week 1) ✅ COMPLETED

- [x] **Create new directory structure**
  - [x] Create `src/features/refactored-map/` directory
  - [x] Create `components/` subdirectory
  - [x] Create `utils/` subdirectory

- [x] **Set up translation utilities**
  - [x] Create `src/features/refactored-map/utils/types.ts` (all type definitions)
  - [x] Create `src/features/refactored-map/utils/propTranslation.ts` (property format conversion)
  - [x] Create `src/features/refactored-map/utils/cameraTranslation.ts` (camera state conversion)
  - [x] Create `src/features/refactored-map/utils/mapbox.ts` (enhanced version)
  - [x] Test translation functions with unit tests

### Phase 2: MainMap Component (Week 2) ✅ COMPLETED

- [x] **Create MainMap directory structure**
  - [x] Create `src/features/refactored-map/components/MainMap/`
  - [x] Create `shared.ts` for shared layout logic
  - [x] Create `index.ts` for exports

- [x] **MainMap native implementation**
  - [x] Create `MainMap.tsx` with Mapbox.Camera
  - [x] Implement camera coordinate translation utilities
  - [x] Test native functionality

- [x] **MainMap web implementation**
  - [x] Create `MainMap.web.tsx` with viewState management
  - [x] Test web functionality
  - [x] Verify camera behavior on both platforms

- [x] **Camera handling implementation**
  - [x] Create camera translation utilities in `translation.ts`
  - [x] Test coordinate format conversions
  - [x] Test camera prop translations

### Phase 3: RoutesLayer Component (Week 3) ✅ COMPLETED

- [x] **Create RoutesLayer directory structure**
  - [x] Create `src/features/refactored-map/components/RoutesLayer/`
  - [x] Create `shared.ts` for route styling constants
  - [x] Create `index.ts` for exports

- [x] **RoutesLayer native implementation**
  - [x] Create `RoutesLayer.tsx` using @rnmapbox/maps directly
  - [x] Extract route styling constants to `shared.ts`
  - [x] Test native functionality

- [x] **RoutesLayer web implementation**
  - [x] Create `RoutesLayer.web.tsx` using react-map-gl/mapbox
  - [x] Use translation utilities for style conversion
  - [x] Test web functionality

- [x] **Integration testing**
  - [x] Test RoutesLayer with MainMap on both platforms
  - [x] Verify performance and functionality

### Phase 4: VesselLayer Component (Week 4) ✅ COMPLETED

- [x] **Create VesselLayer directory structure**
  - [x] Create `src/features/refactored-map/components/VesselLayer/`
  - [x] Create `shared.ts` for vessel styling constants
  - [x] Create `index.ts` for exports

- [x] **VesselLayer native implementation**
  - [x] Create `VesselLayer.tsx` using @rnmapbox/maps directly
  - [x] Extract vessel styling constants to `shared.ts`
  - [x] Test native functionality

- [x] **VesselLayer web implementation**
  - [x] Create `VesselLayer.web.tsx` using react-map-gl/mapbox
  - [x] Use translation utilities for style conversion
  - [x] Test web functionality

- [x] **Integration testing**
  - [x] Test VesselLayer with MainMap and RoutesLayer on both platforms
  - [x] Verify performance and functionality

### Phase 5: VesselLines Component (Week 5)

- [ ] **Create VesselLines directory structure**
  - [ ] Create `src/features/refactored-map/components/VesselLines/`
  - [ ] Create `shared.ts` for vessel line styling constants
  - [ ] Create `index.ts` for exports

- [ ] **VesselLines native implementation**
  - [ ] Create `VesselLines.tsx` using @rnmapbox/maps directly
  - [ ] Extract vessel line styling constants to `shared.ts`
  - [ ] Test native functionality

- [ ] **VesselLines web implementation**
  - [ ] Create `VesselLines.web.tsx` using react-map-gl/mapbox
  - [ ] Use translation utilities for style conversion
  - [ ] Test web functionality

- [ ] **Integration testing**
  - [ ] Test VesselLines with all previous components on both platforms
  - [ ] Verify performance and functionality

### Phase 6: Additional Components (Week 6)

- [ ] **TerminalLayer refactor**
  - [ ] Create `src/features/refactored-map/components/TerminalLayer/`
  - [ ] Extract terminal styling constants to `shared.ts`
  - [ ] Create native implementation (`TerminalLayer.tsx`)
  - [ ] Create web implementation (`TerminalLayer.web.tsx`)
  - [ ] Test both platforms

- [ ] **VesselEtaMarkers refactor**
  - [ ] Create `src/features/refactored-map/components/VesselEtaMarkers/`
  - [ ] Extract ETA marker styling constants to `shared.ts`
  - [ ] Create native implementation (`VesselEtaMarkers.tsx`)
  - [ ] Create web implementation (`VesselEtaMarkers.web.tsx`)
  - [ ] Test both platforms

### Phase 7: Migration and Cleanup (Week 7)

- [ ] **Update imports**
  - [ ] Update `src/features/map/components/MainMap.tsx` to use new components
  - [ ] Update other feature components to use new map components
  - [ ] Test all functionality still works

- [ ] **Documentation**
  - [ ] Update README files for new components
  - [ ] Document translation patterns
  - [ ] Create migration guide for future components

- [ ] **Performance validation**
  - [ ] Compare bundle sizes
  - [ ] Measure render performance
  - [ ] Validate memory usage

## Example Implementation

### RoutesLayer/shared.ts
```typescript
export const ROUTE_COLORS = {
  LIME_300: "rgb(190, 242, 100)",
  LIME_700: "rgb(77, 124, 15)",
} as const;

export const ROUTE_STYLES = {
  lineColor: "white",
  lineDasharray: [
    "step",
    ["zoom"],
    [1000, 0], // Default: solid line
    8,
    [0, 2], // At zoom 8+: small dashes
    12,
    [0, 4], // At zoom 12+: medium dashes
    16,
    [0, 6], // At zoom 16+: large dashes
  ],
  lineOpacity: [
    "case",
    [
      "any",
      ["==", ["get", "OBJECTID"], 30],
      ["==", ["get", "OBJECTID"], 31],
    ],
    0.1, // 10% opacity for routes with OBJECTID 30 or 31
    0.5, // 50% opacity for other routes
  ],
  lineWidth: ["interpolate", ["linear"], ["zoom"], 0, 0, 21, 8],
  lineCap: "round",
} as const;

export const SOURCE_ID = "routes-source";
```

### RoutesLayer/RoutesLayer.tsx (Native)
```typescript
import MapboxRN from "@rnmapbox/maps";
import { ROUTES_DATA, ROUTE_LINE_PAINT, SOURCE_ID, LAYER_ID } from "./shared";

export const RoutesLayer = () => {
  return (
    <MapboxRN.ShapeSource id={SOURCE_ID} shape={ROUTES_DATA}>
      <MapboxRN.LineLayer
        id={LAYER_ID}
        sourceID={SOURCE_ID}
        style={ROUTE_LINE_PAINT}
      />
    </MapboxRN.ShapeSource>
  );
};
```

### RoutesLayer/RoutesLayer.web.tsx (Web)
```typescript
import { Layer, Source } from "react-map-gl/mapbox";
import { toWebStyleProps } from "@/features/refactored-map/utils/propTranslation";
import { ROUTES_DATA, ROUTE_LINE_PAINT, SOURCE_ID, LAYER_ID } from "./shared";

export const RoutesLayer = () => {
  return (
    <Source id={SOURCE_ID} type="geojson" data={ROUTES_DATA}>
      <Layer
        id={LAYER_ID}
        type="line"
        paint={toWebStyleProps(ROUTE_LINE_PAINT) as Record<string, MapboxExpression>}
        layout={{
          "line-join": "round",
          "line-cap": "round",
        }}
      />
    </Source>
  );
};
```

### RoutesLayer/index.ts
```typescript
export { RoutesLayer } from "./RoutesLayer";
```

## Benefits

1. **Reduced Complexity**: No more complex adapter patterns
2. **Better Performance**: No runtime transformation overhead
3. **Easier Debugging**: Platform-specific issues are isolated
4. **Shared Logic**: Common constants and types are co-located
5. **Platform Optimization**: Each platform can be optimized independently
6. **Maintainability**: Clear structure and separation of concerns

## Success Criteria

- [ ] All map components work on both native and web
- [ ] Performance is equal to or better than current implementation
- [ ] Bundle size is reduced or equal
- [ ] Code is more maintainable and easier to debug
- [ ] New components can be added following the same pattern
- [ ] Documentation is clear and complete

## Notes

- **No deletion of existing files**: All new code goes in `@/features/refactored-map`
- **Gradual migration**: Test new components thoroughly before switching
- **Backward compatibility**: Keep existing components working during transition
- **Performance monitoring**: Measure impact on both platforms

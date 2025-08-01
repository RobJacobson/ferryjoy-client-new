# FerryJoy Client Specification

## Overview

FerryJoy Client is a React Native/Expo application that provides real-time tracking and information for Washington State Ferries. The application features an interactive map interface, comprehensive schedule data, and real-time vessel tracking capabilities.

## Architecture

### Core Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   UI Layer      │    │   Data Layer    │    │   API Layer     │
│   (Components)  │◄──►│   (Hooks/Query) │◄──►│   (WSF APIs)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Map Layer     │    │   Cache Layer   │    │   Transform     │
│   (MapLibre)    │    │   (React Query) │    │   (Date/Data)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Technology Stack

- **Frontend**: React Native 0.79.5 + Expo 53.0.9
- **Language**: TypeScript 5.8.3
- **Styling**: NativeWind 4.1.23 + Tailwind CSS 3.3.5
- **Navigation**: Expo Router 5.1.3
- **Maps**: MapLibre GL JS + @rnmapbox/maps 10.1.39
- **State Management**: Zustand
- **Data Fetching**: React Query (TanStack Query)

- **Package Manager**: Bun
- **Linting**: Biome 2.0.6

## Data Layer Architecture

### WSF API Integration

The application integrates with three main WSF API endpoints:

#### 1. Vessels API (`/vessels`)
- **Base URL**: `https://www.wsdot.wa.gov/ferries/api/vessels/rest`
- **Endpoints**:
  - `/vessellocations` - Real-time vessel positions
  - `/vesselverbose` - Vessel specifications and details
- **Data Types**: `VesselLocation`, `VesselVerbose`

#### 2. Terminals API (`/terminals`)
- **Base URL**: `https://www.wsdot.wa.gov/ferries/api/terminals/rest`
- **Endpoints**:
  - `/terminalsailingspace` - Space availability and wait times
  - `/terminalverbose` - Terminal information and facilities
- **Data Types**: `TerminalSailingSpace`, `TerminalVerbose`

#### 3. Schedule API (`/schedule`)
- **Base URL**: `https://www.wsdot.wa.gov/ferries/api/schedule/rest`
- **Endpoints**:
  - `/routes` - Route information and schedules
  - `/routedetails` - Detailed route information
  - `/activeseasons` - Active service seasons
  - `/alerts` - Service alerts and disruptions
- **Data Types**: `Route`, `Schedule`, `Alert`, `ActiveSeason`

### Data Transformation

#### Type System
The application uses a comprehensive type system for data transformation:

- **`JsonValue`**: Input type representing JSON-like data that can be transformed
- **`JsonX`**: Output type with Date objects and camelCase keys
- **`TransformedJson`**: Generic type for transformed JSON objects
- **`TransformedJsonArray`**: Generic type for transformed JSON arrays

#### Automatic Date Parsing
The application automatically converts WSF API date formats to JavaScript Date objects:

1. **`/Date(timestamp)/`** - WSF timestamp format
2. **`YYYY-MM-DD`** - ISO date format
3. **`MM/DD/YYYY`** - US date format

#### Key Transformation Features
- **Pattern-based detection** - No need to maintain field name lists
- **Robust validation** - Ensures dates are valid before conversion
- **Recursive processing** - Handles nested objects and arrays
- **CamelCase conversion** - Converts PascalCase keys to camelCase

### Fetch Architecture

#### Core Fetch Functions
- **`fetchWsf<T>()`** - Fetches single objects or arrays
- **`fetchWsfArray<T>()`** - Convenience function for arrays
- **`fetchInternal()`** - Platform-specific fetch implementation

#### Platform Support
- **Web**: JSONP implementation for CORS bypass
- **Mobile**: Native fetch with error handling
- **Automatic fallback** between platforms

#### Error Handling
- **Graceful degradation** when APIs are unavailable
- **Automatic retry** with exponential backoff
- **Null safety** - Returns null/empty arrays on failure
- **Logging** - Configurable debug and error logging

## Component Architecture

### Map Components

#### MapView
- **Purpose**: Main map container with vessel tracking
- **Features**: Real-time vessel positions, route visualization
- **Props**: `style`, `children`, map configuration

#### Camera
- **Purpose**: Map camera controls and animations
- **Features**: Zoom, pan, follow vessel, smooth transitions
- **Props**: `centerCoordinate`, `zoomLevel`, `animationDuration`

#### CircleLayer
- **Purpose**: Vessel position indicators
- **Features**: Animated circles, color coding, click handlers
- **Props**: `id`, `sourceLayerId`, `circleColor`, `circleRadius`

#### ShapeSource
- **Purpose**: GeoJSON data source management
- **Features**: Vessel tracks, route lines, terminal markers
- **Props**: `id`, `shape`, `cluster`, `clusterRadius`

### UI Components

#### Base Components (Radix UI)
- **Button**: Multiple variants with proper touch feedback
- **Card**: Flexible container components
- **Progress**: Animated progress indicators
- **Text**: Typography system with semantic styling
- **Tooltip**: Contextual information overlays
- **Avatar**: User profile images with fallbacks

#### Theme System
- **Automatic Detection**: Follows system appearance preferences
- **Persistent Storage**: Remembers user theme choice
- **CSS Variables**: HSL color system for consistency
- **Platform Adaptations**: Optimized for each platform

## State Management

### React Query Integration
- **Automatic Caching**: Memory-based caching with configurable TTL
- **Background Updates**: Automatic refetching for fresh data
- **Optimistic Updates**: Immediate UI updates with rollback on error
- **Query Keys**: Structured keys for efficient cache management

### Zustand Store
- **Global State**: App-wide state management
- **Persistent Storage**: AsyncStorage integration
- **Type Safety**: Full TypeScript coverage

## Performance Optimizations

### Data Layer
- **Efficient Caching**: React Query for intelligent data caching
- **Background Updates**: Automatic data refresh without blocking UI
- **Lazy Loading**: Load data only when needed
- **Error Recovery**: Graceful handling of network failures

### Map Performance
- **Clustering**: Automatic point clustering for large datasets
- **Viewport Culling**: Only render visible features
- **Smooth Animations**: Hardware-accelerated transitions
- **Memory Management**: Efficient cleanup of map resources

### Bundle Optimization
- **Tree Shaking**: Remove unused code
- **Code Splitting**: Lazy load components and routes
- **Asset Optimization**: Compressed images and fonts
- **Metro Configuration**: Optimized bundling for React Native

## Security

### API Security
- **Access Tokens**: Secure storage of WSF API tokens
- **CORS Handling**: JSONP fallback for web platform
- **Error Sanitization**: No sensitive data in error messages
- **Rate Limiting**: Respectful API usage patterns

### Data Privacy
- **Local Storage**: No sensitive data sent to external services
- **Anonymous Usage**: No user tracking or analytics
- **Secure Storage**: Encrypted storage for sensitive data

## Testing Strategy

### Unit Testing
- **Component Testing**: React Native Testing Library
- **Hook Testing**: Custom hook testing utilities
- **Utility Testing**: Pure function testing
- **Mocking**: Comprehensive API mocking

### Integration Testing
- **API Integration**: End-to-end API testing
- **Map Integration**: Map component testing
- **Navigation Testing**: Route and navigation testing

### Performance Testing
- **Bundle Size**: Monitor bundle size growth
- **Memory Usage**: Track memory consumption
- **Render Performance**: Component render timing
- **Network Performance**: API response times

## Deployment

### Build Configuration
- **EAS Build**: Cloud build configuration
- **Platform Support**: iOS, Android, Web
- **Environment Variables**: Secure configuration management
- **Asset Optimization**: Automated asset processing

### Distribution
- **App Stores**: iOS App Store and Google Play Store
- **Web Deployment**: Vercel or similar platform
- **OTA Updates**: Expo Updates for rapid deployments

## Monitoring and Analytics

### Error Tracking
- **Crash Reporting**: Automatic crash detection
- **Error Logging**: Structured error logging
- **Performance Monitoring**: App performance metrics
- **User Feedback**: In-app feedback collection

### Usage Analytics
- **Feature Usage**: Track feature adoption
- **Performance Metrics**: Monitor app performance
- **User Behavior**: Understand user patterns
- **A/B Testing**: Feature experimentation

## Future Enhancements

### Planned Features
- **Offline Mode**: Full offline functionality
- **Push Notifications**: Real-time alerts and updates
- **Social Features**: User reviews and ratings
- **Advanced Routing**: Multi-modal trip planning

### Technical Improvements
- **Performance**: Further optimization of map rendering
- **Accessibility**: Enhanced accessibility features
- **Internationalization**: Multi-language support
- **Advanced Caching**: More sophisticated caching strategies

## Documentation Standards

### Code Documentation
- **JSDoc Comments**: Comprehensive function documentation
- **Type Definitions**: Complete TypeScript type coverage
- **API Documentation**: Detailed API endpoint documentation
- **Component Documentation**: Usage examples and props

### Architecture Documentation
- **System Diagrams**: Visual architecture documentation
- **Data Flow**: Clear data flow documentation
- **Component Relationships**: Component interaction documentation
- **Deployment Guides**: Step-by-step deployment instructions 
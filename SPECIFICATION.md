# FerryJoy Client - Technical Specification

## Project Overview

FerryJoy Client is a React Native mobile application built with Expo, specifically designed for the Washington State Ferry (WSF) system. The application provides comprehensive ferry transportation services including real-time vessel tracking, schedule information, route planning, and travel assistance for passengers navigating the extensive Puget Sound ferry network. The application leverages modern React Native development practices, TypeScript for type safety, Convex for real-time backend services, and a comprehensive UI component system optimized for maritime travel.

## Technology Stack

### Core Framework
- **React Native**: 0.79.5 - Cross-platform mobile development framework
- **Expo**: 53.0.9 - Development platform and build service
- **React**: 19.0.0 - UI library
- **TypeScript**: 5.8.3 - Static type checking

### Backend & Data
- **Convex**: 1.25.2 - Real-time database and backend functions
- **WSF API Integration**: Washington State Ferry vessel tracking and schedule data
- **Real-time Sync**: Automatic data synchronization across devices

### Navigation & Routing
- **Expo Router**: 5.1.3 - File-based routing system
- **React Navigation**: 7.0.0 - Navigation library
- **React Native Screens**: 4.10.0 - Native navigation primitives

### Styling & UI
- **NativeWind**: 4.1.23 - Tailwind CSS for React Native
- **Tailwind CSS**: 3.3.5 - Utility-first CSS framework
- **React Native Reanimated**: 3.17.5 - Animation library
- **Lucide React Native**: 0.511.0 - Icon library

### UI Components
- **@rn-primitives**: Modern React Native component primitives
  - Avatar: ~1.2.0
  - Portal: ~1.3.0
  - Progress: ~1.2.0
  - Slot: ~1.2.0
  - Tooltip: ~1.2.0
- **Class Variance Authority**: 0.7.0 - Component variant management
- **CLSX**: 2.1.0 - Conditional className utility
- **Tailwind Merge**: 2.2.1 - Tailwind class merging utility

### Mapping & Location
- **@rnmapbox/maps**: 10.1.39 - Mapbox integration for React Native
- **Mapbox GL**: 3.13.0 - Mapbox GL JS
- **Expo Location**: 18.1.6 - Location services

### Development Tools
- **Bun**: Package manager and runtime
- **Biome**: 2.0.6 - Fast formatter and linter
- **Metro**: React Native bundler

## Project Structure

```
ferryjoy-client-new/
├── app.config.js              # Expo configuration
├── convex.json                # Convex configuration
├── assets/                    # Static assets
│   └── images/               # App icons and splash screens
├── src/
│   ├── app/                  # Expo Router pages
│   │   ├── _layout.tsx       # Root layout with navigation
│   │   ├── index.tsx         # Home screen
│   │   ├── map.tsx           # Map screen
│   │   └── +not-found.tsx    # 404 error page
│   ├── components/           # Reusable UI components
│   │   ├── map/              # Map-specific components
│   │   │   ├── index.ts      # Map component exports
│   │   │   └── map.tsx       # Main map component
│   │   ├── ThemeToggle.tsx   # Dark/light mode toggle
│   │   └── ui/               # Base UI components
│   │       ├── avatar.tsx
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── progress.tsx
│   │       ├── text.tsx
│   │       └── tooltip.tsx
│   ├── data/                 # Data layer and API integration
│   │   ├── convex/           # Convex backend functions
│   │   │   ├── schema.ts     # Database schema
│   │   │   ├── index.ts      # Function exports
│   │   │   ├── crons.ts      # Scheduled functions
│   │   │   ├── lib/          # Convex utilities
│   │   │   ├── vesselLocations/     # Vessel location functions
│   │   │   │   ├── index.ts
│   │   │   │   ├── vesselLocationActions.ts
│   │   │   │   ├── vesselLocationHelpers.ts
│   │   │   │   ├── vesselLocationMutations.ts
│   │   │   │   ├── vesselLocationQueries.ts
│   │   │   │   └── vesselLocationValidation.ts
│   │   │   ├── vesselLocationsCurrent/ # Current vessel data
│   │   │   │   ├── index.ts
│   │   │   │   ├── vesselLocationCurrentActions.ts
│   │   │   │   ├── vesselLocationCurrentHelpers.ts
│   │   │   │   ├── vesselLocationCurrentMutations.ts
│   │   │   │   ├── vesselLocationCurrentQueries.ts
│   │   │   │   └── vesselLocationCurrentValidation.ts
│   │   │   └── _generated/   # Auto-generated types
│   │   ├── wsf/              # Washington State Ferry API
│   │   │   ├── index.ts      # WSF API utilities
│   │   │   ├── utils.ts      # WSF data processing
│   │   │   └── vessels/      # Vessel data integration
│   │   │       ├── index.ts
│   │   │       ├── useCacheFlushDate.ts
│   │   │       ├── useVesselLocations.ts
│   │   │       └── useVesselVerbose.ts
│   │   └── shared/           # Shared data types and utilities
│   │       ├── fetch.ts      # Shared fetch utilities
│   │       ├── VesselLocation.ts
│   │       └── VesselTrip.ts
│   ├── lib/                  # Utility libraries
│   │   ├── android-navigation-bar.ts
│   │   ├── constants.ts
│   │   ├── convex.ts         # Convex client configuration
│   │   ├── icons/            # Custom icon components
│   │   ├── useColorScheme.tsx
│   │   └── utils.ts
│   └── global.css            # Global styles and CSS variables
├── tailwind.config.js        # Tailwind configuration
├── biome.json               # Biome linter/formatter config
├── tsconfig.json            # TypeScript configuration
└── package.json             # Dependencies and scripts
```

## Application Architecture

### Navigation Structure
- **Root Layout**: Provides theme context, navigation stack, and global UI elements
- **Home Screen**: Displays ferry system overview with current vessel status
- **Map Screen**: Interactive Puget Sound map with real-time vessel tracking
- **Schedule Screen**: Real-time departure and arrival times for all WSF routes
- **Terminal Screen**: Detailed information about ferry terminals and amenities

### Data Architecture
- **Convex Backend**: Real-time database with automatic synchronization
- **WSF API Integration**: Washington State Ferry vessel tracking and schedule data
- **Data Flow**: WSF API → Convex Functions → React Native Client
- **Schema Design**: Optimized for vessel location tracking and historical data

### Theme System
- **Automatic Theme Detection**: Uses system appearance preferences
- **Persistent Theme Storage**: Maintains user theme preference
- **Platform-Specific Adaptations**:
  - Android: Navigation bar color matches theme
  - Web: Background color applied to HTML element
  - iOS: Status bar style adaptation

### Component Architecture
- **Primitive-Based**: Built on @rn-primitives for consistent behavior
- **Variant System**: Uses Class Variance Authority for component variants
- **Composable**: Components designed for composition and reusability
- **Type-Safe**: Full TypeScript support with strict type checking

## Configuration Details

### Expo Configuration
- **Bundle Identifier**: `com.ferryjoy.client`
- **Platform Support**: iOS, Android, Web
- **Orientation**: Portrait mode
- **New Architecture**: Enabled for better performance
- **Plugins**:
  - Expo Router for navigation
  - Expo Location for GPS services
  - Mapbox for mapping functionality

### Convex Configuration
- **Functions Directory**: `src/data/convex`
- **Schema**: Vessel location tracking with historical and current data
- **Real-time Sync**: Automatic data synchronization across devices
- **Type Safety**: Full TypeScript integration with generated types
- **Cron Jobs**: Scheduled data updates from WSF API

### Styling Configuration
- **CSS Variables**: HSL color system for theme consistency
- **Dark Mode**: Class-based dark mode implementation
- **Custom Colors**: Extended color palette with semantic naming
- **Animations**: Tailwind CSS animations with custom keyframes

### Development Configuration
- **Linting**: Biome with recommended rules and custom configurations
- **Formatting**: Consistent code style with 2-space indentation
- **Type Checking**: Strict TypeScript configuration
- **Import Organization**: Automated import sorting and grouping

## Environment Variables

### Required Environment Variables
- `EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN`: Mapbox API access token for mapping services
- `MAPBOX_SECRET_DOWNLOAD_TOKEN`: Mapbox download token for native builds
- `EXPO_PUBLIC_CONVEX_URL`: Convex deployment URL for backend services

## Build & Deployment

### Development Scripts
- `bun start`: Start Expo development server
- `bun web`: Start web development server
- `bun android`: Start Android development
- `bun ios`: Start iOS development
- `bun convex dev`: Start Convex development server
- `bun clean`: Clean build artifacts
- `bun lint`: Run linting checks
- `bun format`: Format code
- `bun typecheck`: Run TypeScript type checking
- `bun check:all`: Run all quality checks
- `bun fix:all`: Auto-fix all issues

### Build Configuration
- **EAS Build**: Configured for cloud builds
- **Project ID**: 77936491-683c-4f25-8759-4c4dcde542ee
- **Asset Bundling**: Optimized for all platforms
- **Splash Screen**: Custom splash screen with proper scaling

## Performance Considerations

### Optimization Features
- **New Architecture**: React Native's new architecture for better performance
- **Reanimated**: Native-driven animations for smooth interactions
- **Metro Bundler**: Optimized bundling with tree shaking
- **Image Optimization**: Proper asset sizing and formats
- **Convex Real-time**: Efficient real-time data synchronization

### Memory Management
- **Portal System**: Efficient modal and overlay rendering
- **Component Memoization**: Strategic use of React.memo and useMemo
- **Lazy Loading**: Route-based code splitting with Expo Router
- **Data Caching**: Intelligent caching of vessel location data

## Security Considerations

### API Security
- **Environment Variables**: Secure storage of API keys
- **Token Management**: Proper Mapbox token handling
- **Permission Handling**: Granular location permissions
- **Convex Security**: Row-level security and function validation

### Platform Security
- **iOS**: App Transport Security compliance
- **Android**: Adaptive icon and proper package naming
- **Web**: Secure bundling and static output

## Testing Strategy

### Quality Assurance
- **TypeScript**: Static type checking for runtime safety
- **Linting**: Code quality and consistency enforcement
- **Formatting**: Consistent code style across the project
- **Import Validation**: Proper import organization and validation

### Manual Testing
- **Cross-Platform**: iOS, Android, and Web testing
- **Theme Testing**: Dark and light mode validation
- **Navigation Testing**: Route transitions and deep linking
- **Map Integration**: Location services and map functionality
- **Ferry Data Integration**: Real-time vessel tracking and schedule accuracy
- **WSF API Testing**: Washington State Ferry system data integration
- **Convex Integration**: Real-time data synchronization testing
- **Terminal Information**: Parking and amenity data validation

## Future Enhancements

### Planned Features
- **State Management**: Redux Toolkit or Zustand integration for ferry data
- **Push Notifications**: Real-time ferry updates, delays, and schedule changes
- **Offline Support**: Cached ferry schedules and route information for offline access
- **Analytics**: User behavior tracking and performance monitoring
- **Maritime Weather**: Integration with weather services for Puget Sound conditions
- **Terminal Information**: Detailed parking, accessibility, and amenity information
- **Route Optimization**: AI-powered route suggestions based on current conditions

### Technical Improvements
- **Testing Framework**: Jest and React Native Testing Library
- **CI/CD Pipeline**: Automated testing and deployment
- **Performance Monitoring**: Crash reporting and analytics
- **Accessibility**: WCAG compliance and screen reader support 
# FerryJoy Client

A React Native/Expo application for tracking Washington State Ferries vessels in real-time with an interactive map interface.

## Features

- **Real-time Vessel Tracking**: Live vessel positions, speeds, and headings from WSF API
- **Interactive Map**: Built with MapLibre GL JS and React Native Mapbox
- **Schedule Information**: Complete ferry schedules and route details
- **Terminal Information**: Real-time space availability and wait times
- **Cross-platform**: Works on iOS, Android, and Web
- **Offline Support**: Cached data for offline viewing
- **Modern UI**: Built with Tailwind CSS and Radix UI components

## Tech Stack

- **Framework**: React Native with Expo
- **Language**: TypeScript
- **Maps**: MapLibre GL JS with React Native Mapbox
- **Styling**: Tailwind CSS with NativeWind
- **State Management**: Zustand
- **Data Fetching**: React Query (TanStack Query)
- **Backend**: Supabase (PostgreSQL + Real-time subscriptions)
- **APIs**: Washington State Ferries (WSF) API
- **Package Manager**: Bun

## Project Structure

```
src/
├── app/                    # Expo Router app directory
├── components/             # Reusable UI components
│   ├── map/               # Map-related components
│   │   ├── Camera/        # Map camera controls
│   │   ├── CircleLayer/   # Vessel position indicators
│   │   ├── MapView/       # Main map component
│   │   └── ShapeSource/   # GeoJSON data sources
│   └── ui/                # Base UI components (Radix UI)
├── data/                  # Data layer
│   ├── contexts/          # React contexts for data
│   ├── supabase/          # Supabase client and types
│   ├── wsf/               # WSF API integration
│   │   ├── shared/        # Shared utilities and types
│   │   ├── vessels/       # Vessel data and location
│   │   ├── terminals/     # Terminal information
│   │   └── schedule/      # Schedule and route data
│   └── utils/             # Data utilities
├── hooks/                 # Custom React hooks
└── lib/                   # Utility libraries
```

## Getting Started

### Prerequisites

- Node.js 18+ or Bun
- Expo CLI
- WSF API access token

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd ferryjoy-client-new
```

2. Install dependencies:
```bash
bun install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Add your WSF API access token:
```env
EXPO_PUBLIC_WSDOT_ACCESS_TOKEN=your_api_key_here
```

4. Start the development server:
```bash
bun start
```

### Development

- **iOS Simulator**: Press `i` in the terminal
- **Android Emulator**: Press `a` in the terminal
- **Web Browser**: Press `w` in the terminal

## Data Layer Architecture

### WSF API Integration

The application integrates with multiple WSF API endpoints:

- **Vessels API**: Real-time vessel locations and specifications
- **Terminals API**: Terminal information, space availability, and wait times
- **Schedule API**: Route schedules, departures, and service disruptions

### Key Features

- **Automatic Date Parsing**: Converts WSF date formats to JavaScript Date objects
- **Type Safety**: Comprehensive type system with `JsonValue`, `JsonX`, and generic types
- **Caching**: React Query for efficient data caching and background updates
- **Error Handling**: Graceful fallbacks and error recovery
- **Platform Support**: JSONP for web CORS issues, native fetch for mobile

### Data Flow

```
WSF API → fetchInternal → transformWsfData → React Query → Components
```

### Type System

The application uses a comprehensive type system for data transformation:

- **`JsonValue`**: Input type for JSON-like data that can be transformed
- **`JsonX`**: Output type with Date objects and camelCase keys
- **`TransformedJson`**: Generic type for transformed JSON objects
- **`TransformedJsonArray`**: Generic type for transformed JSON arrays

This ensures type safety while maintaining flexibility for testing and development.

## Map Components

### MapView
Main map component with vessel tracking and interactive features.

### Camera
Controls map camera position, zoom, and animations.

### CircleLayer
Displays vessel positions as animated circles on the map.

### ShapeSource
Manages GeoJSON data sources for vessel tracks and routes.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Acknowledgments

- Washington State Department of Transportation (WSDOT) for the ferry API
- MapLibre for the open-source mapping solution
- Expo team for the excellent development platform

# FerryJoy Client

A modern React Native mobile application designed specifically for the Washington State Ferry system, providing real-time vessel tracking, schedule information, and travel assistance for ferry passengers. Built with Expo and featuring integrated mapping capabilities, the app helps travelers navigate the extensive ferry network serving Puget Sound and surrounding waterways.

## 🚀 Features

### Core Functionality
- **Real-Time Vessel Tracking**: Live GPS tracking of Washington State Ferry vessels
- **Schedule Information**: Up-to-date departure and arrival times for all routes
- **Route Planning**: Interactive maps showing ferry routes across Puget Sound
- **Cross-Platform**: iOS, Android, and Web support
- **File-Based Routing**: Expo Router for seamless navigation
- **Integrated Mapping**: Mapbox integration with real-time location
- **Theme System**: Automatic dark/light mode with persistent preferences
- **Modern UI**: Component-based design system with NativeWind styling

### Technical Features
- **TypeScript**: Full type safety and IntelliSense support
- **NativeWind v4**: Tailwind CSS for React Native
- **React Native Reanimated**: Smooth, native-driven animations
- **WSF API Integration**: Washington State Ferry data integration
- **Platform Adaptations**: 
  - Android Navigation Bar theme matching
  - iOS Status Bar style adaptation
  - Web background color optimization

### UI Components
- **ThemeToggle**: Dark/light mode switcher
- **Avatar**: User profile images with fallbacks
- **Button**: Multiple variants with proper touch feedback
- **Card**: Flexible container components
- **Progress**: Animated progress indicators
- **Text**: Typography system with semantic styling
- **Tooltip**: Contextual information overlays

## 🛠️ Tech Stack

- **Framework**: React Native 0.79.5 + Expo 53.0.9
- **Language**: TypeScript 5.8.3
- **Styling**: NativeWind 4.1.23 + Tailwind CSS 3.3.5
- **Navigation**: Expo Router 5.1.3 + React Navigation 7.0.0
- **Maps**: @rnmapbox/maps 10.1.39
- **Icons**: Lucide React Native 0.511.0
- **Package Manager**: Bun
- **Linting**: Biome 2.0.6

## 📱 Screenshots

<img src="https://github.com/mrzachnugent/react-native-reusables/assets/63797719/42c94108-38a7-498b-9c70-18640420f1bc"
     alt="FerryJoy Client App"
     style="width:270px;" />

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ or Bun
- Expo CLI
- iOS Simulator (for iOS development)
- Android Studio (for Android development)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ferryjoy-client-new
   ```

2. **Install dependencies**
   ```bash
   bun install
   ```

3. **Set up environment variables**
   ```bash
   # Create .env file with your API tokens
   EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN=your_mapbox_access_token
   MAPBOX_SECRET_DOWNLOAD_TOKEN=your_mapbox_download_token
   ```

4. **Start development server**
   ```bash
   bun start
   ```

### Development Scripts

- `bun start` - Start Expo development server
- `bun web` - Start web development server
- `bun android` - Start Android development
- `bun ios` - Start iOS development
- `bun lint` - Run linting checks
- `bun format` - Format code
- `bun typecheck` - Run TypeScript type checking
- `bun check:all` - Run all quality checks
- `bun fix:all` - Auto-fix all issues

## 📁 Project Structure

```
src/
├── app/                    # Expo Router pages
│   ├── _layout.tsx        # Root layout with navigation
│   ├── index.tsx          # Home screen
│   ├── map.tsx            # Map screen
│   └── +not-found.tsx     # 404 error page
├── components/            # Reusable UI components
│   ├── map/               # Map-specific components
│   ├── ThemeToggle.tsx    # Dark/light mode toggle
│   └── ui/               # Base UI components
├── data/                 # Data layer and API integration
│   ├── wsf/              # Washington State Ferry API
│   │   └── vessels/      # Vessel data integration
│   └── shared/           # Shared data types and utilities
├── lib/                  # Utility libraries
│   ├── icons/            # Custom icon components
│   ├── useColorScheme.tsx
│   └── utils.ts
└── global.css            # Global styles and CSS variables
```

## 🎨 Theming

The app features a comprehensive theming system with:
- **Automatic Detection**: Follows system appearance preferences
- **Persistent Storage**: Remembers user theme choice
- **CSS Variables**: HSL color system for consistency
- **Platform Adaptations**: Optimized for each platform

## 🗺️ Ferry System Integration

- **Washington State Ferry Routes**: Complete coverage of all WSF routes and terminals
- **Real-Time Vessel Tracking**: Live GPS positions of all active ferry vessels
- **Schedule Integration**: Real-time departure and arrival information
- **Terminal Information**: Details about parking, amenities, and accessibility
- **Route Planning**: Interactive maps showing optimal ferry connections
- **Custom Styling**: Dark mode map support optimized for maritime navigation
- **Puget Sound Coverage**: Pre-configured for the entire Washington State Ferry system

## 🔧 Configuration

### Expo Configuration
- Bundle ID: `com.ferryjoy.client`
- New Architecture: Enabled
- Platform Support: iOS, Android, Web
- Orientation: Portrait

### Development Tools
- **Biome**: Fast linting and formatting
- **TypeScript**: Strict type checking
- **Metro**: Optimized bundling
- **EAS Build**: Cloud build configuration

## 📋 Requirements

### Environment Variables
- `EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN` - Mapbox API access token for mapping services
- `MAPBOX_SECRET_DOWNLOAD_TOKEN` - Mapbox download token for native builds

### Permissions
- Location access for map functionality
- Camera access (if implementing photo features)

## 📄 License

This project is not licensed. All rights reserved.

## 📚 Documentation

For detailed technical specifications, see [SPECIFICATION.md](./SPECIFICATION.md).

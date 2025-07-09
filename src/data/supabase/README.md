# Supabase Integration

The Supabase integration provides real-time data synchronization, offline support, and backend services for the FerryJoy application.

## Overview

This module integrates with Supabase to provide:
- Real-time vessel position updates via WebSocket subscriptions
- Offline data caching and synchronization
- User preferences and settings storage
- Analytics and usage tracking

## Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Components    │    │   Supabase      │    │   Supabase      │
│   (UI Layer)    │◄──►│   Client        │◄──►│   Backend       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React Query   │    │   Real-time     │    │   PostgreSQL    │
│   (Cache/State) │    │   Subscriptions │    │   Database      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Features

### Real-time Subscriptions
- **Vessel Positions**: Live updates of vessel locations
- **Terminal Status**: Real-time space availability changes
- **Service Alerts**: Instant notification of disruptions
- **User Preferences**: Synchronized settings across devices

### Offline Support
- **Data Caching**: Local storage of frequently accessed data
- **Background Sync**: Automatic synchronization when online
- **Conflict Resolution**: Smart merging of local and remote data
- **Offline Indicators**: Clear status of connectivity

### Data Management
- **Type Safety**: Full TypeScript coverage with generated types
- **Schema Validation**: Runtime validation of data structures
- **Migration Support**: Versioned database schema changes
- **Backup & Recovery**: Automated data backup and restoration

## Database Schema

### Vessel Positions Table
```sql
CREATE TABLE vessel_positions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vessel_id INTEGER NOT NULL,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  speed DECIMAL(5, 2),
  heading INTEGER,
  route_id INTEGER,
  departing_terminal_id INTEGER,
  arriving_terminal_id INTEGER,
  estimated_arrival_time TIMESTAMP WITH TIME ZONE,
  estimated_departure_time TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for efficient queries
CREATE INDEX idx_vessel_positions_vessel_id ON vessel_positions(vessel_id);
CREATE INDEX idx_vessel_positions_created_at ON vessel_positions(created_at);
```

### Terminal Status Table
```sql
CREATE TABLE terminal_status (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  terminal_id INTEGER NOT NULL,
  space_available INTEGER,
  wait_time INTEGER,
  parking_available BOOLEAN,
  motorcycle_space INTEGER,
  oversized_space INTEGER,
  accessibility_space INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for efficient queries
CREATE INDEX idx_terminal_status_terminal_id ON terminal_status(terminal_id);
CREATE INDEX idx_terminal_status_updated_at ON terminal_status(updated_at);
```

### User Preferences Table
```sql
CREATE TABLE user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  theme VARCHAR(10) DEFAULT 'system',
  notifications_enabled BOOLEAN DEFAULT true,
  favorite_routes INTEGER[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for efficient queries
CREATE INDEX idx_user_preferences_user_id ON user_preferences(user_id);
```

## React Query Integration

### Real-time Hooks

#### useVesselPositionsRealtime
Provides real-time vessel position updates via WebSocket.

```typescript
const { data: vessels, isLoading, error } = useVesselPositionsRealtime({
  refetchInterval: 30000,  // Fallback polling
  staleTime: 15000,        // Consider data stale after 15 seconds
});
```

#### useTerminalStatusRealtime
Provides real-time terminal status updates.

```typescript
const { data: terminals, isLoading, error } = useTerminalStatusRealtime({
  refetchInterval: 300000,  // Fallback polling every 5 minutes
  staleTime: 150000,        // Consider data stale after 2.5 minutes
});
```

### Offline Hooks

#### useOfflineData
Manages offline data synchronization.

```typescript
const { data, isOnline, syncStatus } = useOfflineData({
  onSync: (data) => console.log('Data synced:', data),
  onError: (error) => console.error('Sync error:', error),
});
```

## Usage Examples

### Real-time Vessel Tracking
```typescript
import { useVesselPositionsRealtime } from '@/data/supabase';

function VesselTracker() {
  const { data: vessels, isLoading } = useVesselPositionsRealtime();

  if (isLoading) return <LoadingSpinner />;

  return (
    <Map>
      {vessels?.map(vessel => (
        <VesselMarker
          key={vessel.vesselId}
          position={[vessel.latitude, vessel.longitude]}
          heading={vessel.heading}
          speed={vessel.speed}
        />
      ))}
    </Map>
  );
}
```

### Offline Status Indicator
```typescript
import { useOfflineData } from '@/data/supabase';

function OfflineIndicator() {
  const { isOnline, syncStatus } = useOfflineData();

  return (
    <StatusBar>
      {!isOnline && (
        <OfflineBanner>
          <Icon name="wifi-off" />
          <Text>You're offline. Data may be outdated.</Text>
        </OfflineBanner>
      )}
      {syncStatus === 'syncing' && (
        <SyncIndicator>
          <Spinner />
          <Text>Syncing data...</Text>
        </SyncIndicator>
      )}
    </StatusBar>
  );
}
```

### User Preferences
```typescript
import { useUserPreferences } from '@/data/supabase';

function SettingsScreen() {
  const { data: preferences, updatePreferences } = useUserPreferences();

  const handleThemeChange = (theme: string) => {
    updatePreferences({ theme });
  };

  return (
    <SettingsForm>
      <ThemeSelector
        value={preferences?.theme || 'system'}
        onChange={handleThemeChange}
      />
      <NotificationToggle
        value={preferences?.notificationsEnabled || true}
        onChange={(enabled) => updatePreferences({ notificationsEnabled: enabled })}
      />
    </SettingsForm>
  );
}
```

## Configuration

### Environment Variables
```bash
# Supabase configuration
EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Optional: Supabase service role key (for server-side operations)
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### Client Configuration
```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});
```

## Performance Optimizations

### Caching Strategy
- **Memory Caching**: React Query for efficient data caching
- **Persistent Storage**: AsyncStorage for offline data
- **Background Sync**: Non-blocking data synchronization
- **Smart Invalidation**: Intelligent cache invalidation

### Network Optimization
- **WebSocket Connections**: Efficient real-time updates
- **Request Batching**: Reduce API call frequency
- **Compression**: Minimize bandwidth usage
- **Connection Pooling**: Efficient resource usage

### Memory Management
- **Efficient Data Structures**: Optimized for large datasets
- **Garbage Collection**: Automatic cleanup of unused data
- **Memory Monitoring**: Performance tracking and optimization

## Error Handling

### Connection Failures
- **Graceful Degradation**: Fallback to cached data
- **Automatic Reconnection**: Smart reconnection logic
- **User Feedback**: Clear status indicators
- **Error Recovery**: Automatic retry with exponential backoff

### Data Conflicts
- **Conflict Resolution**: Smart merging strategies
- **Version Control**: Optimistic updates with rollback
- **Data Validation**: Runtime validation of data integrity
- **Audit Trail**: Track data changes and conflicts

## Security

### Authentication
- **Row Level Security**: Database-level access control
- **User Isolation**: Secure data separation
- **Token Management**: Secure token storage and refresh
- **Session Management**: Secure session handling

### Data Protection
- **Encryption**: Data encryption in transit and at rest
- **Access Control**: Fine-grained permission system
- **Audit Logging**: Comprehensive access logging
- **Privacy Compliance**: GDPR and privacy regulation compliance

## Development Tools

### Debugging
- **Supabase Dashboard**: Real-time database monitoring
- **Network Monitoring**: Track API requests and responses
- **Cache Inspection**: View cached data and query states
- **Performance Profiling**: Monitor data layer performance

### Testing
- **Mock Supabase**: Test with simulated data
- **Integration Tests**: End-to-end API testing
- **Performance Tests**: Load testing and optimization
- **Security Tests**: Authentication and authorization testing

## Future Enhancements

### Planned Features
- **Advanced Analytics**: User behavior and usage analytics
- **Machine Learning**: Predictive data analysis
- **Multi-device Sync**: Seamless cross-device synchronization
- **Advanced Offline**: Full offline functionality with sync

### API Improvements
- **GraphQL Support**: More efficient data fetching
- **Advanced Subscriptions**: Filtered real-time updates
- **Batch Operations**: Reduce API call frequency
- **Edge Functions**: Serverless backend processing 
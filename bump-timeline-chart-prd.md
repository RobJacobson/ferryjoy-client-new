# Product Requirements Document: Bump Timeline Chart

## Overview
A React Native component for visualizing transit-style timelines using a vertically-oriented bump chart design. The chart displays vessel movements between terminals over time, with smooth curved lines connecting arrival/departure events.

## Core Features (Phase 1)

### 1. Visual Layout
- **Orientation**: Vertical timeline with time flowing downward (Y-axis)
- **Columns**: Evenly spaced terminal positions (X-axis) with configurable left/right margins
- **Time Range**: Configurable time period (default: 5:00 AM to 5:00 AM) with hourly increments
- **Scaling**: Configurable height per hour for different route visualizations

### 2. Data Structure
```typescript
interface Position {
  label: string;
  style?: object; // styling for column appearance
}

interface Event {
  positionIndex: number; // which terminal/column
  time: Date; // arrival/departure time
  type: 'arrival' | 'departure';
  label?: string;
  metadata?: object; // for future overlay information
}

interface VesselLine {
  label: string;
  events: Event[];
  style?: object; // styling for line appearance
}

interface BumpTimelineChartProps {
  positions: Position[]; // terminals/columns
  vesselLines: VesselLine[][]; // 2D array: vessel -> events
  timeRange: { start: Date; end: Date };
  hourHeight: number; // configurable height per hour
  controlPointOffset: number; // percentage of hour height for curve control
}
```

### 3. Component Architecture
- `BumpTimelineChart` - Main container with state management
- `TimelineAxis` - Time ticks and labels (Y-axis)
- `TimelineColumn` - Terminal labels and positioning (X-axis)
- `TimelineLine` - Individual vessel path with curved connections
- `TimelinePoint` - Individual arrival/departure events

### 4. Rendering Features
- **Time Axis**: Hourly tick marks with labels, configurable styling
- **Position Columns**: Evenly spaced with centered labels and margins
- **Event Points**: Positioned based on time and terminal, distinct styling from lines
- **Curved Lines**: Quadratic bezier curves with control points vertically aligned to positions
- **Styling**: Modular styling system allowing different appearances for lines vs. points

## Implementation Phases

### Phase 1: Static Chart Foundation
1. **Basic Structure & Types** - Define interfaces and component structure
2. **Time Axis** - Render Y-axis with hour ticks and labels
3. **Position Columns** - Render X-axis with terminal labels
4. **Event Points** - Position and render individual events
5. **Curved Lines** - Connect points with quadratic bezier curves
6. **Click Handlers** - Basic interaction (coordinate single popup state)

### Phase 2: Enhanced Interactivity
- Popup/overlay system for event details
- Vessel highlighting and coordination
- Improved styling and animations

### Phase 3: Advanced Features
- Real-time vessel position interpolation
- Zoom functionality (pinch-to-zoom or buttons)
- Horizontal orientation support
- Performance optimizations

## Technical Requirements

### Dependencies
- `react-native-svg` for SVG rendering
- Native SVG bezier curves (no D3 dependency)
- React state management for zoom and interaction

### Performance Considerations
- Efficient re-rendering with React state
- Optimized bezier curve calculations
- Minimal memory footprint for large datasets

### Accessibility
- Touch-friendly target sizes
- Clear visual hierarchy
- Support for screen readers (future)

## Success Criteria
- [ ] Renders static chart with mock data
- [ ] Smooth curved lines between events
- [ ] Proper time and position scaling
- [ ] Click coordination (single popup state)
- [ ] Modular, reusable component structure
- [ ] Clean separation of concerns

## Future Considerations
- Horizontal orientation support
- Real-time vessel tracking
- Advanced zoom and pan
- Animation and transitions
- Export and sharing features

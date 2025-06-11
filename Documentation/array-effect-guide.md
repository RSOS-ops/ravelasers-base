# Array Effect Laser Behavior Documentation

## Overview
The `array_1.js` behavior creates a dynamic laser array effect where 4 initial lasers from screen corners evolve into a spectacular 32-laser array pattern over time.

## Animation Phases

### Phase 1: Static Phase (0-1 seconds)
- **Duration**: 1 second
- **Behavior**: 4 blue lasers shoot from screen corners to the 3D model target
- **Purpose**: Establishes the initial targeting pattern before transformation

### Phase 2: Array Spread Phase (1-4 seconds) 
- **Duration**: 3 seconds (1s to 4s total)
- **Behavior**: Each of the 4 original lasers transforms into 8 lasers (4 × 8 = 32 total)
- **Animation**: Smooth spreading using cubic easing function
- **Pattern**: Circular radial spread around each corner position

### Phase 3: Fully Expanded (4+ seconds)
- **Duration**: Indefinite
- **Behavior**: Maintains 32-laser array formation
- **Responsiveness**: Continues to track camera and target movement

## Technical Implementation

### Key Properties
```javascript
this.staticDuration = 1.0;        // 1 second static
this.spreadDuration = 3.0;        // 3 seconds to spread  
this.lasersPerCorner = 8;         // Each corner creates 8 lasers
this.spreadAngle = Math.PI / 4;   // 45 degrees spread angle
```

### Data Structure
- **originalLasers[]**: Stores the initial 4 corner lasers
- **arrayLasers[]**: Stores all 32 lasers in the expanded array
- **lasers[]**: Main tracking array for cleanup

### Animation Algorithm

#### Spread Calculation
Each laser's spread offset is calculated using:
```javascript
const angleStep = (2 * Math.PI) / this.lasersPerCorner; // 45° steps
const angle = laserIndex * angleStep;
const currentDistance = maxDistance * progress;

const offsetX = Math.cos(angle) * currentDistance;
const offsetY = Math.sin(angle) * currentDistance; 
const offsetZ = Math.sin(angle * 2) * currentDistance * 0.5; // Z variation
```

#### Easing Function
Uses cubic in-out easing for smooth animation:
```javascript
_easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}
```

## Visual Effect Description

### Initial State (0-1s)
```
Corner 1 ────────────┐
                     │
Corner 2 ────────────┤ → Target
                     │
Corner 3 ────────────┤
                     │
Corner 4 ────────────┘
```

### Expanding State (1-4s)
```
Corner 1 ╱╲╱╲╱╲╱╲───┐
        ╱ ╲ ╱ ╲ ╱ ╲ │
Corner 2 ╱╲╱╲╱╲╱╲───┤ → Target  
        ╱ ╲ ╱ ╲ ╱ ╲ │
Corner 3 ╱╲╱╲╱╲╱╲───┤
        ╱ ╲ ╱ ╲ ╱ ╲ │
Corner 4 ╱╲╱╲╱╲╱╲───┘
```

### Fully Expanded (4s+)
```
    ╱─╱─╱─╱─╱─╱─╱─╱
Corner 1 ╱╲╱╲╱╲╱╲─── Target
    ╲─╲─╲─╲─╲─╲─╲─╲

    ╱─╱─╱─╱─╱─╱─╱─╱  
Corner 2 ╱╲╱╲╱╲╱╲─── Target
    ╲─╲─╲─╲─╲─╲─╲─╲

[Pattern repeats for corners 3 & 4]
```

## Configuration Options

### Constructor Parameters
```javascript
config.laserColor    // Laser color (default: 0x0000ff - blue)
config.target        // Target object (optional)
```

### Customizable Values
- `this.staticDuration`: Duration of static phase
- `this.spreadDuration`: Duration of spreading animation  
- `this.lasersPerCorner`: Number of lasers per corner (default: 8)
- `maxDistance`: Maximum spread distance (default: 5.0 units)

## Usage Examples

### Basic Usage
```javascript
// Load the array behavior
load-behavior array_1

// Create new array behaviors
create laser_array_2
create my_array_effect
```

### Custom Configuration
```javascript
// Create with custom color
const arrayBehavior = new BehaviorArray_1({
    laserColor: 0xff0000  // Red lasers
});
```

## Performance Considerations

- **Laser Count**: 32 total lasers in final state
- **Update Frequency**: Runs every frame during animation phases
- **Memory Usage**: Stores position data for all lasers
- **Cleanup**: Properly removes all lasers on behavior change

## Related Behaviors

- **start.js**: Base behavior that array_1 extends
- **Create Command**: Generates new array behaviors automatically
- **Static Behaviors**: Non-animated alternatives in behaviors/ folder

## Troubleshooting

### Common Issues
1. **Lasers not appearing**: Check that target object exists
2. **Animation not starting**: Verify clock.getElapsedTime() is working
3. **Performance issues**: Consider reducing lasersPerCorner value
4. **Positioning errors**: Ensure camera has projectionMatrixInverse

### Debug Information
- Check `this.startTime` to verify animation timing
- Monitor `elapsed` value for phase transitions
- Verify `corners` array has 4 valid positions
- Confirm `targetPos` is not null/undefined

This array effect creates a stunning visual transformation from simple targeting lasers into a complex geometric pattern, perfect for dynamic laser show applications.

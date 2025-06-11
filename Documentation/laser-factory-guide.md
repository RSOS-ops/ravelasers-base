# Laser Factory User Guide

## Overview
The Laser Factory allows you to create, test, and iterate on new laser configurations dynamically without modifying any core files (`behaviors.js`, `banks.js`, etc.). You can use both the CLI interface and browser console.

## Quick Start

### 1. CLI Interface (Left Side Panel)
```
> help                          # Show all commands
> quick fast                    # Test fast laser movement
> quick chaos                   # Test chaotic laser setup
> test 0xff0000 5 15           # Test red lasers, 5 bounces, radius 15
> factory                       # Show factory console commands
```

### 2. Browser Console (F12)
```javascript
// Quick testing
factory.quickTest('fast')       // Test predefined presets
factory.quickTest('chaos')
factory.quickTest('zen')

// Custom configurations
factory.create({
    color: 0x00ff00,           // Green lasers
    bounces: 5,                // 5 bounces
    radius: 15,                // Origin radius 15
    speed: 0.05                // Fast movement (STILLNESS_LIMIT)
})

// Test and save
factory.test({ laserColor: 0xff0080, MAX_BOUNCES: 8 }, 'my_pink_lasers')
factory.save('my_pink_lasers')  // Save permanently

// Load existing configurations
factory.load('my_pink_lasers')
```

## Available Quick Test Presets

### Speed Tests
- `fast` - Very fast laser movement (STILLNESS_LIMIT: 0.05)
- `slow` - Slow laser movement (STILLNESS_LIMIT: 0.3)
- `ultra_fast` - Ultra fast movement (STILLNESS_LIMIT: 0.025)

### Visual Tests
- `fire` - Orange lasers with high brightness
- `ice` - Cyan lasers with high minimum brightness
- `rainbow` - Cyan lasers with many bounces

### Behavior Tests
- `bouncy` - Green lasers with 10 bounces
- `no_bounce` - Red lasers with 1 bounce
- `wide` - Purple lasers with large origin sphere
- `tight` - Yellow lasers with small origin sphere

### Pulse Tests
- `pulse_fast` - Magenta lasers with fast pulsing
- `pulse_slow` - Blue lasers with slow pulsing
- `bright` - White lasers with high brightness

### Complex Combinations
- `chaos` - High bounces, wide radius, fast pulse, pink color
- `zen` - Calm setup with teal color, slow movement

## Configuration Parameters

| Parameter | Description | Default | Example |
|-----------|-------------|---------|---------|
| `laserColor` | Hex color code | 0xff0000 | 0x00ff00 |
| `MAX_BOUNCES` | Number of bounces | 3 | 5 |
| `ORIGIN_SPHERE_RADIUS` | Laser origin radius | 10 | 15 |
| `STILLNESS_LIMIT` | Speed of movement (seconds) | 0.083 | 0.05 |
| `BASE_PULSE_FREQUENCY` | Pulse speed | 0.5 | 1.0 |
| `MIN_BRIGHTNESS` | Minimum brightness | 0.3 | 0.5 |
| `MAX_BRIGHTNESS` | Maximum brightness | 2.5 | 3.0 |
| `MAX_LENGTH` | Maximum laser length | 20 | 25 |

## Factory Methods Reference

### Testing Methods
```javascript
factory.test(config, name)              // Test configuration
factory.quickTest(preset)               // Test predefined preset
factory.create(options)                 // Create custom config easily
```

### Saving/Loading
```javascript
factory.save(testName, saveName)        // Save test permanently
factory.load(behaviorName)              // Load saved behavior
```

### Utilities
```javascript
factory.showColors()                    // Show color palette
factory.listTests()                     // List test configurations
factory.showActive()                    // Show active test config
factory.clearTests()                    // Clear all tests
```

### Advanced
```javascript
factory.compare(name1, name2)           // Compare configurations
factory.testSequence([configs])         // Test multiple configs
factory.export()                        // Export configurations
factory.import(data)                    // Import configurations
```

## Color Palette
```javascript
factory.colors = {
    red: 0xff0000,      green: 0x00ff00,    blue: 0x0000ff,
    cyan: 0x00ffff,     magenta: 0xff00ff,  yellow: 0xffff00,
    white: 0xffffff,    orange: 0xff8000,   purple: 0x8000ff,
    pink: 0xff0080,     lime: 0x80ff00,     teal: 0x008080,
    navy: 0x000080,     gold: 0xffd700,     silver: 0xc0c0c0
}
```

## Example Workflows

### 1. Creating a New Style
```javascript
// Start with a quick test
factory.quickTest('fast')

// Refine it
factory.create({
    color: factory.colors.purple,
    bounces: 7,
    radius: 12,
    speed: 0.04,
    pulse: 1.2
})

// Save it
factory.save('custom', 'my_purple_style')
```

### 2. Speed Comparison
```javascript
// Test different speeds
factory.test({ STILLNESS_LIMIT: 0.1 }, 'slow_test')
factory.test({ STILLNESS_LIMIT: 0.05 }, 'medium_test')
factory.test({ STILLNESS_LIMIT: 0.025 }, 'fast_test')

// Compare them
factory.compare('slow_test', 'fast_test')
```

### 3. Color Exploration
```javascript
// Test multiple colors quickly
const colors = ['red', 'green', 'blue', 'cyan', 'magenta']
colors.forEach(color => {
    factory.create({ color: factory.colors[color] })
    // Pause to observe, then continue
})
```

## Integration with Save/Load System

The factory integrates seamlessly with the existing save/load system:

1. **Test configurations** are temporary (stored in factory.testConfigs)
2. **Saved behaviors** are permanent (stored in SaveLoadManager)
3. **Banks** can contain factory-created behaviors
4. **CLI commands** work with both systems

## Tips

1. **Use CLI for quick tests**: `quick fast`, `test 0xff0000 5 15`
2. **Use console for complex configurations**: `factory.create({...})`
3. **Chain operations**: `factory.quickTest('chaos').save('chaos_v1')`
4. **Save frequently**: Test configurations are lost on page refresh
5. **Experiment with speed**: Lower STILLNESS_LIMIT = faster movement
6. **Try combinations**: Mix different parameters for unique effects

## Troubleshooting

**Factory not available?**
- Refresh the page and wait for "LaserFactory ready!" message
- Check browser console for errors

**Changes not visible?**
- Make sure you're calling `factory.test()` or similar
- Previous configurations might be cached - try `factory.clearTests()`

**Performance issues?**
- Reduce MAX_BOUNCES for better performance
- Lower BASE_PULSE_FREQUENCY for smoother animation
- Use smaller ORIGIN_SPHERE_RADIUS for tighter effects

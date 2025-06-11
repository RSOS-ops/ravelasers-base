# Restructured Laser System Architecture

## Overview
The laser system has been restructured so that:
- **LaserSystem.js** handles ALL laser creation
- **Behavior files** are simple, human-editable configuration files
- **SaveLoadManager** works with simple configuration objects

## Key Changes

### 1. LaserSystem.js - The Laser Factory
LaserSystem.js now contains complete laser creation logic:
- `createLaser(config)` - Creates a single laser with given config
- `createLaserShow(config)` - Creates multiple lasers for a complete show
- `clearAllLasers()` - Removes all lasers from scene
- `updateLaser(laser, config)` - Updates existing laser properties

### 2. Behavior Files - Simple Configurations
Behavior files (like `red_default.js`, `blue_bounce.js`) are now simple config objects:

```javascript
// behaviors/red_default.js
export const config = {
    laserColor: 0xff0000,          // Red color
    laserCount: 4,                 // Number of lasers  
    MAX_BOUNCES: 3,                // Number of bounces
    ORIGIN_SPHERE_RADIUS: 10,      // Spread from center
    STILLNESS_LIMIT: 0.083,        // Movement speed
    BASE_PULSE_FREQUENCY: 0.5,     // Pulse speed
    MIN_BRIGHTNESS: 0.3,           // Min brightness
    MAX_BRIGHTNESS: 2.5,           // Max brightness
    MAX_LENGTH: 20                 // Laser length
};
```

### 3. Easy to Edit and Copy
- No complex JavaScript classes
- Clear parameter names with comments
- Easy to copy/paste and modify
- Human-readable configuration values

## Creating New Laser Looks

### Method 1: Copy and Edit Configuration Files
1. Copy an existing config file (e.g., `red_default.js`)
2. Change the `config` values:
   - `laserColor`: 0x?????? (hex color)
   - `laserCount`: 1-10 (number of lasers)
   - `STILLNESS_LIMIT`: 0.01-0.5 (lower = faster)
   - `MAX_BOUNCES`: 1-15 (more bounces = more complex)
   - `ORIGIN_SPHERE_RADIUS`: 5-30 (spread)

### Method 2: Use the Factory System  
```javascript
// In browser console
factory.create({
    color: 0x00ff00,      // Green
    bounces: 5,           // 5 bounces
    radius: 15,           // Wide spread
    speed: 0.05           // Fast movement
})
factory.save('my_green_config')
```

### Method 3: Direct SaveLoadManager
```javascript
// In browser console  
presetManager.saveBehavior('my_style', {
    laserColor: 0xff0080,     // Pink
    laserCount: 6,            // 6 lasers
    MAX_BOUNCES: 8,           // Many bounces
    STILLNESS_LIMIT: 0.03     // Very fast
})
```

## Configuration Parameters

| Parameter | Description | Range | Example |
|-----------|-------------|-------|---------|
| `laserColor` | Hex color code | 0x000000-0xffffff | 0xff0000 (red) |
| `laserCount` | Number of lasers | 1-10 | 4 |
| `MAX_BOUNCES` | Laser bounces | 1-15 | 3 |
| `ORIGIN_SPHERE_RADIUS` | Start spread | 5-30 | 10 |
| `STILLNESS_LIMIT` | Movement speed | 0.01-0.5 | 0.083 |
| `BASE_PULSE_FREQUENCY` | Pulse speed | 0.1-2.0 | 0.5 |
| `MIN_BRIGHTNESS` | Min brightness | 0.1-1.0 | 0.3 |
| `MAX_BRIGHTNESS` | Max brightness | 1.0-5.0 | 2.5 |
| `MAX_LENGTH` | Laser length | 10-50 | 20 |

## Benefits of This Structure

1. **Separation of Concerns**: LaserSystem handles creation, behaviors handle configuration
2. **Easy Editing**: Behavior files are simple to read and modify
3. **Copy/Paste Friendly**: No complex class inheritance
4. **Version Control Friendly**: Simple config files diff cleanly
5. **User Friendly**: Non-programmers can easily create new laser looks
6. **Maintainable**: Core laser logic is centralized in LaserSystem

## Example Workflow

1. **Find a config you like**: Look in `behaviors/` folder
2. **Copy the file**: Create `my_custom.js`
3. **Edit values**: Change colors, speed, etc.
4. **Test it**: Use factory or console commands
5. **Save permanently**: Use SaveLoadManager if you like it

This structure makes it easy for anyone to create new laser configurations without touching the complex laser creation code.

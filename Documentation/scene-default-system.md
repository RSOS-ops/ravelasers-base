# Scene-Default System Documentation

## Overview
The scene-default system provides automatic persistence of your current laser setup across page reloads and application restarts. Whatever you have loaded will automatically be restored when you return.

## How It Works

### Automatic Scene-Default Setting
- **Any time you load a behavior**: `presetManager.loadBehavior('my_behavior')`
- **Any time you load a bank**: `presetManager.loadBank('my_bank')`
- **The loaded item automatically becomes your scene-default**

### Priority System
When the page loads, the system checks in this order:
1. **Scene-default** (what you loaded last) - **Highest Priority**
2. **Regular default** (manually set fallback) - **Fallback**
3. **Nothing** (clean start) - **No defaults found**

## Console Commands

### Check Current State
```javascript
presetManager.showStatus()              // Shows both scene-default and regular default
presetManager.getCurrentSceneState()    // Returns scene-default object
```

### Clear Scene-Default
```javascript
presetManager.clearSceneDefault()       // Clear scene-default only
presetManager.clearAll()                // Clear all behaviors and scene-default
```

## CLI Commands

### Status and Information
```
> status                    # Show both scene-default and regular default
> scene                     # Show current scene-default
> default                   # Show regular default
```

### Management
```
> scene clear               # Clear scene-default
> clear-all                 # Clear all behaviors and scene-default
> default clear             # Clear regular default (rarely needed)
```

## Examples

### Basic Usage
```javascript
// Load something - automatically becomes scene-default
presetManager.loadBehavior('blue_bounce')

// Check what will reload
presetManager.showStatus()
// Output: Scene-default: behavior "blue_bounce"

// Page reload → blue_bounce automatically loads
```

### Advanced Usage
```javascript
// Load different things - each becomes scene-default
presetManager.loadBehavior('red_default')    // Scene-default: red_default
presetManager.loadBank('chaos_mode')         // Scene-default: chaos_mode  
presetManager.loadBehavior('green_lasers')   // Scene-default: green_lasers

// Fresh start
presetManager.clearAll()
// Next reload will be empty until you load something new
```

### CLI Workflow
```
> load-behavior red_default      # Scene-default set automatically
> helpers-on                     # Helper state saved to scene-default
> status                         # Check current state (shows helpers: ON)
> load-bank chaos_mode           # Scene-default updated automatically
> scene                          # Shows current scene-default
> clear-all                      # Fresh start (clears helpers too)
```

### Helper Persistence Example
```
> helpers-on                     # Turn on helpers and save state
> status                         # Shows "Light helpers: ON"
# Page reload → helpers automatically restored to ON

> helpers-off                    # Turn off helpers and save state  
# Page reload → helpers automatically restored to OFF

> clear-all                      # Reset everything including helper state
# Page reload → helpers back to default (not set)
```

## Benefits

1. **Automatic**: No need to manually set defaults
2. **Intuitive**: Whatever you're using becomes your default
3. **Persistent**: Survives page reloads and application restarts
4. **Flexible**: Easy to clear for fresh starts
5. **Hierarchical**: Scene-default → Regular default → Nothing
6. **Complete**: Includes behaviors, banks, and UI state (like helper visibility)

## Technical Details

### Storage
- Scene-defaults are stored in browser localStorage
- Keys: `ravelasers_scene_default_behavior`, `ravelasers_scene_default_bank`, `ravelasers_scene_default_type`, `ravelasers_scene_default_helpers`
- Automatically cleared if referenced behavior/bank no longer exists
- Helper visibility state persists independently of behaviors/banks

### Integration
- Automatically called by `PresetManager.loadBehavior()` and `PresetManager.loadBank()`
- Helper state automatically saved by CLI `helpers-on`/`helpers-off` commands
- Checked during startup in `PresetManager.loadSavedDefault()`
- CLI commands provide easy access and management

### Backwards Compatibility
- Regular defaults still work as fallbacks
- Existing save/load functionality unchanged
- Legacy presets continue to work

This system ensures that your laser setup is always preserved exactly as you left it!

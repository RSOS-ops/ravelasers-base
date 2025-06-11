# Create Command Implementation Guide

## Overview
The `create` command allows users to clone the "start" behavior into a new behavior file and register it with all necessary components. The syntax is `create <new_filename>` and users can load each new behavior through the CLI after creation.

## Usage
```
create <new_filename>
```

Example:
```
create array_1
create my_laser_setup
create test_behavior
```

## What the Command Does

1. **Validates Input**: Checks if the filename is valid (letters, numbers, underscores only)
2. **Checks for Duplicates**: Ensures the behavior name doesn't already exist
3. **Generates Code**: Creates a complete behavior class based on the "start" behavior template
4. **Dynamic Registration**: Attempts to register the behavior in memory for immediate use
5. **Auto-Save**: Saves the behavior to localStorage for persistence
6. **Provides Code**: Outputs the complete code for manual file creation

## Code Generation

The command generates a complete behavior file that includes:

- **Class Definition**: `BehaviorNewname` class extending the start behavior pattern
- **Constructor**: Configurable laser color and initialization
- **init() Method**: Sets up 4 lasers from screen corners to 3D model
- **update() Method**: Updates laser positions each frame
- **_createLaser() Helper**: Creates THREE.js Line objects for lasers
- **_getScreenCorners() Helper**: Calculates screen corner positions with defensive programming
- **cleanup() Method**: Properly removes lasers from scene

## Dynamic Registration

The command attempts to register behaviors dynamically using:

1. **Blob Creation**: Creates a JavaScript blob containing the behavior code
2. **Dynamic Import**: Uses ES6 dynamic imports to load the behavior
3. **Global Registration**: Adds to `window.behaviors` and `window.savedBehaviorConfigs`
4. **Fallback**: If dynamic registration fails, provides manual registration instructions

## File Structure

Generated behavior files follow this pattern:

```javascript
// BehaviorNewname.js - Four blue lasers from corners targeting the 3D model (clone of start.js)
import * as THREE from 'three';

export class BehaviorNewname {
    constructor(config = {}) {
        this.laserColor = config.laserColor || 0x0000ff;
        this.lasers = [];
        this.target = config.target || null;
        this.id = 'newname';
    }

    init(laserSystem) { /* ... */ }
    update(deltaTime, clock, laserSystem) { /* ... */ }
    _createLaser(start, end) { /* ... */ }
    _getScreenCorners(camera, scene) { /* ... */ }
    cleanup(laserSystem) { /* ... */ }
}

export default BehaviorNewname;
```

## Integration Steps

To fully integrate a created behavior:

1. **Use the Command**: `create my_behavior`
2. **Copy Generated Code**: Save the output code to `behaviors/my_behavior.js`
3. **Update behaviors.js**: Add import and registration:
   ```javascript
   import { BehaviorMy_behavior } from './my_behavior.js';
   // Add to behaviors object:
   my_behavior: (config = {}) => new BehaviorMy_behavior(config),
   // Add to savedBehaviorConfigs:
   my_behavior: { laserColor: 0x0000ff, _behaviorType: 'my_behavior' }
   ```
4. **Load the Behavior**: `load-behavior my_behavior`

## Features

- **Defensive Programming**: Handles undefined cameras, targets, and positions gracefully
- **Fallback Values**: Provides default positions when camera projection fails
- **Memory Management**: Proper cleanup of THREE.js objects
- **Persistence**: Auto-saves to localStorage for immediate availability
- **Code Generation**: Complete, working behavior file ready for use

## Testing

Use the test file `test-create-command.html` to test the create command:

1. Open the test file in a browser
2. Type `create test_behavior` in the input field
3. Press Enter to see the command output
4. The behavior will be generated and ready for use

## Error Handling

The command handles various error conditions:

- **Invalid filenames**: Only alphanumeric and underscore characters allowed
- **Duplicate names**: Prevents overwriting existing behaviors
- **Dynamic registration failures**: Provides fallback instructions
- **Missing dependencies**: Checks for PresetManager availability

## Implementation Details

### CLI.js Methods Added:
- `createBehavior(args)`: Main command handler
- `_capitalize(str)`: Helper for class name generation
- `_generateBehaviorCode(newName, className)`: Template code generator
- `_registerBehaviorInMemory(newName, className, newBehaviorCode)`: Dynamic registration

### behaviors.js Updates:
- Added global window object exposure for dynamic registration
- Support for runtime behavior addition

This implementation provides a complete "create" command that clones the start behavior pattern into new behavior files with full CLI integration and dynamic loading capabilities.

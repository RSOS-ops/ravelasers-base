// Behavior Index - Central registry of all available behaviors
// Each behavior is stored in its own separate file

// Import all individual behavior classes
import { BehaviorDefault } from './BehaviorDefault.js';
import { BehaviorRedDefault } from './red_default.js';
import { BehaviorGreenLasers } from './green_lasers.js';
import { BehaviorBlueBounce } from './blue_bounce.js';
import { BehaviorYellowWide } from './yellow_wide.js';
import { BehaviorWireframe } from './wireframe.js'; // Updated import

// Factory functions for creating behavior instances
export const behaviors = {
    default: (config = {}) => new BehaviorDefault(config),
    red_default: (config = {}) => new BehaviorRedDefault(config),
    green_lasers: (config = {}) => new BehaviorGreenLasers(config),
    blue_bounce: (config = {}) => new BehaviorBlueBounce(config),
    yellow_wide: (config = {}) => new BehaviorYellowWide(config),
    wireframe: (config = {}) => new BehaviorWireframe(config), // Registered wireframe
};

// Predefined configurations for saved behaviors
export const savedBehaviorConfigs = {
    red_default: { laserColor: 0xff0000, _behaviorType: 'default' },
    green_lasers: { laserColor: 0x00ff00, _behaviorType: 'default' },
    blue_bounce: { laserColor: 0x0000ff, MAX_BOUNCES: 5, _behaviorType: 'default' },
    yellow_wide: { laserColor: 0xffff00, ORIGIN_SPHERE_RADIUS: 15, _behaviorType: 'default' },
    wireframe: { laserColor: 0x00ff00, _behaviorType: 'wireframe' }
};

// Helper function to get all available behavior names
export function getAllBehaviorNames() {
    return Object.keys(behaviors);
}

// Helper function to check if a behavior exists
export function behaviorExists(name) {
    return name in behaviors;
}

// Helper function to create a behavior instance by name
export function createBehavior(name, config = {}) {
    if (!behaviorExists(name)) {
        console.error(`Behavior "${name}" not found!`);
        return null;
    }
    return behaviors[name](config);
}

// Behavior Index - Central registry of all available behaviors
// Each behavior is stored in its own separate file

// Import all individual behavior classes
import { BehaviorDefault } from './BehaviorDefault.js';
import { BehaviorRedDefault } from './red_default.js';
import { BehaviorGreenLasers } from './green_lasers.js';
import { BehaviorBlueBounce } from './blue_bounce.js';
import { BehaviorYellowWide } from './yellow_wide.js';
import { BehaviorStart } from './start.js';
import { BehaviorArray_1 } from './array_1.js'; // Example created behavior

// Factory functions for creating behavior instances
export const behaviors = {
    default: (config = {}) => new BehaviorDefault(config),
    red_default: (config = {}) => new BehaviorRedDefault(config),
    green_lasers: (config = {}) => new BehaviorGreenLasers(config),
    blue_bounce: (config = {}) => new BehaviorBlueBounce(config),
    yellow_wide: (config = {}) => new BehaviorYellowWide(config),
    start: (config = {}) => new BehaviorStart(config),
    array_1: (config = {}) => new BehaviorArray_1(config), // Example created behavior
};

// Predefined configurations for saved behaviors
export const savedBehaviorConfigs = {
    red_default: { laserColor: 0xff0000, _behaviorType: 'default' },
    green_lasers: { laserColor: 0x00ff00, _behaviorType: 'default' },
    blue_bounce: { laserColor: 0x0000ff, MAX_BOUNCES: 5, _behaviorType: 'default' },
    yellow_wide: { laserColor: 0xffff00, ORIGIN_SPHERE_RADIUS: 15, _behaviorType: 'default' },
    start: { laserColor: 0x0000ff, _behaviorType: 'start' },
    array_1: { laserColor: 0x0000ff, _behaviorType: 'array_1' } // Example created behavior
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

// Make behaviors and savedBehaviorConfigs available globally for dynamic registration
if (typeof window !== 'undefined') {
    window.behaviors = behaviors;
    window.savedBehaviorConfigs = savedBehaviorConfigs;
}

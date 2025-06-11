// Behavior Index - Configuration-based behaviors
// Each behavior is now a simple configuration file

// Import configurations from behavior files
import { config as redDefaultConfig } from './red_default.js';
import { config as greenLasersConfig } from './green_lasers.js';
import { config as blueBounceConfig } from './blue_bounce.js';
import { config as yellowWideConfig } from './yellow_wide.js';

// Import the main behavior class from LaserEngine.js
import { LaserEngine } from '../LaserEngine.js';

// Factory functions for creating behavior instances
// Now these create LaserEngine instances with different configs
export const behaviors = {
    default: (config = {}) => new LaserEngine(config),
    red_default: (config = {}) => new LaserEngine({ ...redDefaultConfig, ...config }),
    green_lasers: (config = {}) => new LaserEngine({ ...greenLasersConfig, ...config }),
    blue_bounce: (config = {}) => new LaserEngine({ ...blueBounceConfig, ...config }),
    yellow_wide: (config = {}) => new LaserEngine({ ...yellowWideConfig, ...config }),
};

// Predefined configurations for saved behaviors (kept for backward compatibility)
export const savedBehaviorConfigs = {
    red_default: redDefaultConfig,
    green_lasers: greenLasersConfig,
    blue_bounce: blueBounceConfig,
    yellow_wide: yellowWideConfig,
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

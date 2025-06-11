// Behavior Index - Configuration-based behaviors
// Each behavior is now a simple configuration file

import { config as redDefaultConfig } from './behaviors/red_default.js';
import { config as greenLasersConfig } from './behaviors/green_lasers.js';
import { config as blueBounceConfig } from './behaviors/blue_bounce.js';
import { config as yellowWideConfig } from './behaviors/yellow_wide.js';
import { config as fastPurpleConfig } from './behaviors/fast_purple_example.js';
import { config as calmTealConfig } from './behaviors/calm_teal_example.js';
import { BehaviorArray_1 } from './behaviors/array_1.js';
import { BehaviorWireframe } from './behaviors/wireframe.js';
import { BehaviorStaticStart } from './behaviors/static_red.js';
import { BehaviorStart } from './behaviors/start.js';
import { LaserEngine } from './LaserEngine.js';

export const behaviors = {
    default: (config = {}) => new LaserEngine(config),
    red_default: (config = {}) => new LaserEngine({ ...redDefaultConfig, ...config }),
    green_lasers: (config = {}) => new LaserEngine({ ...greenLasersConfig, ...config }),
    blue_bounce: (config = {}) => new LaserEngine({ ...blueBounceConfig, ...config }),
    yellow_wide: (config = {}) => new LaserEngine({ ...yellowWideConfig, ...config }),
    fast_purple: (config = {}) => new LaserEngine({ ...fastPurpleConfig, ...config }),
    calm_teal: (config = {}) => new LaserEngine({ ...calmTealConfig, ...config }),
    array_1: (config = {}) => new BehaviorArray_1(config),
    wireframe: (config = {}) => new BehaviorWireframe(config),
    static_red: (config = {}) => new BehaviorStaticStart(config),
    start: (config = {}) => new BehaviorStart(config),
    // ...add more registrations as needed...
};

export function getAllBehaviorNames() {
    return Object.keys(behaviors);
}
export function behaviorExists(name) {
    return name in behaviors;
}
export function createBehavior(name, config = {}) {
    if (!behaviorExists(name)) {
        console.error(`Behavior "${name}" not found!`);
        return null;
    }
    return behaviors[name](config);
}

if (typeof window !== 'undefined') {
    window.behaviors = behaviors;
}

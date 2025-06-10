import { behaviors } from './behaviors/behaviors.js';

// --- Banks: These are the actual bank definitions ---
export const banks = {
    // rave_mode
    bank1: () => [
        behaviors.default()
    ],

    // chill_mode
    bank2: () => [
        behaviors.default({ laserColor: 0x00ff00 })
    ],

    // chaos_mode (along with bank1 and bank2)
    bank3: () => [
        behaviors.default({ laserColor: 0x0000ff, MAX_BOUNCES: 5 })
    ],

    // Not referenced in savedBankConfigs
    bank4: () => [
        behaviors.default({ laserColor: 0xffff00, ORIGIN_SPHERE_RADIUS: 15 })
    ],

    // Not referenced in savedBankConfigs
    bank5: () => [
        behaviors.default(),
        behaviors.default({ laserColor: 0x00ff00, ORIGIN_SPHERE_RADIUS: 15 }),
        behaviors.default({ laserColor: 0x0000ff, ORIGIN_SPHERE_RADIUS: 5 })
    ]
};

// --- Saved Bank Configs: These map names to arrays of behavior config names ---
export const savedBankConfigs = {
    // rave_mode uses the config for red_default (bank1)
    rave_mode: ['red_default'],
    // chill_mode uses the config for green_lasers (bank2)
    chill_mode: ['green_lasers'],
    // chaos_mode uses configs for red_default, green_lasers, blue_bounce (bank1, bank2, bank3)
    chaos_mode: ['red_default', 'green_lasers', 'blue_bounce']
};

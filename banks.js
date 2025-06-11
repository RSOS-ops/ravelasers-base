import { behaviors } from './behaviors.js';

// --- Banks: These are the actual bank definitions ---
export const banks = {
    // default - basic single red laser behavior (fallback if no saved default)
    default: () => [
        behaviors.red_default()
    ],

    // rave_mode - uses red_default saved behavior
    bank1: () => [
        behaviors.red_default()
    ],

    // chill_mode - uses green_lasers saved behavior
    bank2: () => [
        behaviors.green_lasers()
    ],

    // chaos_mode - uses blue_bounce saved behavior
    bank3: () => [
        behaviors.blue_bounce()
    ],

    // yellow_wide bank
    bank4: () => [
        behaviors.yellow_wide()
    ],

    // Multi-behavior bank example
    bank5: () => [
        behaviors.default(),
        behaviors.green_lasers({ laserColor: 0x00ff00, ORIGIN_SPHERE_RADIUS: 15 }),
        behaviors.blue_bounce({ laserColor: 0x0000ff, ORIGIN_SPHERE_RADIUS: 5 })
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

// Helper function to get bank by name
export const getBankByName = (bankName) => {
    return banks[bankName] || banks.default;
};

// Helper function to get all available bank names
export const getAvailableBanks = () => {
    return Object.keys(banks);
};

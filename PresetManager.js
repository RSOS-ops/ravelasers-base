// PresetManager.js
import { banks } from './banks.js';

export class PresetManager {
    constructor(laserSystem) {
        this.laserSystem = laserSystem;
        
        // Behaviors: Individual parameter configurations
        this.behaviors = {
            'intense_red': {
                MAX_BOUNCES: 5,
                MAX_RAVE_LASER_SYSTEM_1_LENGTH: 25,
                BASE_RAVE_LASER_SYSTEM_1_PULSE_FREQUENCY: 1.0,
                laserColor: "0xff0000"
            },
            'smooth_blue': {
                MAX_BOUNCES: 2,
                MAX_RAVE_LASER_SYSTEM_1_LENGTH: 15,
                BASE_RAVE_LASER_SYSTEM_1_PULSE_FREQUENCY: 0.3,
                laserColor: "0x0066ff"
            },
            'rapid_green': {
                MAX_BOUNCES: 8,
                BASE_RAVE_LASER_SYSTEM_1_PULSE_FREQUENCY: 2.0,
                laserColor: "0x00ff00"
            }
        };
        
        // Banks: Collections of behaviors
        this.banks = {
            'bank1': ['intense_red'],
            'bank2': ['smooth_blue', 'rapid_green'],
            'bank3': ['intense_red', 'smooth_blue']
        };
        
        // Presets: Collections of banks
        this.presets = {
            'rave_mode': ['bank1', 'bank2'],
            'chill_mode': ['bank3'],
            'chaos_mode': ['bank1', 'bank2', 'bank3']
        };
    }
    
    applyPreset(presetName) {
        const banks = this.presets[presetName];
        if (!banks) {
            console.error(`Preset '${presetName}' not found`);
            return;
        }
        
        // Apply all banks in the preset
        banks.forEach(bankName => this.applyBank(bankName));
    }
    
    applyBank(bankName) {
        const behaviors = this.banks[bankName];
        if (!behaviors) {
            console.error(`Bank '${bankName}' not found`);
            return;
        }
        
        // Apply all behaviors in the bank
        behaviors.forEach(behaviorName => this.applyBehavior(behaviorName));
    }
    
    applyBehavior(behaviorName) {
        const config = this.behaviors[behaviorName];
        if (!config) {
            console.error(`Behavior '${behaviorName}' not found`);
            return;
        }
        
        this.laserSystem.applyPreset(config);
    }
}

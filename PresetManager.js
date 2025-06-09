// PresetManager.js
import { banks } from './banks.js';

export class PresetManager {
    constructor(laserSystem) {
        this.laserSystem = laserSystem;
        
        // Current bank being applied
        this.bank = {
            current: null
        };
        
        // Presets: Collections of bank names
        this.presets = {
            'rave_mode': ['bank1'],
            'chill_mode': ['bank2'],
            'chaos_mode': ['bank1', 'bank2', 'bank3']
        };
    }
    
    applyPreset(presetName) {
        const bankNames = this.presets[presetName];
        if (!bankNames) {
            console.error(`Preset '${presetName}' not found`);
            return;
        }
        
        // Clear existing behaviors first
        this.laserSystem.clearAllBehaviors();
        
        // Apply all banks in the preset
        bankNames.forEach(bankName => this.applyBank(bankName));
    }
    
    applyBank(bankName) {
        const bankFunction = banks[bankName];
        if (!bankFunction) {
            console.error(`Bank '${bankName}' not found`);
            return;
        }
        
        // Set current bank
        this.bank.current = bankName;
        
        // Call the bank function to get array of behaviors
        const behaviorsArray = bankFunction();
        
        // Add each behavior to the laser system
        behaviorsArray.forEach(behavior => {
            this.laserSystem.addBehavior(behavior);
        });
        
        console.log(`PresetManager: Applied bank '${bankName}' with ${behaviorsArray.length} behaviors`);
    }
}

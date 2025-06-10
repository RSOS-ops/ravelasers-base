// PresetManager.js
import { banks } from './banks.js';
import { behaviors } from './behaviors.js';
import { SaveLoadManager } from './SaveLoadManager.js';

export class PresetManager {
    constructor(laserSystem) {
        this.laserSystem = laserSystem;
        this.saveLoadManager = new SaveLoadManager();
        
        // Current bank being applied
        this.bank = {
            current: null
        };
        
        // Presets: Collections of bank names (keeping for backward compatibility)
        this.presets = {
            'rave_mode': ['bank1'],
            'chill_mode': ['bank2'],
            'chaos_mode': ['bank1', 'bank2', 'bank3']
        };
    }

    // ====== NEW SIMPLE METHODS ======

    /**
     * Save current laser setup as a behavior
     * @param {string} name - Name to save as
     * @param {object} config - Behavior configuration
     */
    saveBehavior(name, config) {
        return this.saveLoadManager.saveBehavior(name, config);
    }

    /**
     * Load and apply a saved behavior
     * @param {string} name - Name of behavior to load
     */
    loadBehavior(name) {
        const config = this.saveLoadManager.loadBehavior(name);
        if (config) {
            this.laserSystem.clearAllBehaviors();
            const behavior = behaviors.default(config);
            this.laserSystem.addBehavior(behavior);
            console.log(`✅ Applied behavior: "${name}"`);
            return true;
        }
        return false;
    }

    /**
     * Save a collection of behaviors as a bank
     * @param {string} bankName - Name for the bank
     * @param {string[]} behaviorNames - Array of behavior names
     */
    saveBank(bankName, behaviorNames) {
        return this.saveLoadManager.saveBank(bankName, behaviorNames);
    }

    /**
     * Load and apply a saved bank
     * @param {string} bankName - Name of bank to load
     */
    loadBank(bankName) {
        const behaviorNames = this.saveLoadManager.loadBank(bankName);
        if (behaviorNames) {
            this.laserSystem.clearAllBehaviors();
            
            for (const behaviorName of behaviorNames) {
                const config = this.saveLoadManager.loadBehavior(behaviorName);
                if (config) {
                    const behavior = behaviors.default(config);
                    this.laserSystem.addBehavior(behavior);
                }
            }
            
            this.bank.current = bankName;
            console.log(`✅ Applied bank: "${bankName}"`);
            return true;
        }
        return false;
    }

    /**
     * Show what's currently saved
     */
    showSaved() {
        this.saveLoadManager.showSummary();
    }

    /**
     * List available behaviors
     */
    listBehaviors() {
        return this.saveLoadManager.listBehaviors();
    }

    /**
     * List available banks
     */
    listBanks() {
        return this.saveLoadManager.listBanks();
    }

    /**
     * Get access to saveLoadManager for advanced operations
     */
    getSaveLoadManager() {
        return this.saveLoadManager;
    }

    // ====== LEGACY METHODS (for backward compatibility) ======
    
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

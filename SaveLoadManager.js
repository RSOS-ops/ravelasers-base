// SaveLoadManager.js
// Simple save/load system for laser configurations

import { behaviors, savedBehaviorConfigs } from './behaviors/behaviors.js';
import { banks, savedBankConfigs } from './banks.js';

export class SaveLoadManager {    constructor() {
        this.savedBehaviors = new Map(Object.entries(savedBehaviorConfigs));
        this.savedBanks = new Map(Object.entries(savedBankConfigs));
        
        // Default persistence keys
        this.DEFAULT_BEHAVIOR_KEY = 'ravelasers_default_behavior';
        this.DEFAULT_BANK_KEY = 'ravelasers_default_bank';
        this.DEFAULT_TYPE_KEY = 'ravelasers_default_type'; // 'behavior' or 'bank'
          // Scene-default persistence keys (for current session state)
        this.SCENE_DEFAULT_BEHAVIOR_KEY = 'ravelasers_scene_default_behavior';
        this.SCENE_DEFAULT_BANK_KEY = 'ravelasers_scene_default_bank';
        this.SCENE_DEFAULT_TYPE_KEY = 'ravelasers_scene_default_type'; // 'behavior' or 'bank'
        this.SCENE_DEFAULT_HELPERS_KEY = 'ravelasers_scene_default_helpers'; // true/false for helper visibility
    }

    // ====== BEHAVIOR MANAGEMENT ======
      /**
     * Save a behavior configuration
     * @param {string} name - Name to save the behavior as
     * @param {object} config - Behavior configuration object
     * @param {string} behaviorType - Type of behavior (default, start, array_1, etc.)
     */
    saveBehavior(name, config, behaviorType = 'default') {
        const behaviorData = {
            ...config,
            _behaviorType: behaviorType
        };
        this.savedBehaviors.set(name, behaviorData);
        console.log(`💾 Saved behavior: "${name}" (type: ${behaviorType})`);
        this.showSavedBehaviors();
    }    /**
     * Load a behavior configuration
     * @param {string} name - Name of the behavior to load
     * @returns {object|null} - Behavior config or null if not found
     */
    loadBehavior(name) {
        const config = this.savedBehaviors.get(name);
        if (config) {
            console.log(`📁 Loaded behavior: "${name}"`);
            
            // Set as default for persistence
            this.setDefaultBehavior(name);
            
            return { ...config };
        } else {
            console.warn(`❌ Behavior "${name}" not found!`);
            return null;
        }
    }

    /**
     * List all saved behaviors
     */
    listBehaviors() {
        console.log("📋 Saved Behaviors:");
        if (this.savedBehaviors.size === 0) {
            console.log("  (none saved)");
        } else {
            this.savedBehaviors.forEach((config, name) => {
                console.log(`  • ${name} (color: ${config.laserColor ? '#' + config.laserColor.toString(16) : 'default'})`);
            });
        }
        return Array.from(this.savedBehaviors.keys());
    }

    /**
     * Delete a saved behavior
     */
    deleteBehavior(name) {
        if (this.savedBehaviors.delete(name)) {
            console.log(`🗑️ Deleted behavior: "${name}"`);
        } else {
            console.warn(`❌ Behavior "${name}" not found!`);
        }
    }

    // ====== BANK MANAGEMENT ======

    /**
     * Save a bank (collection of behavior names)
     * @param {string} bankName - Name to save the bank as
     * @param {string[]} behaviorNames - Array of behavior names in this bank
     */
    saveBank(bankName, behaviorNames) {
        // Validate that all behaviors exist
        const missingBehaviors = behaviorNames.filter(name => !this.savedBehaviors.has(name));
        if (missingBehaviors.length > 0) {
            console.error(`❌ Cannot save bank "${bankName}". Missing behaviors: ${missingBehaviors.join(', ')}`);
            return false;
        }

        this.savedBanks.set(bankName, [...behaviorNames]);
        console.log(`💾 Saved bank: "${bankName}" with behaviors: [${behaviorNames.join(', ')}]`);
        this.showSavedBanks();
        return true;
    }    /**
     * Load a bank
     * @param {string} bankName - Name of the bank to load
     * @returns {string[]|null} - Array of behavior names or null if not found
     */
    loadBank(bankName) {
        const behaviorNames = this.savedBanks.get(bankName);
        if (behaviorNames) {
            console.log(`📁 Loaded bank: "${bankName}" with behaviors: [${behaviorNames.join(', ')}]`);
            
            // Set as default for persistence
            this.setDefaultBank(bankName);
            
            return [...behaviorNames];
        } else {
            console.warn(`❌ Bank "${bankName}" not found!`);
            return null;
        }
    }

    /**
     * List all saved banks
     */
    listBanks() {
        console.log("📋 Saved Banks:");
        if (this.savedBanks.size === 0) {
            console.log("  (none saved)");
        } else {
            this.savedBanks.forEach((behaviorNames, bankName) => {
                console.log(`  • ${bankName}: [${behaviorNames.join(', ')}]`);
            });
        }
        return Array.from(this.savedBanks.keys());
    }

    /**
     * Delete a saved bank
     */
    deleteBank(bankName) {
        if (this.savedBanks.delete(bankName)) {
            console.log(`🗑️ Deleted bank: "${bankName}"`);
        } else {
            console.warn(`❌ Bank "${bankName}" not found!`);
        }
    }

    // ====== UTILITY METHODS ======

    /**
     * Show a quick summary of saved items
     */
    showSummary() {
        console.log("\n=== SAVE/LOAD SUMMARY ===");
        console.log(`Behaviors: ${this.savedBehaviors.size}`);
        console.log(`Banks: ${this.savedBanks.size}`);
        this.listBehaviors();
        this.listBanks();
        console.log("========================\n");
    }

    /**
     * Quick display of saved behaviors
     */
    showSavedBehaviors() {
        const names = Array.from(this.savedBehaviors.keys());
        console.log(`📁 Behaviors: [${names.join(', ')}]`);
    }

    /**
     * Quick display of saved banks
     */
    showSavedBanks() {
        const names = Array.from(this.savedBanks.keys());
        console.log(`📁 Banks: [${names.join(', ')}]`);
    }

    /**
     * Export all configurations as JSON
     */
    exportToJSON() {
        const data = {
            behaviors: Object.fromEntries(this.savedBehaviors),
            banks: Object.fromEntries(this.savedBanks),
            exported: new Date().toISOString()
        };
        console.log("📤 Export data:", JSON.stringify(data, null, 2));
        return data;
    }

    /**
     * Import configurations from JSON
     */
    importFromJSON(jsonData) {
        try {
            if (jsonData.behaviors) {
                this.savedBehaviors = new Map(Object.entries(jsonData.behaviors));
            }
            if (jsonData.banks) {
                this.savedBanks = new Map(Object.entries(jsonData.banks));
            }
            console.log("📥 Successfully imported configurations");
            this.showSummary();
        } catch (error) {
            console.error("❌ Import failed:", error);
        }
    }

    // ====== DEFAULT PERSISTENCE METHODS ======

    /**
     * Set a behavior as the default (persisted in localStorage)
     * @param {string} behaviorName - Name of behavior to set as default
     */
    setDefaultBehavior(behaviorName) {
        try {
            localStorage.setItem(this.DEFAULT_BEHAVIOR_KEY, behaviorName);
            localStorage.setItem(this.DEFAULT_TYPE_KEY, 'behavior');
            localStorage.removeItem(this.DEFAULT_BANK_KEY); // Clear bank default
            console.log(`🔧 Set default behavior: "${behaviorName}"`);
        } catch (error) {
            console.warn('Failed to save default behavior to localStorage:', error);
        }
    }

    /**
     * Set a bank as the default (persisted in localStorage)
     * @param {string} bankName - Name of bank to set as default
     */
    setDefaultBank(bankName) {
        try {
            localStorage.setItem(this.DEFAULT_BANK_KEY, bankName);
            localStorage.setItem(this.DEFAULT_TYPE_KEY, 'bank');
            localStorage.removeItem(this.DEFAULT_BEHAVIOR_KEY); // Clear behavior default
            console.log(`🔧 Set default bank: "${bankName}"`);
        } catch (error) {
            console.warn('Failed to save default bank to localStorage:', error);
        }
    }

    /**
     * Get the current default (behavior or bank)
     * @returns {object|null} - {type: 'behavior'|'bank', name: string} or null if none set
     */
    getDefault() {
        try {
            const type = localStorage.getItem(this.DEFAULT_TYPE_KEY);
            if (type === 'behavior') {
                const name = localStorage.getItem(this.DEFAULT_BEHAVIOR_KEY);
                return name ? { type: 'behavior', name } : null;
            } else if (type === 'bank') {
                const name = localStorage.getItem(this.DEFAULT_BANK_KEY);
                return name ? { type: 'bank', name } : null;
            }
        } catch (error) {
            console.warn('Failed to read default from localStorage:', error);
        }
        return null;
    }    /**
     * Clear the default setting
     */
    clearDefault() {
        try {
            localStorage.removeItem(this.DEFAULT_BEHAVIOR_KEY);
            localStorage.removeItem(this.DEFAULT_BANK_KEY);
            localStorage.removeItem(this.DEFAULT_TYPE_KEY);
            console.log('🗑️ Cleared default setting');
        } catch (error) {
            console.warn('Failed to clear default from localStorage:', error);
        }
    }

    // ====== SCENE-DEFAULT PERSISTENCE METHODS ======

    /**
     * Set the current scene state as scene-default (automatically called when loading behaviors/banks)
     * @param {string} name - Name of behavior or bank currently loaded
     * @param {string} type - 'behavior' or 'bank'
     */
    setSceneDefault(name, type) {
        try {
            if (type === 'behavior') {
                localStorage.setItem(this.SCENE_DEFAULT_BEHAVIOR_KEY, name);
                localStorage.setItem(this.SCENE_DEFAULT_TYPE_KEY, 'behavior');
                localStorage.removeItem(this.SCENE_DEFAULT_BANK_KEY);
                console.log(`🎬 Set scene-default behavior: "${name}"`);
            } else if (type === 'bank') {
                localStorage.setItem(this.SCENE_DEFAULT_BANK_KEY, name);
                localStorage.setItem(this.SCENE_DEFAULT_TYPE_KEY, 'bank');
                localStorage.removeItem(this.SCENE_DEFAULT_BEHAVIOR_KEY);
                console.log(`🎬 Set scene-default bank: "${name}"`);
            }
        } catch (error) {
            console.warn('Failed to save scene-default to localStorage:', error);
        }
    }

    /**
     * Get the current scene-default (what was last loaded)
     * @returns {object|null} - {type: 'behavior'|'bank', name: string} or null if none set
     */
    getSceneDefault() {
        try {
            const type = localStorage.getItem(this.SCENE_DEFAULT_TYPE_KEY);
            if (type === 'behavior') {
                const name = localStorage.getItem(this.SCENE_DEFAULT_BEHAVIOR_KEY);
                return name ? { type: 'behavior', name } : null;
            } else if (type === 'bank') {
                const name = localStorage.getItem(this.SCENE_DEFAULT_BANK_KEY);
                return name ? { type: 'bank', name } : null;
            }
        } catch (error) {
            console.warn('Failed to read scene-default from localStorage:', error);
        }
        return null;
    }    /**
     * Clear the scene-default setting
     */
    clearSceneDefault() {
        try {
            localStorage.removeItem(this.SCENE_DEFAULT_BEHAVIOR_KEY);
            localStorage.removeItem(this.SCENE_DEFAULT_BANK_KEY);
            localStorage.removeItem(this.SCENE_DEFAULT_TYPE_KEY);
            localStorage.removeItem(this.SCENE_DEFAULT_HELPERS_KEY);
            console.log('🗑️ Cleared scene-default setting');
        } catch (error) {
            console.warn('Failed to clear scene-default from localStorage:', error);
        }
    }

    /**
     * Set the helper visibility state (automatically called when changing helper visibility)
     * @param {boolean} visible - True if helpers should be visible, false otherwise
     */
    setSceneDefaultHelpers(visible) {
        try {
            localStorage.setItem(this.SCENE_DEFAULT_HELPERS_KEY, visible.toString());
            console.log(`🎬 Set scene-default helpers: ${visible ? 'ON' : 'OFF'}`);
        } catch (error) {
            console.warn('Failed to save scene-default helpers to localStorage:', error);
        }
    }

    /**
     * Get the scene-default helper visibility state
     * @returns {boolean|null} - True if helpers should be visible, false if hidden, null if not set
     */
    getSceneDefaultHelpers() {
        try {
            const helpersState = localStorage.getItem(this.SCENE_DEFAULT_HELPERS_KEY);
            if (helpersState !== null) {
                return helpersState === 'true';
            }
        } catch (error) {
            console.warn('Failed to read scene-default helpers from localStorage:', error);
        }
        return null;
    }/**
     * Load the saved default (called on startup)
     * Prioritizes scene-default (current session state) over regular default
     * @returns {object|false} - Default data object or false if none found
     */
    loadSavedDefault() {
        // First try to load scene-default (what was last active)
        const sceneDefault = this.getSceneDefault();
        if (sceneDefault) {
            console.log(`🎬 Loading scene-default ${sceneDefault.type}: "${sceneDefault.name}"`);
            
            if (sceneDefault.type === 'behavior') {
                const config = this.savedBehaviors.get(sceneDefault.name);
                if (config) {
                    console.log(`✅ Found scene-default behavior: "${sceneDefault.name}"`);
                    return { type: 'behavior', name: sceneDefault.name, config: { ...config } };
                } else {
                    console.warn(`❌ Scene-default behavior "${sceneDefault.name}" not found, clearing scene-default`);
                    this.clearSceneDefault();
                }
            } else if (sceneDefault.type === 'bank') {
                const behaviorNames = this.savedBanks.get(sceneDefault.name);
                if (behaviorNames) {
                    console.log(`✅ Found scene-default bank: "${sceneDefault.name}"`);
                    return { type: 'bank', name: sceneDefault.name, behaviorNames: [...behaviorNames] };
                } else {
                    console.warn(`❌ Scene-default bank "${sceneDefault.name}" not found, clearing scene-default`);
                    this.clearSceneDefault();
                }
            }
        }

        // Fall back to regular default if no scene-default
        const defaultSetting = this.getDefault();
        if (!defaultSetting) {
            console.log('💡 No saved default found');
            return false;
        }

        console.log(`🔄 Loading saved default ${defaultSetting.type}: "${defaultSetting.name}"`);
        
        if (defaultSetting.type === 'behavior') {
            const config = this.savedBehaviors.get(defaultSetting.name);
            if (config) {
                console.log(`✅ Found saved default behavior: "${defaultSetting.name}"`);
                return { type: 'behavior', name: defaultSetting.name, config: { ...config } };
            } else {
                console.warn(`❌ Saved default behavior "${defaultSetting.name}" not found, clearing default`);
                this.clearDefault();
            }
        } else if (defaultSetting.type === 'bank') {
            const behaviorNames = this.savedBanks.get(defaultSetting.name);
            if (behaviorNames) {
                console.log(`✅ Found saved default bank: "${defaultSetting.name}"`);
                return { type: 'bank', name: defaultSetting.name, behaviorNames: [...behaviorNames] };
            } else {
                console.warn(`❌ Saved default bank "${defaultSetting.name}" not found, clearing default`);
                this.clearDefault();
            }
        }
        
        return false;
    }
}

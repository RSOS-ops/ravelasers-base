// SaveLoadManager.js
// Simple save/load system for laser configurations

import { behaviors, savedBehaviorConfigs } from './behaviors/behaviors.js';
import { banks, savedBankConfigs } from './banks.js';

export class SaveLoadManager {
    constructor() {
        this.savedBehaviors = new Map(Object.entries(savedBehaviorConfigs));
        this.savedBanks = new Map(Object.entries(savedBankConfigs));
    }

    // ====== BEHAVIOR MANAGEMENT ======
    
    /**
     * Save a behavior configuration
     * @param {string} name - Name to save the behavior as
     * @param {object} config - Behavior configuration object
     */
    saveBehavior(name, config) {
        this.savedBehaviors.set(name, { ...config });
        console.log(`💾 Saved behavior: "${name}"`);
        this.showSavedBehaviors();
    }

    /**
     * Load a behavior configuration
     * @param {string} name - Name of the behavior to load
     * @returns {object|null} - Behavior config or null if not found
     */
    loadBehavior(name) {
        const config = this.savedBehaviors.get(name);
        if (config) {
            console.log(`📁 Loaded behavior: "${name}"`);
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
    }

    /**
     * Load a bank
     * @param {string} bankName - Name of the bank to load
     * @returns {string[]|null} - Array of behavior names or null if not found
     */
    loadBank(bankName) {
        const behaviorNames = this.savedBanks.get(bankName);
        if (behaviorNames) {
            console.log(`📁 Loaded bank: "${bankName}" with behaviors: [${behaviorNames.join(', ')}]`);
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
}

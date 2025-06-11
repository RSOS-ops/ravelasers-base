// PresetManager.js
import { banks } from './banks.js';
import { behaviors } from './behaviors/behaviors.js';
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
        
        // Auto-load saved default after a short delay to ensure system is ready
        setTimeout(() => this.loadSavedDefault(), 100);
    }

    /**
     * Load the saved default behavior or bank (called on startup)
     */
    loadSavedDefault() {        const defaultData = this.saveLoadManager.loadSavedDefault();
        if (!defaultData) {
            console.log('💡 No saved default found - loading fallback behavior');
            // Load fallback default behavior when no saved defaults exist
            this.laserSystem.clearAllBehaviors();
            
            // Load red_default as fallback
            const fallbackBehavior = behaviors.red_default({ laserColor: 0xff0000 });
            this.laserSystem.addBehavior(fallbackBehavior);
            console.log('✅ Loaded fallback behavior: red_default');
            
            // Still load helper state even if no default behaviors/banks
            this.loadSceneDefaultHelpers();
            return;
        }

        if (defaultData.type === 'behavior') {
            console.log(`🔄 Auto-loading saved default behavior: "${defaultData.name}"`);
            this.laserSystem.clearAllBehaviors();
            
            const behaviorType = defaultData.config._behaviorType || 'default';
            const configCopy = { ...defaultData.config };
            delete configCopy._behaviorType;
            
            const behaviorFactory = behaviors[behaviorType];
            if (behaviorFactory) {
                const behavior = behaviorFactory(configCopy);
                this.laserSystem.addBehavior(behavior);
                console.log(`✅ Auto-loaded default behavior: "${defaultData.name}" (type: ${behaviorType})`);
            } else {
                console.error(`❌ Unknown behavior type: ${behaviorType}`);
            }
        } else if (defaultData.type === 'bank') {
            console.log(`🔄 Auto-loading saved default bank: "${defaultData.name}"`);
            this.laserSystem.clearAllBehaviors();
            
            for (const behaviorName of defaultData.behaviorNames) {
                const config = this.saveLoadManager.loadBehavior(behaviorName);
                if (config) {
                    const behaviorType = config._behaviorType || 'default';
                    const configCopy = { ...config };
                    delete configCopy._behaviorType;
                    
                    const behaviorFactory = behaviors[behaviorType];
                    if (behaviorFactory) {
                        const behavior = behaviorFactory(configCopy);
                        this.laserSystem.addBehavior(behavior);
                    }
                }
            }
            
            this.bank.current = defaultData.name;
            console.log(`✅ Auto-loaded default bank: "${defaultData.name}"`);
        }
        
        // Load helper state after loading behaviors/banks
        this.loadSceneDefaultHelpers();
    }

    // ====== NEW SIMPLE METHODS ======

    /**
     * Save current laser setup as a behavior
     * @param {string} name - Name to save as
     * @param {object} config - Behavior configuration
     * @param {string} behaviorType - Type of behavior (default, wireframe, etc.)
     */
    saveBehavior(name, config, behaviorType = 'default') {
        return this.saveLoadManager.saveBehavior(name, config, behaviorType);
    }

    /**
     * Load and apply a saved behavior
     * @param {string} name - Name of behavior to load
     */
    loadBehavior(name) {
        const config = this.saveLoadManager.loadBehavior(name);
        if (config) {
            this.laserSystem.clearAllBehaviors();
            
            // Determine which behavior type to use
            const behaviorType = config._behaviorType || 'default';
            delete config._behaviorType; // Remove metadata before passing to behavior constructor
            
            // Use the appropriate behavior factory function
            const behaviorFactory = behaviors[behaviorType];
            if (behaviorFactory) {
                const behavior = behaviorFactory(config);
                this.laserSystem.addBehavior(behavior);
                console.log(`✅ Applied behavior: "${name}" (type: ${behaviorType})`);
                
                // Set as scene-default for persistence across reloads
                this.saveLoadManager.setSceneDefault(name, 'behavior');
                
                return true;
            } else {
                console.error(`❌ Unknown behavior type: ${behaviorType}`);
                return false;
            }
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
                    // Determine which behavior type to use
                    const behaviorType = config._behaviorType || 'default';
                    const configCopy = { ...config };
                    delete configCopy._behaviorType; // Remove metadata before passing to behavior constructor
                    
                    // Use the appropriate behavior factory function
                    const behaviorFactory = behaviors[behaviorType];
                    if (behaviorFactory) {
                        const behavior = behaviorFactory(configCopy);
                        this.laserSystem.addBehavior(behavior);
                    } else {
                        console.error(`❌ Unknown behavior type: ${behaviorType} for behavior: ${behaviorName}`);
                    }
                }
            }
            
            this.bank.current = bankName;
            console.log(`✅ Applied bank: "${bankName}"`);
            
            // Set as scene-default for persistence across reloads
            this.saveLoadManager.setSceneDefault(bankName, 'bank');
            
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

    /**
     * Clear all currently loaded behaviors/banks and scene-default
     */
    clearAll() {
        this.laserSystem.clearAllBehaviors();
        this.saveLoadManager.clearSceneDefault();
        this.bank.current = null;
        console.log('🧹 Cleared all behaviors, scene-default, and helper state');
    }

    /**
     * Get the current scene state (what would be restored on reload)
     */
    getCurrentSceneState() {
        return this.saveLoadManager.getSceneDefault();
    }

    /**
     * Show current status (scene-default and regular default)
     */
    showStatus() {
        const sceneDefault = this.saveLoadManager.getSceneDefault();
        const defaultSetting = this.saveLoadManager.getDefault();
        const helpersVisible = this.saveLoadManager.getSceneDefaultHelpers();

        console.log('\n=== CURRENT STATUS ===');
        
        if (sceneDefault) {
            console.log(`🎬 Scene-default: ${sceneDefault.type} "${sceneDefault.name}"`);
            console.log('  (This will reload on page refresh)');
        } else {
            console.log('🎬 Scene-default: None set');
        }

        if (defaultSetting) {
            console.log(`📌 Default: ${defaultSetting.type} "${defaultSetting.name}"`);
            console.log('  (Fallback if no scene-default)');
        } else {
            console.log('📌 Default: None set');
        }

        if (helpersVisible !== null) {
            console.log(`💡 Light helpers: ${helpersVisible ? 'ON' : 'OFF'}`);
            console.log('  (Persistent across reloads)');
        } else {
            console.log('💡 Light helpers: Not set');
        }

        console.log('======================\n');
    }

    /**
     * Clear scene-default (useful for console access)
     */
    clearSceneDefault() {
        this.saveLoadManager.clearSceneDefault();
    }

    /**
     * Load and apply the saved helper visibility state
     */
    loadSceneDefaultHelpers() {
        const helpersVisible = this.saveLoadManager.getSceneDefaultHelpers();
        if (helpersVisible !== null) {
            // Apply the saved helper state
            this.applyHelperVisibility(helpersVisible);
            console.log(`🎬 Restored scene-default helpers: ${helpersVisible ? 'ON' : 'OFF'}`);
        }
    }

    /**
     * Apply helper visibility to the scene
     * @param {boolean} visible - True to show helpers, false to hide them
     */
    applyHelperVisibility(visible) {
        if (!window.scene) {
            console.warn('Scene not available for helper visibility control');
            return;
        }

        const scene = window.scene;
        
        // Find all light helpers in the scene
        const helpers = [];
        scene.traverse((object) => {
            if (object.type === 'DirectionalLightHelper' || 
                object.type === 'SpotLightHelper' || 
                object.type === 'PointLightHelper') {
                helpers.push(object);
            }
        });

        // Apply visibility to all helpers
        helpers.forEach(helper => {
            helper.visible = visible;
        });

        console.log(`💡 Set ${helpers.length} light helpers visibility: ${visible ? 'ON' : 'OFF'}`);
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

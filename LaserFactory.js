// LaserFactory.js - Dynamic Laser Configuration Factory
// Create and test new laser configurations without modifying core files

import { behaviors } from './behaviors/behaviors.js';

export class LaserFactory {
    constructor(presetManager) {
        this.presetManager = presetManager;
        this.testConfigs = new Map(); // Temporary configs for testing
        this.activeTestBehavior = null;
        
        // Color presets for easy access
        this.colors = {
            red: 0xff0000,
            green: 0x00ff00,
            blue: 0x0000ff,
            cyan: 0x00ffff,
            magenta: 0xff00ff,
            yellow: 0xffff00,
            white: 0xffffff,
            orange: 0xff8000,
            purple: 0x8000ff,
            pink: 0xff0080,
            lime: 0x80ff00,
            teal: 0x008080,
            navy: 0x000080,
            gold: 0xffd700,
            silver: 0xc0c0c0
        };
        
        console.log("🏭 LaserFactory initialized!");
        console.log("Available methods: test(), save(), load(), showColors(), quickTest()");
    }

    /**
     * Test a laser configuration without saving it
     * @param {object} config - Laser configuration to test
     * @param {string} name - Optional name for the test (default: "test")
     */
    test(config, name = "test") {
        console.log(`🧪 Testing configuration: "${name}"`);
        
        // Store the test config
        this.testConfigs.set(name, { ...config });
        
        // Apply the configuration immediately
        this.presetManager.laserSystem.clearAllBehaviors();
        const behavior = behaviors.default(config);
        this.presetManager.laserSystem.addBehavior(behavior);
        this.activeTestBehavior = name;
        
        console.log(`✅ Test "${name}" applied! Use save("${name}") to save it permanently.`);
        this._showConfig(config);
        
        return this;
    }

    /**
     * Save the current test configuration permanently
     * @param {string} testName - Name of test to save (default: current active test)
     * @param {string} saveName - Name to save as (default: same as test name)
     */
    save(testName = null, saveName = null) {
        const nameToSave = testName || this.activeTestBehavior;
        const finalName = saveName || nameToSave;
        
        if (!nameToSave || !this.testConfigs.has(nameToSave)) {
            console.error(`❌ No test configuration found: "${nameToSave}"`);
            console.log("Available tests:", Array.from(this.testConfigs.keys()));
            return this;
        }

        const config = this.testConfigs.get(nameToSave);
        this.presetManager.saveBehavior(finalName, config);
        console.log(`💾 Saved test "${nameToSave}" as behavior "${finalName}"`);
        
        return this;
    }

    /**
     * Load and test a saved behavior
     * @param {string} name - Name of saved behavior to load
     */
    load(name) {
        const success = this.presetManager.loadBehavior(name);
        if (success) {
            console.log(`📁 Loaded behavior: "${name}"`);
        }
        return this;
    }

    /**
     * Quick test with common configurations
     * @param {string} preset - Preset name
     */
    quickTest(preset) {
        const presets = {
            // Speed tests
            'fast': { STILLNESS_LIMIT: 0.05 }, // Very fast jumps
            'slow': { STILLNESS_LIMIT: 0.3 },  // Slow jumps
            'ultra_fast': { STILLNESS_LIMIT: 0.025 }, // Ultra fast
            
            // Color tests
            'rainbow': { laserColor: this.colors.cyan, MAX_BOUNCES: 7 },
            'fire': { laserColor: this.colors.orange, MAX_BRIGHTNESS: 3.0 },
            'ice': { laserColor: this.colors.cyan, MIN_BRIGHTNESS: 0.8 },
            
            // Bounce tests
            'bouncy': { MAX_BOUNCES: 10, laserColor: this.colors.green },
            'no_bounce': { MAX_BOUNCES: 1, laserColor: this.colors.red },
            
            // Size tests
            'wide': { ORIGIN_SPHERE_RADIUS: 25, laserColor: this.colors.purple },
            'tight': { ORIGIN_SPHERE_RADIUS: 3, laserColor: this.colors.yellow },
            
            // Pulse tests
            'pulse_fast': { BASE_PULSE_FREQUENCY: 2.0, laserColor: this.colors.magenta },
            'pulse_slow': { BASE_PULSE_FREQUENCY: 0.1, laserColor: this.colors.blue },
            'bright': { MAX_BRIGHTNESS: 4.0, MIN_BRIGHTNESS: 1.0, laserColor: this.colors.white },
            
            // Complex combinations
            'chaos': { 
                MAX_BOUNCES: 8, 
                ORIGIN_SPHERE_RADIUS: 20, 
                BASE_PULSE_FREQUENCY: 1.5,
                laserColor: this.colors.pink,
                STILLNESS_LIMIT: 0.06
            },
            'zen': {
                MAX_BOUNCES: 2,
                ORIGIN_SPHERE_RADIUS: 8,
                BASE_PULSE_FREQUENCY: 0.3,
                laserColor: this.colors.teal,
                STILLNESS_LIMIT: 0.4,
                MIN_BRIGHTNESS: 0.5,
                MAX_BRIGHTNESS: 1.5
            }
        };

        const config = presets[preset];
        if (!config) {
            console.error(`❌ Unknown preset: "${preset}"`);
            console.log("Available presets:", Object.keys(presets));
            return this;
        }

        return this.test(config, preset);
    }

    /**
     * Create a custom configuration easily
     * @param {object} options - Configuration options
     */
    create(options = {}) {
        const config = {
            laserColor: options.color || options.laserColor || this.colors.red,
            MAX_BOUNCES: options.bounces || options.MAX_BOUNCES || 3,
            ORIGIN_SPHERE_RADIUS: options.radius || options.ORIGIN_SPHERE_RADIUS || 10,
            STILLNESS_LIMIT: options.speed || options.STILLNESS_LIMIT || 0.083,
            BASE_PULSE_FREQUENCY: options.pulse || options.BASE_PULSE_FREQUENCY || 0.5,
            MIN_BRIGHTNESS: options.minBright || options.MIN_BRIGHTNESS || 0.3,
            MAX_BRIGHTNESS: options.maxBright || options.MAX_BRIGHTNESS || 2.5,
            MAX_LENGTH: options.length || options.MAX_LENGTH || 20,
            ...options // Allow any other direct overrides
        };

        const name = options.name || "custom";
        return this.test(config, name);
    }

    /**
     * Chain multiple configurations for A/B testing
     * @param {Array} configs - Array of {config, name} objects
     */
    testSequence(configs) {
        if (!Array.isArray(configs)) {
            console.error("❌ testSequence requires an array of configs");
            return this;
        }

        console.log(`🔄 Testing sequence of ${configs.length} configurations...`);
        
        configs.forEach((item, index) => {
            const config = item.config || item;
            const name = item.name || `seq_${index}`;
            this.testConfigs.set(name, config);
            console.log(`  ${index + 1}. "${name}" ready`);
        });

        console.log("Use factory.test() to apply each configuration by name");
        return this;
    }

    /**
     * Compare two configurations side by side
     * @param {string} name1 - First config name
     * @param {string} name2 - Second config name
     */
    compare(name1, name2) {
        const config1 = this.testConfigs.get(name1);
        const config2 = this.testConfigs.get(name2);

        if (!config1 || !config2) {
            console.error("❌ One or both configurations not found");
            return this;
        }

        console.log(`🔍 Comparing "${name1}" vs "${name2}"`);
        console.log("Configuration 1:", config1);
        console.log("Configuration 2:", config2);

        // Show differences
        const allKeys = new Set([...Object.keys(config1), ...Object.keys(config2)]);
        const differences = [];
        
        allKeys.forEach(key => {
            if (config1[key] !== config2[key]) {
                differences.push({
                    property: key,
                    config1: config1[key],
                    config2: config2[key]
                });
            }
        });

        if (differences.length > 0) {
            console.log("🔄 Differences:");
            differences.forEach(diff => {
                console.log(`  ${diff.property}: ${diff.config1} → ${diff.config2}`);
            });
        } else {
            console.log("✅ Configurations are identical");
        }

        return this;
    }

    /**
     * Show available colors
     */
    showColors() {
        console.log("🎨 Available colors:");
        Object.entries(this.colors).forEach(([name, hex]) => {
            console.log(`  ${name.padEnd(8)}: 0x${hex.toString(16).padStart(6, '0')}`);
        });
        return this;
    }

    /**
     * List all test configurations
     */
    listTests() {
        console.log("🧪 Test Configurations:");
        if (this.testConfigs.size === 0) {
            console.log("  (no tests created)");
        } else {
            this.testConfigs.forEach((config, name) => {
                const active = name === this.activeTestBehavior ? " (ACTIVE)" : "";
                console.log(`  • ${name}${active}`);
            });
        }
        return this;
    }

    /**
     * Show current active test configuration
     */
    showActive() {
        if (!this.activeTestBehavior) {
            console.log("No active test configuration");
            return this;
        }

        const config = this.testConfigs.get(this.activeTestBehavior);
        console.log(`🔬 Active Test: "${this.activeTestBehavior}"`);
        this._showConfig(config);
        return this;
    }

    /**
     * Clear all test configurations
     */
    clearTests() {
        this.testConfigs.clear();
        this.activeTestBehavior = null;
        console.log("🧹 Cleared all test configurations");
        return this;
    }

    /**
     * Helper method to display configuration details
     */
    _showConfig(config) {
        console.log("Configuration:");
        Object.entries(config).forEach(([key, value]) => {
            if (key === 'laserColor') {
                const colorName = this._getColorName(value);
                console.log(`  ${key}: 0x${value.toString(16).padStart(6, '0')} (${colorName})`);
            } else {
                console.log(`  ${key}: ${value}`);
            }
        });
    }

    /**
     * Helper to find color name from hex value
     */
    _getColorName(hex) {
        const colorEntry = Object.entries(this.colors).find(([name, value]) => value === hex);
        return colorEntry ? colorEntry[0] : 'custom';
    }

    /**
     * Export current test configurations
     */
    export() {
        const data = {
            tests: Object.fromEntries(this.testConfigs),
            activeTest: this.activeTestBehavior,
            exported: new Date().toISOString()
        };
        console.log("📤 Test configurations:", JSON.stringify(data, null, 2));
        return data;
    }

    /**
     * Import test configurations
     */
    import(data) {
        try {
            if (data.tests) {
                this.testConfigs = new Map(Object.entries(data.tests));
                this.activeTestBehavior = data.activeTest || null;
                console.log("📥 Successfully imported test configurations");
                this.listTests();
            }
        } catch (error) {
            console.error("❌ Import failed:", error);
        }
        return this;
    }
}

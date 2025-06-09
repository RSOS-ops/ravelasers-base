// PresetManager.js

export class PresetManager {
    constructor(laserSystem) {
        this.laserSystem = laserSystem;
        this.presets = {}; // To store the loaded presets
        this.presetNames = [];
    }

    async loadLibrary(url) {
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const libraryData = await response.json();

            if (libraryData && libraryData.presets) {
                this.presets = libraryData.presets;
                this.presetNames = Object.keys(this.presets);
                console.log("PresetManager: Laser library loaded successfully.", this.presetNames);
            } else {
                console.error("PresetManager: Invalid library format. 'presets' key not found.");
                this.presets = {};
                this.presetNames = [];
            }
        } catch (error) {
            console.error("PresetManager: Failed to load laser library:", error);
            this.presets = {}; // Ensure presets is empty on error
            this.presetNames = [];
        }
    }

    getPresetNames() {
        return this.presetNames;
    }

    applyPreset(presetName) {
        const presetData = this.presets[presetName];
        if (presetData) {
            // The structure in laser-presets.json is:
            // presets.PRESET_NAME.banks.BANK_NAME.behaviors.BEHAVIOR_NAME.config
            // For now, let's assume we want to apply the config from the *first* behavior
            // of the *first* bank of the preset for simplicity, as per the initial setup.
            // This can be made more sophisticated later if a preset can contain multiple banks/behaviors
            // and the user needs to select which specific one to apply.

            const firstBankName = Object.keys(presetData.banks)[0];
            if (firstBankName) {
                const firstBank = presetData.banks[firstBankName];
                const firstBehaviorName = Object.keys(firstBank.behaviors)[0];
                if (firstBehaviorName) {
                    const behaviorToApply = firstBank.behaviors[firstBehaviorName];
                    if (behaviorToApply && behaviorToApply.config) {
                        this.laserSystem.applyPreset(behaviorToApply.config);
                        console.log(`PresetManager: Applied preset '${presetName}' - behavior '${behaviorToApply.name}'.`);
                    } else {
                        console.error(`PresetManager: Behavior '${firstBehaviorName}' in bank '${firstBankName}' for preset '${presetName}' has no config.`);
                    }
                } else {
                     console.error(`PresetManager: No behaviors found in bank '${firstBankName}' for preset '${presetName}'.`);
                }
            } else {
                console.error(`PresetManager: No banks found in preset '${presetName}'.`);
            }
        } else {
            console.error(`PresetManager: Preset "${presetName}" not found.`);
        }
    }
}

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
    }    applyPreset(presetName) {
        const presetData = this.presets[presetName];
        if (presetData) {
            // The structure in laser-presets.json is:
            // presets.PRESET_NAME.config
            if (presetData.config) {
                this.laserSystem.applyPreset(presetData.config);
                console.log(`PresetManager: Applied preset '${presetName}' - ${presetData.name}.`);
            } else {
                console.error(`PresetManager: Preset '${presetName}' has no config.`);
            }
        } else {
            console.error(`PresetManager: Preset "${presetName}" not found.`);
        }
    }
}

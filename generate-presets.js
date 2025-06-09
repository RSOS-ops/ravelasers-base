import { behaviors } from './behaviors.js';
import fs from 'fs';

// Convert behaviors to proper JSON format
const jsonPresets = {
  "presets": {}
};

// Copy behaviors to presets with proper JSON structure
for (const [key, value] of Object.entries(behaviors)) {
  jsonPresets.presets[key] = {
    "name": value.name,
    "description": value.description,
    "config": { ...value.config }
  };
}

// Write to laser-presets.json
fs.writeFileSync('./laser-presets.json', JSON.stringify(jsonPresets, null, 2));
console.log('Generated laser-presets.json successfully');
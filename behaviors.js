// behaviors.js

const behaviors = {
  "behavior.1": {
    "name": "BASIC",
    "description": "Basic Starting Point",
    "config": {
      "MAX_BOUNCES": 3,
      "MAX_RAVE_LASER_SYSTEM_1_LENGTH": 20,
      "RAVE_LASER_SYSTEM_1_STILLNESS_LIMIT": 0.16666666666666666,
      "BASE_RAVE_LASER_SYSTEM_1_PULSE_FREQUENCY": 0.5,
      "RAVE_LASER_SYSTEM_1_PULSE_FREQUENCY_SENSITIVITY": 5.0,
      "MIN_RAVE_LASER_SYSTEM_1_BRIGHTNESS": 0.3,
      "MAX_RAVE_LASER_SYSTEM_1_BRIGHTNESS": 2.5,
      "laserColor": "0xff0000"
    }
  }
  // Future behaviors can be added here
};

// It might be useful to export this if other modules need to import it directly,
// but for now, it will primarily be used to construct the laser-presets.json.
// export default behaviors;
// Commenting out export for now as it's not immediately needed by other JS files directly.
// The structure will be used to build the JSON.

// Simple configuration file for yellow wide laser setup
// This is easy to copy, paste, and edit in any text editor

export const config = {
    laserColor: 0xffff00,          // Yellow color
    laserCount: 4,                 // Number of lasers
    MAX_BOUNCES: 3,                // Number of bounces off model
    ORIGIN_SPHERE_RADIUS: 15,      // Wider spread from center
    STILLNESS_LIMIT: 0.083,        // Speed of movement (lower = faster)
    BASE_PULSE_FREQUENCY: 0.5,     // Pulse animation speed
    MIN_BRIGHTNESS: 0.3,           // Minimum brightness during pulse
    MAX_BRIGHTNESS: 2.5,           // Maximum brightness during pulse
    MAX_LENGTH: 20                 // Maximum laser line length
};

// Human-readable description
export const description = "Yellow lasers with wider origin spread for broader coverage";

// Optional metadata
export const metadata = {
    name: "yellow_wide",
    author: "system",
    category: "wide",
    tags: ["yellow", "wide", "spread"]
};

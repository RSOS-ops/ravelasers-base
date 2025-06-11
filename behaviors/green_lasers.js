// Simple configuration file for green laser setup
// This is easy to copy, paste, and edit in any text editor

export const config = {
    laserColor: 0x00ff00,          // Green color
    laserCount: 4,                 // Number of lasers
    MAX_BOUNCES: 3,                // Number of bounces off model
    ORIGIN_SPHERE_RADIUS: 10,      // How far from center lasers start
    STILLNESS_LIMIT: 0.083,        // Speed of movement (lower = faster)
    BASE_PULSE_FREQUENCY: 0.5,     // Pulse animation speed
    MIN_BRIGHTNESS: 0.3,           // Minimum brightness during pulse
    MAX_BRIGHTNESS: 2.5,           // Maximum brightness during pulse
    MAX_LENGTH: 20                 // Maximum laser line length
};

// Human-readable description
export const description = "Bright green lasers with classic behavior";

// Optional metadata
export const metadata = {
    name: "green_lasers",
    author: "system",
    category: "classic",
    tags: ["green", "classic", "moderate"]
};

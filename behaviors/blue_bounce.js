// Simple configuration file for blue bouncy laser setup
// This is easy to copy, paste, and edit in any text editor

export const config = {
    laserColor: 0x0000ff,          // Blue color
    laserCount: 4,                 // Number of lasers
    MAX_BOUNCES: 5,                // More bounces for bouncy effect
    ORIGIN_SPHERE_RADIUS: 10,      // How far from center lasers start
    STILLNESS_LIMIT: 0.083,        // Speed of movement (lower = faster)
    BASE_PULSE_FREQUENCY: 0.5,     // Pulse animation speed
    MIN_BRIGHTNESS: 0.3,           // Minimum brightness during pulse
    MAX_BRIGHTNESS: 2.5,           // Maximum brightness during pulse
    MAX_LENGTH: 20                 // Maximum laser line length
};

// Human-readable description
export const description = "Blue lasers with extra bounces for dynamic movement";

// Optional metadata
export const metadata = {
    name: "blue_bounce",
    author: "system",
    category: "bouncy",
    tags: ["blue", "bounces", "dynamic"]
};

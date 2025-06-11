// Example: Fast Purple Laser Configuration
// Copy this file and edit values to create new laser looks

export const config = {
    laserColor: 0x8000ff,          // Purple color
    laserCount: 6,                 // More lasers for intensity
    MAX_BOUNCES: 4,                // Good bounce amount
    ORIGIN_SPHERE_RADIUS: 12,      // Medium spread
    STILLNESS_LIMIT: 0.04,         // Very fast movement
    BASE_PULSE_FREQUENCY: 1.2,     // Fast pulsing
    MIN_BRIGHTNESS: 0.4,           // Higher minimum
    MAX_BRIGHTNESS: 3.0,           // Bright maximum
    MAX_LENGTH: 25                 // Longer laser lines
};

export const description = "Fast-moving purple lasers with intense pulsing";

export const metadata = {
    name: "fast_purple",
    author: "user",
    category: "fast",
    tags: ["purple", "fast", "intense", "bright"]
};

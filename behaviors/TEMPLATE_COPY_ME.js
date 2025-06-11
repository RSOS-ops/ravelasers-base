// How to Create New Laser Configurations
// ====================================

// EXAMPLE 1: Copy this template and modify the values
export const config = {
    // Basic Properties
    laserColor: 0xff0000,          // Change this! (0xff0000=red, 0x00ff00=green, 0x0000ff=blue)
    laserCount: 4,                 // How many lasers (1-10)
    
    // Movement & Behavior  
    STILLNESS_LIMIT: 0.083,        // Speed (0.01=very fast, 0.3=slow)
    ORIGIN_SPHERE_RADIUS: 10,      // Spread (5=tight, 20=wide)
    
    // Visual Effects
    MAX_BOUNCES: 3,                // Bounces (1=straight, 10=chaotic)
    BASE_PULSE_FREQUENCY: 0.5,     // Pulse speed (0.1=slow, 2.0=fast)
    MIN_BRIGHTNESS: 0.3,           // Dimmest (0.1-1.0)
    MAX_BRIGHTNESS: 2.5,           // Brightest (1.0-5.0)
    MAX_LENGTH: 20                 // Length (10=short, 40=long)
};

// EXAMPLE 2: Some color ideas
/*
Red:     0xff0000    Orange:  0xff8000    Yellow:  0xffff00    Lime:    0x80ff00
Green:   0x00ff00    Teal:    0x00ff80    Cyan:    0x00ffff    Blue:    0x0080ff  
Purple:  0x8000ff    Magenta: 0xff00ff    Pink:    0xff0080    White:   0xffffff
*/

// EXAMPLE 3: Quick presets to try
/*
Fast & Bright:    STILLNESS_LIMIT: 0.03,  MAX_BRIGHTNESS: 4.0
Slow & Calm:      STILLNESS_LIMIT: 0.25,  MIN_BRIGHTNESS: 0.7, MAX_BRIGHTNESS: 1.5
Many Bounces:     MAX_BOUNCES: 8,         ORIGIN_SPHERE_RADIUS: 15
Wide Spread:      ORIGIN_SPHERE_RADIUS: 25, laserCount: 6
Tight Focus:      ORIGIN_SPHERE_RADIUS: 5,  laserCount: 3
*/

export const description = "Template for creating new laser configurations";

export const metadata = {
    name: "template",
    author: "system",
    category: "template",
    tags: ["template", "example", "copy-me"]
};

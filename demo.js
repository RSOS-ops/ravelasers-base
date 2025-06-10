// LASER SYSTEM DEMONSTRATION - WORKING COMMANDS
// ==============================================
// Copy and paste these commands into your browser console (F12) to test the laser system

console.log("🎯 LASER SYSTEM DEMONSTRATION - WORKING COMMANDS");
console.log("===============================================");

// 1. PRESET MANAGER COMMANDS (These work immediately)
console.log("\n1. PRESET MANAGER COMMANDS:");
console.log("presetManager.showSaved()        // Show all saved configurations");
console.log("presetManager.listBehaviors()    // List saved behaviors");
console.log("presetManager.listBanks()        // List saved banks");
console.log("presetManager.loadBehavior('red_default')   // Load red lasers");
console.log("presetManager.loadBehavior('green_lasers')  // Load green lasers");
console.log("presetManager.loadBehavior('blue_bounce')   // Load blue bouncy lasers");
console.log("presetManager.loadBank('rave_mode')         // Load rave bank");
console.log("presetManager.loadBank('chill_mode')        // Load chill bank");
console.log("presetManager.loadBank('chaos_mode')        // Load chaos bank");

// 2. DIRECT BEHAVIOR CREATION (Custom laser configurations)
console.log("\n2. DIRECT BEHAVIOR CREATION:");
console.log("// Fast orange 'fire' effect:");
console.log(`const fireBehavior = new BehaviorDefault({ 
    laserColor: 0xff4000,      // Orange-red
    STILLNESS_LIMIT: 0.05,     // Very fast movement
    MAX_BOUNCES: 6,
    MAX_BRIGHTNESS: 3.0        // Intense brightness
});
laserSystem.clearBehaviors();
laserSystem.addBehavior(fireBehavior);`);

console.log("\n// Calm blue 'zen' effect:");
console.log(`const zenBehavior = new BehaviorDefault({ 
    laserColor: 0x4080ff,      // Calm blue
    STILLNESS_LIMIT: 0.3,      // Slower movement
    MAX_BOUNCES: 2,            // Fewer bounces
    MIN_BRIGHTNESS: 0.5,       // Softer light
    MAX_BRIGHTNESS: 1.5
});
laserSystem.clearBehaviors();
laserSystem.addBehavior(zenBehavior);`);

console.log("\n// Chaotic multi-color effect:");
console.log(`const chaosBehavior = new BehaviorDefault({ 
    laserColor: 0x00ff00,      // Green
    STILLNESS_LIMIT: 0.02,     // Super fast
    MAX_BOUNCES: 10,           // Many bounces
    ORIGIN_SPHERE_RADIUS: 25,  // Wide spread
    MAX_BRIGHTNESS: 4.0
});
laserSystem.clearBehaviors();
laserSystem.addBehavior(chaosBehavior);`);

// 3. SPEED DEMONSTRATIONS (Your 2x Speed Increase)
console.log("\n3. SPEED DEMONSTRATIONS:");
console.log("// Original speed (0.167s):");
console.log(`const originalSpeed = new BehaviorDefault({ 
    laserColor: 0xff0000, 
    STILLNESS_LIMIT: 0.167 
});
laserSystem.clearBehaviors();
laserSystem.addBehavior(originalSpeed);`);

console.log("\n// 2x faster (current default 0.083s):");
console.log(`const doubleSpeed = new BehaviorDefault({ 
    laserColor: 0x00ff00, 
    STILLNESS_LIMIT: 0.083 
});
laserSystem.clearBehaviors();
laserSystem.addBehavior(doubleSpeed);`);

console.log("\n// 4x faster (experimental):");
console.log(`const quadSpeed = new BehaviorDefault({ 
    laserColor: 0x0080ff, 
    STILLNESS_LIMIT: 0.042 
});
laserSystem.clearBehaviors();
laserSystem.addBehavior(quadSpeed);`);

// 4. CLI COMMANDS (use the green terminal interface)
console.log("\n4. CLI COMMANDS (use the green terminal on the left):");
console.log("> load-behavior red_default");
console.log("> load-bank rave_mode");
console.log("> save my_config 0x00ff00 8 25");
console.log("> save-bank my_collection red_default green_lasers");
console.log("> show");
console.log("> help");

// 5. COLOR REFERENCE
console.log("\n5. COLOR REFERENCE:");
console.log("Red:     0xff0000    Green:   0x00ff00");
console.log("Blue:    0x0000ff    Cyan:    0x00ffff");
console.log("Magenta: 0xff00ff    Yellow:  0xffff00");
console.log("Orange:  0xff8000    Purple:  0x8000ff");
console.log("Pink:    0xff0080    Lime:    0x80ff00");

// 6. QUICK START EXAMPLES
console.log("\n6. QUICK START - TRY THESE NOW:");
console.log("// Load a preset:");
console.log("presetManager.loadBehavior('blue_bounce')");
console.log("");
console.log("// Create fast purple lasers:");
console.log(`const purpleFast = new BehaviorDefault({ 
    laserColor: 0x8000ff, 
    STILLNESS_LIMIT: 0.04, 
    MAX_BOUNCES: 8 
});
laserSystem.clearBehaviors();
laserSystem.addBehavior(purpleFast);`);

console.log("\n🎯 RECOMMENDED WORKFLOW:");
console.log("1. Try: presetManager.loadBehavior('red_default')");
console.log("2. Then: presetManager.loadBank('chaos_mode')");
console.log("3. Create custom: Use the BehaviorDefault examples above");
console.log("4. Save via CLI: Use the green terminal for permanent storage");

console.log("\n📋 PARAMETER REFERENCE:");
console.log("laserColor: 0x______  (hex color code)");
console.log("STILLNESS_LIMIT: 0.01-0.5  (lower = faster movement)");
console.log("MAX_BOUNCES: 1-15  (number of reflections)");
console.log("ORIGIN_SPHERE_RADIUS: 5-30  (spread of laser origins)");
console.log("MIN_BRIGHTNESS: 0.1-1.0  (minimum laser intensity)");
console.log("MAX_BRIGHTNESS: 1.0-5.0  (maximum laser intensity)");

// Real working demonstration:
console.log("\n🚀 WORKING DEMONSTRATION:");
console.log("The following commands are ready to execute:");

// Execute a working demo automatically
setTimeout(() => {
    console.log("\n✅ Auto-loading red_default behavior in 2 seconds...");
    setTimeout(() => {
        if (typeof presetManager !== 'undefined') {
            presetManager.loadBehavior('red_default');
            console.log("✅ Red lasers loaded! Try the chaos mode next:");
            console.log("presetManager.loadBank('chaos_mode')");
        }
    }, 2000);
}, 1000);

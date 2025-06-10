// LASER FACTORY DEMONSTRATION
// ===========================
// Copy and paste these commands into your browser console (F12) to test the laser factory system

console.log("🏭 LASER FACTORY DEMONSTRATION");
console.log("==============================");

// 1. QUICK TESTS - Try these first!
console.log("\n1. QUICK TESTS:");
console.log("factory.quickTest('fast')        // Very fast laser movement");
console.log("factory.quickTest('chaos')       // Chaotic multi-bounce lasers");
console.log("factory.quickTest('zen')         // Calm, slow lasers");
console.log("factory.quickTest('fire')        // Orange fire-like lasers");
console.log("factory.quickTest('ice')         // Bright cyan ice lasers");

// 2. CUSTOM CONFIGURATIONS
console.log("\n2. CUSTOM CONFIGURATIONS:");
console.log(`factory.create({
    color: factory.colors.purple,
    bounces: 8,
    radius: 20,
    speed: 0.03,  // Very fast
    pulse: 2.0    // Fast pulsing
})`);

// 3. TESTING AND SAVING
console.log("\n3. TESTING AND SAVING:");
console.log("factory.test({ laserColor: 0xff0080, MAX_BOUNCES: 10 }, 'pink_chaos')");
console.log("factory.save('pink_chaos')  // Save permanently");

// 4. SPEED DEMONSTRATIONS (Your 2x Speed Increase)
console.log("\n4. SPEED DEMONSTRATIONS:");
console.log("// Original speed (0.167s):");
console.log("factory.test({ STILLNESS_LIMIT: 0.167 }, 'original_speed')");
console.log("");
console.log("// 2x faster (current default 0.083s):");
console.log("factory.test({ STILLNESS_LIMIT: 0.083 }, 'double_speed')");
console.log("");
console.log("// 4x faster (experimental):");
console.log("factory.test({ STILLNESS_LIMIT: 0.042 }, 'quad_speed')");

// 5. COLOR EXPLORATION
console.log("\n5. COLOR EXPLORATION:");
console.log("factory.showColors()  // Show all available colors");
console.log("");
console.log("// Test different colors quickly:");
console.log("['red', 'green', 'blue', 'cyan', 'magenta'].forEach(color => {");
console.log("    factory.create({ color: factory.colors[color] })");
console.log("    // Observe the result, then try the next one");
console.log("});");

// 6. CLI COMMANDS (in the green terminal on the left)
console.log("\n6. CLI COMMANDS (use the green terminal interface):");
console.log("> quick fast");
console.log("> quick chaos");
console.log("> test 0x00ff00 8 25");
console.log("> factory");
console.log("> help");

// 7. ADVANCED FEATURES
console.log("\n7. ADVANCED FEATURES:");
console.log("factory.listTests()           // Show all test configurations");
console.log("factory.showActive()          // Show current active test");
console.log("factory.compare('test1', 'test2')  // Compare configurations");

// 8. INTEGRATION WITH SAVE/LOAD SYSTEM
console.log("\n8. INTEGRATION WITH SAVE/LOAD:");
console.log("presetManager.showSaved()     // Show all saved configurations");
console.log("presetManager.listBehaviors() // List saved behaviors");
console.log("presetManager.listBanks()     // List saved banks");

console.log("\n🎯 START HERE:");
console.log("Try: factory.quickTest('fast')");
console.log("Then: factory.quickTest('chaos')");
console.log("Then: factory.showColors()");

// Real demonstration you can run immediately:
setTimeout(() => {
    if (typeof factory !== 'undefined') {
        console.log("\n🚀 AUTO-DEMONSTRATION:");
        console.log("Running factory.quickTest('fast') in 3 seconds...");
        
        setTimeout(() => {
            factory.quickTest('fast');
            console.log("✅ Fast test applied! Notice the quick laser movement.");
            console.log("Try: factory.quickTest('chaos') for a different effect");
        }, 3000);
    }
}, 1000);

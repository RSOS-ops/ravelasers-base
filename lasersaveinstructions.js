// Save individual laser configs
presetManager.saveBehavior('my_blue', { laserColor: 0x0080ff, MAX_BOUNCES: 5 });

// Load individual configs  
presetManager.loadBehavior('my_blue');

// Save collections of configs
presetManager.saveBank('cool_mix', ['my_blue', 'red_default']);

// Load collections
presetManager.loadBank('cool_mix');

// See what you've saved
presetManager.showSaved();
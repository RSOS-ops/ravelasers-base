// CLI.js - Command Line Interface for Laser System
import * as THREE from 'three';

export class CLI {
    constructor() {
        this.output = null;
        this.input = null;
        this.container = null;
        this.commandHistory = [];
        this.historyIndex = -1;        this.commands = {};
        this.presetManager = null;
        this.laserFactory = null;
        
        this.setupCommands();
        this.init();
    }

    init() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setupDOM());
        } else {
            this.setupDOM();
        }
    }

    setupDOM() {
        this.container = document.getElementById('cli-container');
        this.output = document.getElementById('cli-output');
        this.input = document.getElementById('cli-input');
        const toggle = document.getElementById('cli-toggle');

        if (!this.container || !this.output || !this.input) {
            console.error('CLI: Required DOM elements not found');
            return;
        }

        // Setup event listeners
        this.input.addEventListener('keydown', (e) => this.handleKeydown(e));
        toggle.addEventListener('click', () => this.toggleCLI());

        // Welcome message
        this.addOutput('🚀 Laser CLI Ready! Type "help" for commands.', 'info');
        this.addOutput('Use arrow keys for command history.', 'info');
    }    setPresetManager(presetManager) {
        this.presetManager = presetManager;
        this.addOutput('✅ PresetManager connected!', 'info');
    }

    setLaserFactory(laserFactory) {
        this.laserFactory = laserFactory;
        this.addOutput('✅ LaserFactory connected!', 'info');
    }setupCommands() {
        this.commands = {
            help: {
                description: 'Show available commands',
                usage: 'help [command]',
                execute: (args) => this.showHelp(args)
            },
            clear: {
                description: 'Clear the output',
                usage: 'clear',
                execute: () => this.clearOutput()
            },
            'helpers-on': {
                description: 'Turn on all lighting helpers',
                usage: 'helpers-on',
                execute: () => this.setLightHelpers(true)
            },
            'helpers-off': {
                description: 'Turn off all lighting helpers',
                usage: 'helpers-off',
                execute: () => this.setLightHelpers(false)
            },            'hdri-on': {
                description: 'Enable HDRI environment lighting (invisible background)',
                usage: 'hdri-on',
                execute: () => this.toggleHDRI(true)
            },
            'hdri-off': {
                description: 'Disable HDRI environment lighting',
                usage: 'hdri-off',
                execute: () => this.toggleHDRI(false)
            },
            'hdri-bg-on': {
                description: 'Show HDRI background (visible environment)',
                usage: 'hdri-bg-on',
                execute: () => this.showHDRIBackground(true)
            },
            'hdri-bg-off': {
                description: 'Hide HDRI background (invisible but keep lighting)',
                usage: 'hdri-bg-off',
                execute: () => this.showHDRIBackground(false)
            },
            'exposure': {
                description: 'Set HDRI exposure level',
                usage: 'exposure <value>',
                execute: (args) => this.setExposure(args)
            },
            save: {
                description: 'Save a behavior configuration',
                usage: 'save <name> <color> [bounces] [radius]',
                execute: (args) => this.saveBehavior(args)
            },
            'load-behavior': {
                description: 'Load a behavior',
                usage: 'load-behavior <name>',
                execute: (args) => this.loadBehavior(args)
            },
            'load-bank': {
                description: 'Load a bank',
                usage: 'load-bank <name>',
                execute: (args) => this.loadBank(args)
            },
            'save-bank': {
                description: 'Save a bank with behaviors',
                usage: 'save-bank <name> <behavior1> [behavior2] ...',
                execute: (args) => this.saveBank(args)
            },
            list: {
                description: 'List saved behaviors or banks',
                usage: 'list [behaviors|banks]',
                execute: (args) => this.listItems(args)
            },            show: {
                description: 'Show all saved configurations',
                usage: 'show',
                execute: () => this.showAll()
            },            default: {
                description: 'Show or clear current default',
                usage: 'default [clear]',
                execute: (args) => this.manageDefault(args)
            },
            scene: {
                description: 'Show or clear current scene state',
                usage: 'scene [clear]',
                execute: (args) => this.manageScene(args)
            },
            status: {
                description: 'Show current scene state and defaults',
                usage: 'status',
                execute: () => this.showStatus()
            },
            'clear-all': {
                description: 'Clear all behaviors and scene state',
                usage: 'clear-all',
                execute: () => this.clearAllBehaviors()
            },
            preset: {
                description: 'Load a preset (legacy)',
                usage: 'preset <rave_mode|chill_mode|chaos_mode>',
                execute: (args) => this.loadPreset(args)
            },colors: {
                description: 'Show color examples',
                usage: 'colors',
                execute: () => this.showColors()
            },
            test: {
                description: 'Test a laser configuration',
                usage: 'test <preset> or test <color> [bounces] [radius]',
                execute: (args) => this.testConfiguration(args)
            },
            quick: {
                description: 'Quick test presets',
                usage: 'quick <fast|slow|bouncy|wide|fire|ice|chaos|zen>',
                execute: (args) => this.quickTest(args)
            },
            factory: {
                description: 'Show factory help',
                usage: 'factory',
                execute: () => this.showFactoryHelp()
            },            create: {
                description: 'Create array effect behavior: 4 lasers spread into 32 over time',
                usage: 'create <new_filename>',
                execute: (args) => this.createBehavior(args)
            }
        };
    }

    handleKeydown(e) {
        if (e.key === 'Enter') {
            const command = this.input.value.trim();
            if (command) {
                this.executeCommand(command);
                this.commandHistory.unshift(command);
                this.historyIndex = -1;
                this.input.value = '';
            }
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (this.historyIndex < this.commandHistory.length - 1) {
                this.historyIndex++;
                this.input.value = this.commandHistory[this.historyIndex];
            }
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (this.historyIndex > 0) {
                this.historyIndex--;
                this.input.value = this.commandHistory[this.historyIndex];
            } else if (this.historyIndex === 0) {
                this.historyIndex = -1;
                this.input.value = '';
            }
        }
    }

    executeCommand(commandLine) {
        this.addOutput(`> ${commandLine}`, 'command');
        
        const parts = commandLine.split(' ');
        const commandName = parts[0].toLowerCase();
        const args = parts.slice(1);

        if (this.commands[commandName]) {
            try {
                this.commands[commandName].execute(args);
            } catch (error) {
                this.addOutput(`Error: ${error.message}`, 'error');
            }
        } else {
            this.addOutput(`Unknown command: ${commandName}. Type "help" for available commands.`, 'error');
        }
    }

    addOutput(text, type = 'result') {
        const line = document.createElement('div');
        line.className = `cli-output-line cli-${type}`;
        line.textContent = text;
        this.output.appendChild(line);
        this.output.scrollTop = this.output.scrollHeight;
    }

    showHelp(args) {
        if (args.length === 0) {
            this.addOutput('Available commands:', 'info');
            Object.entries(this.commands).forEach(([name, cmd]) => {
                this.addOutput(`  ${name.padEnd(8)} - ${cmd.description}`, 'result');
            });
            this.addOutput('\nType "help <command>" for detailed usage.', 'info');
        } else {
            const commandName = args[0].toLowerCase();
            const cmd = this.commands[commandName];
            if (cmd) {
                this.addOutput(`${commandName}: ${cmd.description}`, 'info');
                this.addOutput(`Usage: ${cmd.usage}`, 'result');
            } else {
                this.addOutput(`Unknown command: ${commandName}`, 'error');
            }
        }
    }

    clearOutput() {
        this.output.innerHTML = '';
        this.addOutput('Output cleared.', 'info');
    }

    saveBehavior(args) {
        if (!this.presetManager) {
            this.addOutput('PresetManager not available!', 'error');
            return;
        }

        if (args.length < 2) {
            this.addOutput('Usage: save <name> <color> [bounces] [radius]', 'error');
            this.addOutput('Example: save my_blue 0x0080ff 5 15', 'info');
            return;
        }

        const [name, colorStr, bouncesStr, radiusStr] = args;
        
        try {
            const config = {
                laserColor: parseInt(colorStr, 16)
            };

            if (bouncesStr) config.MAX_BOUNCES = parseInt(bouncesStr);
            if (radiusStr) config.ORIGIN_SPHERE_RADIUS = parseInt(radiusStr);

            this.presetManager.saveBehavior(name, config);
            this.addOutput(`✅ Saved behavior: ${name}`, 'result');
        } catch (error) {
            this.addOutput(`Error saving behavior: ${error.message}`, 'error');
        }
    }    loadBehavior(args) {
        if (!this.presetManager) {
            this.addOutput('PresetManager not available!', 'error');
            return;
        }

        if (args.length < 1) {
            this.addOutput('Usage: load-behavior <name>', 'error');
            return;
        }

        const name = args[0];
        if (this.presetManager.loadBehavior(name)) {
            this.addOutput(`✅ Loaded behavior: ${name} (set as default)`, 'result');
        } else {
            this.addOutput(`❌ Failed to load behavior: ${name}`, 'error');
        }
    }

    loadBank(args) {
        if (!this.presetManager) {
            this.addOutput('PresetManager not available!', 'error');
            return;
        }

        if (args.length < 1) {
            this.addOutput('Usage: load-bank <name>', 'error');
            return;
        }

        const name = args[0];
        if (this.presetManager.loadBank(name)) {
            this.addOutput(`✅ Loaded bank: ${name} (set as default)`, 'result');
        } else {
            this.addOutput(`❌ Failed to load bank: ${name}`, 'error');
        }
    }

    saveBank(args) {
        if (!this.presetManager) {
            this.addOutput('PresetManager not available!', 'error');
            return;
        }

        if (args.length < 2) {
            this.addOutput('Usage: save-bank <name> <behavior1> [behavior2] ...', 'error');
            this.addOutput('Example: save-bank my_mix red_default green_lasers', 'info');
            return;
        }

        const [bankName, ...behaviorNames] = args;
        if (this.presetManager.saveBank(bankName, behaviorNames)) {
            this.addOutput(`✅ Saved bank: ${bankName}`, 'result');
        } else {
            this.addOutput(`❌ Failed to save bank: ${bankName}`, 'error');
        }
    }

    listItems(args) {
        if (!this.presetManager) {
            this.addOutput('PresetManager not available!', 'error');
            return;
        }

        const type = args[0] ? args[0].toLowerCase() : 'both';

        if (type === 'behaviors' || type === 'both') {
            const behaviors = this.presetManager.listBehaviors();
            this.addOutput(`Behaviors (${behaviors.length}):`, 'info');
            behaviors.forEach(name => this.addOutput(`  • ${name}`, 'result'));
        }

        if (type === 'banks' || type === 'both') {
            const banks = this.presetManager.listBanks();
            this.addOutput(`Banks (${banks.length}):`, 'info');
            banks.forEach(name => this.addOutput(`  • ${name}`, 'result'));
        }
    }    showAll() {
        if (!this.presetManager) {
            this.addOutput('PresetManager not available!', 'error');
            return;
        }

        // Get behaviors and banks data directly instead of using showSaved()
        const behaviors = this.presetManager.listBehaviors();
        const banks = this.presetManager.listBanks();

        this.addOutput('=== SAVE/LOAD SUMMARY ===', 'info');
        this.addOutput(`Behaviors: ${behaviors.length}`, 'result');
        this.addOutput(`Banks: ${banks.length}`, 'result');
        
        if (behaviors.length > 0) {
            this.addOutput('\n📋 Saved Behaviors:', 'info');
            behaviors.forEach(name => {
                this.addOutput(`  • ${name}`, 'result');
            });
        } else {
            this.addOutput('\n📋 Saved Behaviors: (none saved)', 'info');
        }        if (banks.length > 0) {
            this.addOutput('\n📋 Saved Banks:', 'info');
            const saveLoadManager = this.presetManager.getSaveLoadManager();
            banks.forEach(name => {
                // Get bank contents without loading
                const bankData = saveLoadManager.savedBanks.get(name);
                if (bankData) {
                    this.addOutput(`  • ${name}: [${bankData.join(', ')}]`, 'result');
                } else {
                    this.addOutput(`  • ${name}`, 'result');
                }
            });
        } else {
            this.addOutput('\n📋 Saved Banks: (none saved)', 'info');
        }
        
        this.addOutput('========================', 'info');
    }

    loadPreset(args) {
        if (!this.presetManager) {
            this.addOutput('PresetManager not available!', 'error');
            return;
        }

        if (args.length < 1) {
            this.addOutput('Usage: preset <rave_mode|chill_mode|chaos_mode>', 'error');
            return;
        }

        const presetName = args[0];
        try {
            this.presetManager.applyPreset(presetName);
            this.addOutput(`✅ Applied preset: ${presetName}`, 'result');
        } catch (error) {
            this.addOutput(`❌ Failed to apply preset: ${presetName}`, 'error');
        }
    }    showColors() {
        this.addOutput('Common laser colors:', 'info');
        this.addOutput('  Red:     0xff0000', 'result');
        this.addOutput('  Green:   0x00ff00', 'result');
        this.addOutput('  Blue:    0x0000ff', 'result');
        this.addOutput('  Cyan:    0x00ffff', 'result');
        this.addOutput('  Magenta: 0xff00ff', 'result');
        this.addOutput('  Yellow:  0xffff00', 'result');
        this.addOutput('  White:   0xffffff', 'result');
        this.addOutput('  Orange:  0xff8000', 'result');
        this.addOutput('  Purple:  0x8000ff', 'result');
        this.addOutput('  Pink:    0xff0080', 'result');
    }

    testConfiguration(args) {
        if (!this.laserFactory) {
            this.addOutput('LaserFactory not available!', 'error');
            return;
        }

        if (args.length === 0) {
            this.addOutput('Usage: test <color> [bounces] [radius]', 'error');
            this.addOutput('Example: test 0x00ff00 5 15', 'info');
            return;
        }

        try {
            const [colorStr, bouncesStr, radiusStr] = args;
            const config = {
                laserColor: parseInt(colorStr, 16)
            };

            if (bouncesStr) config.MAX_BOUNCES = parseInt(bouncesStr);
            if (radiusStr) config.ORIGIN_SPHERE_RADIUS = parseInt(radiusStr);

            this.laserFactory.test(config, 'cli_test');
            this.addOutput('✅ Test configuration applied!', 'result');
            this.addOutput('Use console: factory.save("cli_test") to save', 'info');
        } catch (error) {
            this.addOutput(`Error testing configuration: ${error.message}`, 'error');
        }
    }

    quickTest(args) {
        if (!this.laserFactory) {
            this.addOutput('LaserFactory not available!', 'error');
            return;
        }

        if (args.length === 0) {
            this.addOutput('Usage: quick <preset>', 'error');
            this.addOutput('Presets: fast, slow, bouncy, wide, fire, ice, chaos, zen', 'info');
            return;
        }

        const preset = args[0];
        try {
            this.laserFactory.quickTest(preset);
            this.addOutput(`✅ Applied quick test: ${preset}`, 'result');
        } catch (error) {
            this.addOutput(`Error with quick test: ${error.message}`, 'error');
        }
    }

    showFactoryHelp() {
        this.addOutput('🏭 LaserFactory Console Commands:', 'info');
        this.addOutput('  factory.quickTest("fast")  - Test fast lasers', 'result');
        this.addOutput('  factory.quickTest("chaos") - Test chaotic setup', 'result');
        this.addOutput('  factory.showColors()       - Show color palette', 'result');
        this.addOutput('  factory.create({color: 0xff0000, bounces: 5})', 'result');
        this.addOutput('  factory.save()             - Save current test', 'result');
        this.addOutput('  factory.listTests()        - Show all tests', 'result');
        this.addOutput('', 'result');
        this.addOutput('Use CLI commands for simple testing:', 'info');
        this.addOutput('  quick fast, quick chaos, test 0xff0000 5 15', 'result');
    }

    toggleCLI() {
        this.container.classList.toggle('collapsed');
        const toggle = document.getElementById('cli-toggle');
        const content = document.getElementById('cli-content');
        
        if (this.container.classList.contains('collapsed')) {
            toggle.textContent = '+';
            content.style.display = 'none';
        } else {
            toggle.textContent = '−';
            content.style.display = 'block';        this.input.focus();
        }
    }

    setLightHelpers(visibility) {
        if (!window.scene) {
            this.addOutput('Scene not available!', 'error');
            return;
        }

        const scene = window.scene;
        
        // Find all light helpers in the scene
        const helpers = [];
        scene.traverse((object) => {
            if (object.type === 'DirectionalLightHelper' || 
                object.type === 'SpotLightHelper' || 
                object.type === 'PointLightHelper') {
                helpers.push(object);
            }
        });

        if (helpers.length === 0) {
            this.addOutput('No light helpers found in scene.', 'info');
            return;
        }

        // Apply visibility to all helpers
        helpers.forEach(helper => {
            helper.visible = visibility;
        });

        // Save the helper state to scene-default
        if (this.presetManager) {
            const saveLoadManager = this.presetManager.getSaveLoadManager();
            saveLoadManager.setSceneDefaultHelpers(visibility);
        }

        const status = visibility ? 'ON' : 'OFF';
        this.addOutput(`💡 Light helpers turned ${status} (${helpers.length} helpers)`, 'result');        this.addOutput('Helper state saved and will persist on reload', 'info');
    }    toggleHDRI(enabled) {
        if (!window.scene) {
            this.addOutput('Scene not available!', 'error');
            return;
        }

        const scene = window.scene;
        
        if (enabled) {
            // Enable HDRI environment lighting but keep background black
            if (window.hdriTexture) {
                scene.environment = window.hdriTexture; // Lighting only
                scene.background = new THREE.Color(0x000000); // Keep black background
                this.addOutput('🌅 HDRI environment lighting enabled (invisible background)', 'result');
            } else {
                this.addOutput('❌ HDRI texture not loaded', 'error');
            }
        } else {
            // Disable HDRI environment completely
            scene.background = new THREE.Color(0x000000);
            scene.environment = null;
            this.addOutput('⚫ HDRI disabled - no environment lighting', 'result');
        }
    }

    showHDRIBackground(show) {
        if (!window.scene) {
            this.addOutput('Scene not available!', 'error');
            return;
        }

        const scene = window.scene;
        
        if (show) {
            // Show HDRI as background (if loaded)
            if (window.hdriTexture) {
                scene.background = window.hdriTexture;
                scene.environment = window.hdriTexture; // Also ensure environment is on
                this.addOutput('🖼️ HDRI background visible', 'result');
            } else {
                this.addOutput('❌ HDRI texture not loaded', 'error');
            }
        } else {
            // Hide background but keep environment lighting
            if (window.hdriTexture) {
                scene.background = new THREE.Color(0x000000); // Black background
                scene.environment = window.hdriTexture; // Keep lighting
                this.addOutput('🌅 HDRI background hidden (lighting preserved)', 'result');
            } else {
                scene.background = new THREE.Color(0x000000);
                this.addOutput('⚫ Black background set', 'result');
            }
        }
    }

    setExposure(args) {
        if (!window.renderer) {
            this.addOutput('Renderer not available!', 'error');
            return;
        }

        if (args.length === 0) {
            this.addOutput(`Current exposure: ${window.renderer.toneMappingExposure}`, 'info');
            return;
        }

        const exposure = parseFloat(args[0]);
        if (isNaN(exposure)) {
            this.addOutput('Invalid exposure value. Use a number (e.g., 0.8)', 'error');
            return;
        }

        window.renderer.toneMappingExposure = exposure;
        this.addOutput(`🎛️ Exposure set to ${exposure}`, 'result');
    }

    // ...existing methods...
    manageDefault(args) {
        if (!this.presetManager) {
            this.addOutput('PresetManager not available!', 'error');
            return;
        }

        const saveLoadManager = this.presetManager.getSaveLoadManager();
        
        if (args.length > 0 && args[0].toLowerCase() === 'clear') {
            saveLoadManager.clearDefault();
            this.addOutput('🗑️ Cleared default setting', 'result');
            return;
        }

        const defaultSetting = saveLoadManager.getDefault();
        if (defaultSetting) {
            this.addOutput(`📌 Current default ${defaultSetting.type}: ${defaultSetting.name}`, 'info');
            this.addOutput('Use "default clear" to clear the default', 'info');
        } else {
            this.addOutput('💡 No default set', 'info');
            this.addOutput('Load any behavior or bank to set it as default', 'info');
        }
    }

    manageScene(args) {
        if (!this.presetManager) {
            this.addOutput('PresetManager not available!', 'error');
            return;
        }

        const saveLoadManager = this.presetManager.getSaveLoadManager();
        
        if (args.length > 0 && args[0].toLowerCase() === 'clear') {
            saveLoadManager.clearSceneDefault();
            this.addOutput('🗑️ Cleared scene-default setting', 'result');
            return;
        }

        const sceneDefault = saveLoadManager.getSceneDefault();
        if (sceneDefault) {
            this.addOutput(`🎬 Current scene-default ${sceneDefault.type}: ${sceneDefault.name}`, 'info');
            this.addOutput('This will reload on next page refresh', 'info');
            this.addOutput('Use "scene clear" to clear the scene-default', 'info');
        } else {
            this.addOutput('💡 No scene-default set', 'info');
            this.addOutput('Load any behavior or bank to set it as scene-default', 'info');        }
    }

    showStatus() {
        if (!this.presetManager) {
            this.addOutput('PresetManager not available!', 'error');
            return;
        }

        const saveLoadManager = this.presetManager.getSaveLoadManager();
        const sceneDefault = saveLoadManager.getSceneDefault();
        const defaultSetting = saveLoadManager.getDefault();
        const helpersVisible = saveLoadManager.getSceneDefaultHelpers();

        this.addOutput('=== CURRENT STATUS ===', 'info');
        
        if (sceneDefault) {
            this.addOutput(`🎬 Scene-default: ${sceneDefault.type} "${sceneDefault.name}"`, 'result');
            this.addOutput('  (This will reload on page refresh)', 'info');
        } else {
            this.addOutput('🎬 Scene-default: None set', 'info');
        }

        if (defaultSetting) {
            this.addOutput(`📌 Default: ${defaultSetting.type} "${defaultSetting.name}"`, 'result');
            this.addOutput('  (Fallback if no scene-default)', 'info');
        } else {
            this.addOutput('📌 Default: None set', 'info');
        }

        if (helpersVisible !== null) {
            this.addOutput(`💡 Light helpers: ${helpersVisible ? 'ON' : 'OFF'}`, 'result');
            this.addOutput('  (Persistent across reloads)', 'info');
        } else {
            this.addOutput('💡 Light helpers: Not set', 'info');
        }

        this.addOutput('======================', 'info');
    }

    clearAllBehaviors() {
        if (!this.presetManager) {
            this.addOutput('PresetManager not available!', 'error');
            return;
        }

        this.presetManager.clearAll();
        this.addOutput('🧹 Cleared all behaviors and scene-default', 'result');
        this.addOutput('Page will start empty on next reload', 'info');
    }

    createBehavior(args) {
        if (!this.presetManager) {
            this.addOutput('PresetManager not available!', 'error');
            return;
        }

        if (args.length < 1) {
            this.addOutput('Usage: create <new_filename>', 'error');
            this.addOutput('Example: create array_1', 'info');
            return;
        }

        const newName = args[0].replace(/[^a-zA-Z0-9_]/g, '').toLowerCase();
        if (!newName) {
            this.addOutput('Invalid filename. Use only letters, numbers, and underscores.', 'error');
            return;
        }

        // Check if behavior already exists
        if (this.presetManager.getSaveLoadManager().savedBehaviors.has(newName)) {
            this.addOutput(`❌ Behavior "${newName}" already exists!`, 'error');
            return;
        }

        try {
            // Generate the new behavior class code
            const className = this._capitalize(newName);
            const newBehaviorCode = this._generateBehaviorCode(newName, className);
            
            // Register the behavior in memory
            this._registerBehaviorInMemory(newName, className, newBehaviorCode);
            
            // Auto-save the behavior
            this.presetManager.saveBehavior(newName, { laserColor: 0x0000ff }, newName);
            
            this.addOutput(`✅ Created new behavior: "${newName}"`, 'result');
            this.addOutput(`✅ Registered "${newName}" in behaviors registry`, 'result');
            this.addOutput(`✅ Auto-saved "${newName}" behavior`, 'result');
            this.addOutput('', 'info');
            this.addOutput('📄 To create the physical file, copy this code:', 'info');
            this.addOutput('', 'info');
            this.addOutput(`File: behaviors/${newName}.js`, 'code');
            this.addOutput('', 'info');
            this.addOutput(newBehaviorCode, 'code');
            this.addOutput('', 'info');
            this.addOutput(`Now you can use: load-behavior ${newName}`, 'result');
            
        } catch (error) {
            this.addOutput(`❌ Error creating behavior: ${error.message}`, 'error');
        }
    }

    _capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    _generateBehaviorCode(newName, className) {
        return `// Behavior${className}.js - Four blue lasers from corners targeting the 3D model (clone of start.js)
import * as THREE from 'three';

export class Behavior${className} {
    constructor(config = {}) {
        this.laserColor = config.laserColor || 0x0000ff;
        this.lasers = [];
        this.target = config.target || null; // Should be a THREE.Object3D
        this.id = '${newName}';
    }

    // Called to initialize lasers
    init(laserSystem) {
        this.lasers = [];
        const scene = laserSystem.getScene();
        const camera = laserSystem.getCamera();
        const target = laserSystem.getModel();
        
        const corners = this._getScreenCorners(camera, scene);
        // Defensive: ensure target and target.position exist
        const targetPos = (target && target.position) ? target.position.clone() : new THREE.Vector3(0, 0, 0);
        
        for (let i = 0; i < 4; i++) {
            // Defensive: ensure corners[i] is valid
            const start = corners[i] ? corners[i].clone() : new THREE.Vector3(0, 0, 0);
            const laser = this._createLaser(start, targetPos);
            scene.add(laser);
            this.lasers.push(laser);
        }
    }

    // Called every frame to update laser directions
    update(deltaTime, clock, laserSystem) {
        const camera = laserSystem.getCamera();
        const target = laserSystem.getModel();
        
        // Defensive: ensure target and target.position exist
        if (!target || !target.position) return;
        
        const corners = this._getScreenCorners(camera);
        for (let i = 0; i < 4; i++) {
            const laser = this.lasers[i];
            if (!laser) continue;
            // Defensive: ensure corners[i] is valid
            const start = corners[i] ? corners[i] : new THREE.Vector3(0, 0, 0);
            const positions = laser.geometry.attributes.position.array;
            positions[0] = start.x;
            positions[1] = start.y;
            positions[2] = start.z;
            positions[3] = target.position.x;
            positions[4] = target.position.y;
            positions[5] = target.position.z;
            laser.geometry.attributes.position.needsUpdate = true;
        }
    }

    // Helper to create a laser (THREE.Line) from start to end
    _createLaser(start, end) {
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array([
            start.x, start.y, start.z,
            end.x, end.y, end.z
        ]);
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        const material = new THREE.LineBasicMaterial({ color: this.laserColor });
        return new THREE.Line(geometry, material);
    }

    // Get world positions for the 4 screen corners
    _getScreenCorners(camera, scene) {
        // Defensive: ensure camera is defined and has projectionMatrixInverse
        if (!camera || typeof camera.unproject !== 'function' || !camera.projectionMatrixInverse) {
            // Fallback: return corners at visible positions
            return [
                new THREE.Vector3(-10, 10, -10),
                new THREE.Vector3(10, 10, -10),
                new THREE.Vector3(-10, -10, -10),
                new THREE.Vector3(10, -10, -10)
            ];
        }
        // NDC corners: [(-1,1), (1,1), (-1,-1), (1,-1)]
        const ndc = [
            new THREE.Vector3(-1, 1, -1),
            new THREE.Vector3(1, 1, -1),
            new THREE.Vector3(-1, -1, -1),
            new THREE.Vector3(1, -1, -1)
        ];
        // Project from NDC to world at near plane
        return ndc.map(v => v.clone().unproject(camera));
    }    // Cleanup method to remove lasers from the scene
    cleanup(laserSystem) {
        // Remove lasers from the scene
        if (this.lasers && laserSystem && laserSystem.getScene) {
            const scene = laserSystem.getScene();
            this.lasers.forEach(laser => scene.remove(laser));
        }
        this.lasers = [];
    }
};
export default Behavior${className};`;
    }

    _registerBehaviorInMemory(newName, className, newBehaviorCode) {
        try {
            // Create a data URL containing the behavior code
            const blob = new Blob([newBehaviorCode], { type: 'application/javascript' });
            const url = URL.createObjectURL(blob);
            
            // Dynamically import and register the behavior
            import(url).then(module => {
                const BehaviorClass = module.default;
                
                // Add to behaviors registry if it exists
                if (window.behaviors) {
                    window.behaviors[newName] = (config = {}) => new BehaviorClass(config);
                }
                
                // Add to savedBehaviorConfigs if it exists
                if (window.savedBehaviorConfigs) {
                    window.savedBehaviorConfigs[newName] = { 
                        laserColor: 0x0000ff, 
                        _behaviorType: newName 
                    };
                }
                
                // Clean up the blob URL
                URL.revokeObjectURL(url);
                
                this.addOutput(`✅ Dynamically registered "${newName}" behavior`, 'result');
            }).catch(error => {
                this.addOutput(`⚠️ Could not dynamically register behavior: ${error.message}`, 'error');
                this.addOutput('The behavior was created but needs manual registration in behaviors.js', 'info');
            });
              } catch (error) {
            this.addOutput(`⚠️ Dynamic registration failed: ${error.message}`, 'error');
            this.addOutput('The behavior was created but needs manual registration in behaviors.js', 'info');
        }
    }
}

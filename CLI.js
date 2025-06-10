// CLI.js - Command Line Interface for Laser System

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
            },
            show: {
                description: 'Show all saved configurations',
                usage: 'show',
                execute: () => this.showAll()
            },
            preset: {
                description: 'Load a preset (legacy)',
                usage: 'preset <rave_mode|chill_mode|chaos_mode>',
                execute: (args) => this.loadPreset(args)
            },            colors: {
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
            this.addOutput(`✅ Loaded behavior: ${name}`, 'result');
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
            this.addOutput(`✅ Loaded bank: ${name}`, 'result');
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
            content.style.display = 'block';
            this.input.focus();
        }
    }
}

# CLI Commands Reference

## Overview
Use these commands in the **green CLI terminal** on the left side of the screen. The CLI provides an easy interface to manage laser configurations without using the browser console.

**✨ New Features:**
- **Automatic Persistence**: All loaded behaviors and banks automatically become your default and reload on page refresh
- **Multiple Behavior Types**: Support for different laser behavior types (default, wireframe)
- **Enhanced CLI**: Comprehensive command set with testing, helpers, and factory integration

---

## Basic Commands

### `help`
Show all available commands
```
> help
```

### `help <command>`
Get detailed help for a specific command
```
> help save
> help load-behavior
> help default
```

### `clear`
Clear the CLI output screen
```
> clear
```

---

## Behavior Management

### `save <n> <color> [bounces] [radius]`
Save a new laser behavior configuration
```
> save my_blue 0x0080ff 5 15
> save fast_red 0xff0000 3 10
> save chaos 0x00ff00 8 25
```

### `load-behavior <n>`
Load a previously saved behavior (automatically becomes default)
```
> load-behavior my_blue
> load-behavior red_default
> load-behavior wireframe_default
```
*Note: Loading a behavior sets it as your default and it will automatically load on page refresh*

---

## Bank Management

### `save-bank <n> <behavior1> [behavior2] [behavior3]...`
Save a bank containing multiple behaviors
```
> save-bank party_mix red_default green_lasers blue_bounce
> save-bank simple_show my_blue
> save-bank chaos_mode red_default green_lasers blue_bounce yellow_wide
```

### `load-bank <n>`
Load a bank (collection of behaviors) (automatically becomes default)
```
> load-bank party_mix
> load-bank rave_mode
> load-bank chill_mode
```
*Note: Loading a bank sets it as your default and it will automatically load on page refresh*

---

## Default Management

### `default`
Show current default behavior or bank
```
> default
```

### `default clear`
Clear the current default setting
```
> default clear
```

### `scene`
Show current scene-default (what will reload on page refresh)
```
> scene
```

### `scene clear`
Clear the current scene-default
```
> scene clear
```

### `status`
Show both scene-default and regular default
```
> status
```

### `clear-all`
Clear all behaviors and scene-default
```
> clear-all
```

**How Persistence Works:**
- **Scene-default**: Automatically set when you load any behavior or bank
- **Regular default**: Manually set fallback (rarely needed now)
- **Priority**: Scene-default → Regular default → Nothing
- Any behavior/bank you load becomes your scene-default and persists across reloads
- Use `clear-all` for completely fresh starts

---

## Testing & Development

### `test <color> [bounces] [radius]`
Test a laser configuration temporarily
```
> test 0x00ff00 5 15
> test 0xff0000
> test 0x0080ff 8 20
```

### `quick <preset>`
Apply quick test presets for rapid prototyping
```
> quick fast
> quick slow
> quick bouncy
> quick wide
> quick fire
> quick ice
> quick chaos
> quick zen
```

**Available Quick Presets:**
- `fast` - High-speed lasers
- `slow` - Relaxed pace
- `bouncy` - Many bounces
- `wide` - Large origin sphere
- `fire` - Red/orange chaos
- `ice` - Cool blue tones
- `chaos` - Random everything
- `zen` - Calm and minimal

---

## Scene Helpers

### `helpers-on`
Turn on light helpers for debugging (persistent across reloads)
```
> helpers-on
```

### `helpers-off`
Turn off light helpers (persistent across reloads)
```
> helpers-off
```

**Helper Persistence:**
- Helper visibility state is automatically saved to scene-default
- Your helper preference (on/off) persists across page reloads
- Use `status` command to see current helper state
- Use `clear-all` to reset helper state along with other scene data

---

## Information Commands

### `list`
List all saved behaviors and banks
```
> list
```

### `list behaviors`
List only saved behaviors
```
> list behaviors
```

### `list banks`
List only saved banks
```
> list banks
```

### `show`
Show complete summary of all saved items with details
```
> show
```

### `factory`
Show factory console commands help
```
> factory
```

---

## Color Reference

### `colors`
Display available color hex codes
```
> colors
```

**Common Colors:**
- Red: `0xff0000`
- Green: `0x00ff00`
- Blue: `0x0000ff`
- Cyan: `0x00ffff`
- Magenta: `0xff00ff`
- Yellow: `0xffff00`
- Orange: `0xff8000`
- Purple: `0x8000ff`
- White: `0xffffff`

---

## Legacy Presets

### `preset <n>`
Load built-in preset configurations (legacy)
```
> preset rave_mode
> preset chill_mode
> preset chaos_mode
```

---

## Parameter Reference

### Behavior Parameters
When using `save <n> <color> [bounces] [radius]`:

- **`<n>`**: Unique identifier for your configuration
- **`<color>`**: Hex color code (e.g., `0xff0000` for red)
- **`[bounces]`**: Number of bounces (1-10, optional, default: 3)
- **`[radius]`**: Origin sphere radius (5-30, optional, default: 10)

### Examples with Parameters
```
> save slow_blue 0x0080ff 2 8      # Blue, 2 bounces, small radius
> save wild_green 0x00ff00 8 25    # Green, 8 bounces, large radius
> save simple_red 0xff0000         # Red with default bounces & radius
```

---

## Built-in Configurations

### Available Behavior Types
- **default** - Standard laser behaviors with physics-based movement
- **wireframe** - Wireframe rendering style behaviors

### Default Behaviors
- `red_default` - Standard red lasers (default type)
- `green_lasers` - Green laser configuration
- `blue_bounce` - Blue with extra bounces  
- `yellow_wide` - Yellow with wide origin sphere
- `wireframe_default` - Green wireframe lasers (wireframe type)

### Default Banks
- `rave_mode` - High-energy laser show
- `chill_mode` - Calm, relaxed lasers
- `chaos_mode` - Multiple behaviors running simultaneously

---

## Complete Command List

| Command | Description |
|---------|-------------|
| `help` | Show all commands or help for specific command |
| `clear` | Clear output screen |
| `save` | Save behavior configuration |
| `load-behavior` | Load saved behavior (sets as scene-default) |
| `load-bank` | Load saved bank (sets as scene-default) |
| `save-bank` | Save bank with multiple behaviors |
| `list` | List saved behaviors and/or banks |
| `show` | Show complete summary with details |
| `default` | Show or clear current default |
| `scene` | Show or clear current scene-default |
| `status` | Show both scene-default and regular default |
| `clear-all` | Clear all behaviors and scene-default |
| `test` | Test laser configuration temporarily |
| `quick` | Apply quick test presets |
| `colors` | Show color reference |
| `preset` | Load legacy presets |
| `factory` | Show factory console commands |
| `helpers-on` | Enable light helpers |
| `helpers-off` | Disable light helpers |

---

## Usage Tips

1. **Start Simple**: Try `load-behavior red_default` first
2. **Persistence**: Any behavior/bank you load becomes your default
3. **Experiment**: Use `test` and `quick` for rapid prototyping
4. **Organize**: Group related behaviors into banks
5. **Reference**: Use `show` to see what you've created
6. **Debugging**: Use `helpers-on` to see light positions
7. **Help**: Type `help <command>` for detailed command help

---

## Example Workflows

### Basic Setup
```bash
# Load a default to see how it works
> load-behavior red_default

# It's now your default - will reload on page refresh
> default
```

### Create Custom Behaviors
```bash
# Create your own variations
> save my_favorite 0xff0080 5 15
> save speed_demon 0x00ff00 3 8
> save bouncy_castle 0x0080ff 10 20

# Test quickly
> quick chaos
> test 0x00ffff 6 12
```

### Build Collections
```bash
# Group behaviors into a bank
> save-bank my_collection my_favorite speed_demon bouncy_castle

# Load your collection (becomes default)
> load-bank my_collection

# See what you've built
> show
```

### Persistence Management
```bash
# Check current scene state
> status

# Load something - automatically becomes scene-default
> load-behavior wireframe_default

# Verify it's set
> scene

# Page reload will now restore wireframe_default automatically

# Want fresh starts? Clear everything
> clear-all

# Now page reloads will be empty until you load something new
```

### Scene-Default vs Regular Default
```bash
# Scene-default: automatic persistence (recommended)
> load-behavior my_favorite    # Automatically persisted

# Regular default: manual fallback setting (advanced)
> default                      # Shows manual default
> default clear               # Clear manual default

# Priority: scene-default always wins over regular default
> status                       # Shows both for comparison
```

---

## Troubleshooting

**Command not recognized?**
- Type `help` to see all available commands
- Check spelling and syntax

**Color not working?**
- Use `colors` to see valid hex codes
- Make sure to include `0x` prefix

**Behavior not found?**
- Use `list behaviors` to see saved behaviors
- Check the exact name (case-sensitive)

**Bank not loading?**
- Use `list banks` to see saved banks
- Make sure all behaviors in the bank exist

**Default not persisting?**
- Check browser local storage permissions
- Try `default clear` and reload a behavior

**Need to debug?**
- Use `helpers-on` to see light positions
- Use `factory` for advanced console commands
- Check browser console for technical errors

---

## 🎯 **Face-Based Laser Targeting System**

### **WIREFRAME BEHAVIOR - Updated for Face Targeting**

The wireframe behavior has been enhanced to target **random faces** on the model instead of vertices, providing more realistic laser interactions:

#### **🔺 Face Targeting Features:**
- **Random Face Selection**: Lasers target the center point of randomly selected triangular faces
- **Face Normal Reflection**: Lasers reflect off the true surface normal of the targeted face
- **Improved Realism**: More accurate lighting physics with face-based interactions
- **Dynamic Retargeting**: Lasers retarget to new random faces when camera movement stops

#### **🔧 Technical Implementation:**
- `extractModelFaces()`: Extracts all triangular faces from loaded model geometry
- `getRandomModelFace()`: Returns random face with center point, normal vector, and vertices
- Face data includes:
  - `center`: Vector3 position at face center
  - `normal`: Vector3 surface normal for accurate reflection
  - `vertices`: Array of 3 vertices defining the triangular face

#### **🎮 Usage:**
```
> behavior wireframe
🔥 Wireframe behavior activated with face targeting
```

#### **💡 Debug Information:**
The wireframe behavior now logs detailed face targeting information:
- Face center coordinates for each laser
- Surface normal vectors for reflection calculations
- Retargeting events when lasers jump to new faces

---
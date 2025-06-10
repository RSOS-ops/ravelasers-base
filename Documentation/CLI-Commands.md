# CLI Commands Reference

## Overview
Use these commands in the **green CLI terminal** on the left side of the screen. The CLI provides an easy interface to manage laser configurations without using the browser console.

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
```

### `clear`
Clear the CLI output screen
```
> clear
```

---

## Behavior Management

### `save <name> <color> [bounces] [radius]`
Save a new laser behavior configuration
```
> save my_blue 0x0080ff 5 15
> save fast_red 0xff0000 3 10
> save chaos 0x00ff00 8 25
```

### `load-behavior <name>`
Load a previously saved behavior
```
> load-behavior my_blue
> load-behavior red_default
> load-behavior green_lasers
```

---

## Bank Management

### `save-bank <name> <behavior1> [behavior2] [behavior3]...`
Save a bank containing multiple behaviors
```
> save-bank party_mix red_default green_lasers blue_bounce
> save-bank simple_show my_blue
> save-bank chaos_mode red_default green_lasers blue_bounce yellow_wide
```

### `load-bank <name>`
Load a bank (collection of behaviors)
```
> load-bank party_mix
> load-bank rave_mode
> load-bank chill_mode
```

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

## Quick Presets

### `preset <name>`
Load built-in preset configurations
```
> preset rave_mode
> preset chill_mode
> preset chaos_mode
```

---

## Parameter Reference

### Behavior Parameters
When using `save <name> <color> [bounces] [radius]`:

- **`<name>`**: Unique identifier for your configuration
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

### Default Behaviors
- `red_default` - Standard red lasers
- `green_lasers` - Green laser configuration
- `blue_bounce` - Blue with extra bounces
- `yellow_wide` - Yellow with wide origin sphere

### Default Banks
- `rave_mode` - High-energy laser show
- `chill_mode` - Calm, relaxed lasers
- `chaos_mode` - Multiple behaviors running simultaneously

---

## Usage Tips

1. **Start Simple**: Try `load-behavior red_default` first
2. **Experiment**: Use `save` to create variations with different colors
3. **Organize**: Group related behaviors into banks
4. **Reference**: Use `show` to see what you've created
5. **Help**: Type `help <command>` for detailed command help

---

## Example Workflow

```bash
# 1. Load a default to see how it works
> load-behavior red_default

# 2. Create your own variation
> save my_favorite 0xff0080 5 15

# 3. Create more variations
> save speed_demon 0x00ff00 3 8
> save bouncy_castle 0x0080ff 10 20

# 4. Group them into a collection
> save-bank my_collection my_favorite speed_demon bouncy_castle

# 5. Load your collection anytime
> load-bank my_collection

# 6. See what you've built
> show
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
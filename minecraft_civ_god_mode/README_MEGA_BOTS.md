# Minecraft Mega Bot System - Complete Documentation

## 🎯 Overview

The Minecraft Mega Bot System is an advanced automation framework featuring 30+ specialized bots that work together to build entire cities in Minecraft based on user stories or images.

## 📚 System Architecture

### Layer 1: Creative & Planning Bots
- **Story Analyzer Bot**: Analyzes text stories, extracts keywords, themes, and emotions
- **Image Vision Bot**: Processes images to identify colors, patterns, and structures
- **City Architect Bot**: Creates master city plans with zones, roads, and landmarks
- **Theme Designer Bot**: Manages architectural themes and block palettes

### Layer 2: Resource Gathering Bots
- **Lumberjack Squad Bot**: Manages teams of logging workers
- **Lumberjack Worker Bots** (x10): Individual tree choppers with auto-replant
- **Miner Chief Bot**: Oversees mining operations
- **Miner Worker Bots** (x10): Strip mining and ore collection
- **Farmer Bot**: Automated farming and food production
- **Fisherman Bot**: Fishing and food backup

### Layer 3: Construction Bots
- **Foundation Builder Bot**: Terrain clearing and foundation laying
- **Wall Builder Bots** (x5): Vertical wall construction
- **Roof Builder Bot**: Various roof styles
- **Interior Designer Bot**: Furniture and decoration placement
- **Road Paver Bot**: Roads, sidewalks, and street lighting
- **Landscaper Bot**: Gardens, parks, and terrain beautification
- **Skyscraper Specialist Bot**: Tall building construction

### Layer 4: Support & Logistics Bots
- **Supply Chain Bot**: Material distribution management
- **Courier Bots** (x5): Fast item transportation
- **Inventory Manager Bot**: Resource tracking and optimization
- **Tool Smith Bot**: Tool crafting and repair
- **Security Bot**: Area protection and mob defense
- **Night Shift Bot**: Nighttime operations

### Layer 5: Creative Detail Bots
- **Statue Builder Bot**: Monuments and landmarks
- **Sign Writer Bot**: Signs and labels
- **Redstone Engineer Bot**: Functional contraptions
- **Artist Bot**: Murals and decorative art

### Layer 6: Master Coordination
- **Grand Orchestrator Bot**: Main controller with state machine
- **Progress Reporter Bot**: Statistics and reporting
- **Emergency Response Bot**: Error handling and recovery

## 🚀 Getting Started

### Installation

```bash
cd minecraft_civ_god_mode
npm install
```

### Configuration

1. Copy `.env1` to `.env` and configure:
```env
MC_HOST=127.0.0.1
MC_PORT=25565
MC_BOT_ORCHESTRATOR_USERNAME=OrchestratorBot
```

2. Configure bot fleet in `config/bot_fleet.json`

### Running the System

#### Start Command Center (Interactive)
```bash
npm run mega
```

#### Start Grand Orchestrator
```bash
npm run orchestrator
```

#### Start Individual Bots
```bash
# Layer 1 - Creative
node bots/layer1_creative/story_analyzer_bot.js
node bots/layer1_creative/city_architect_bot.js
node bots/layer1_creative/theme_designer_bot.js

# Layer 2 - Resources
node bots/layer2_resources/lumberjack_squad_bot.js
node bots/layer2_resources/lumberjack_worker_bot.js

# Layer 3 - Construction
node bots/layer3_construction/wall_builder_bot.js

# And so on...
```

## 📖 Usage Examples

### Example 1: Story-Based Building

```javascript
// Using Command Center
/story fantasy_kingdom

// Or programmatically
const { processStoryInput } = require('./src/story_input_handler');
const story = `
  Một vương quốc kỳ diệu với những tòa tháp cao và cầu pha lê.
  Màu chủ đạo: tím, xanh dương và bạc.
`;
const processed = processStoryInput(story);
```

**Result**: The system will build:
- Wizard towers (tall, pointed roofs)
- Crystal bridges
- Fantasy architecture
- Purple, blue, silver color scheme

### Example 2: Image-Based Building

```javascript
// Using Command Center
/image path/to/cyberpunk_city.jpg

// Or programmatically
const { analyzeImage, generateBuildingData } = require('./src/image_input_handler');
const analysis = analyzeImage('cyberpunk_city.jpg');
const buildingData = generateBuildingData(analysis);
```

**Result**: The system will build:
- Skyscrapers with neon lighting
- Modern grid layout
- Dark and bright contrasting colors

### Example 3: Pre-built Example Stories

```bash
# Fantasy Kingdom
/story fantasy_kingdom

# Peaceful Village
/story peaceful_village

# Medieval Fortress
/story medieval_fortress
```

## 🎮 Command Center Commands

Interactive command center for controlling the bot system:

```
/start [story|image]  - Start a new project
/story <text|file>    - Load story input
/image <path>         - Load and analyze image
/pause                - Pause all bots
/resume               - Resume all bots
/status               - Show system status
/bots                 - List all active bots
/save                 - Save current project
/load <project>       - Load saved project
/help                 - Show help
/exit                 - Exit
```

## 📋 Bot Communication

Bots communicate via a command bus system:

```javascript
const { writeCommand, getCommandBus } = require('./src/command_bus');

// Send command
writeCommand({
  action: 'BUILD_HOUSE',
  x: 100,
  y: 64,
  z: 200
});

// Receive commands
const bus = getCommandBus();
bus.on('COMMAND', (cmd) => {
  // Handle command
});
```

## 🏗️ Building Templates

Templates are stored in `data/templates/`:

- `houses.json` - 50+ house designs
- `towers.json` - Tower variations
- `castles.json` - Castle blueprints
- `modern.json` - Modern buildings
- `fantasy.json` - Fantasy structures

Example template structure:

```json
{
  "id": "simple_cottage",
  "name": "Simple Cottage",
  "theme": "medieval",
  "size": { "width": 7, "depth": 7, "height": 4 },
  "blocks": {
    "walls": "oak_planks",
    "roof": "oak_stairs",
    "floor": "oak_planks"
  },
  "features": ["door", "windows", "chimney"]
}
```

## 🎨 Theme System

Available themes:
- **medieval**: Stone bricks, oak wood, rustic style
- **fantasy**: Purpur blocks, glowing elements, magical style
- **modern**: Concrete, glass, contemporary style
- **steampunk**: Copper, iron, industrial style
- **oriental**: Red concrete, bamboo, Asian style

## 🔧 Advanced Features

### State Machine (Grand Orchestrator)

```
INIT → ANALYZE_INPUT → GENERATE_VISION → PLAN_CITY → 
GATHER_RESOURCES → BUILD_FOUNDATION → CONSTRUCT_BUILDINGS → 
ADD_DETAILS → LANDSCAPING → FINALIZE → COMPLETE
```

### Bot Fleet Management

Configure bot fleet in `config/bot_fleet.json`:

```json
{
  "total_bots": 50,
  "bot_groups": {
    "creative": { "story_analyzer": 1, ... },
    "resource_gathering": { "lumberjacks": 10, ... },
    "construction": { "wall_builders": 5, ... }
  }
}
```

### Input Handlers

#### Story Input
```javascript
const { processStoryInput, EXAMPLE_STORIES } = require('./src/story_input_handler');

// Process story
const data = processStoryInput(storyText);

// Use example
const fantasy = EXAMPLE_STORIES.fantasy_kingdom;
```

#### Image Input
```javascript
const { analyzeImage, generateBuildingData } = require('./src/image_input_handler');

const analysis = analyzeImage('image.jpg');
const buildingData = generateBuildingData(analysis);
```

## 📊 Output Files

The system generates various output files:

- `outputs/story_blueprint.json` - Story analysis results
- `outputs/city_plan.json` - City architecture plan
- `outputs/theme_spec.json` - Theme specifications
- `outputs/final_report.json` - Project completion report
- `outputs/inputs/` - Saved story and image inputs
- `outputs/projects/` - Saved project states

## 🛠️ Development

### Creating a New Bot

1. Create bot file in appropriate layer directory
2. Follow the bot template pattern:

```javascript
require('dotenv').config()
const { createBot, sleep } = require('../_common')
const { getCommandBus } = require('../../src/command_bus')

const BOT_NAME = 'YourBot'
const bot = createBot(BOT_NAME)
const bus = getCommandBus()

function log(...a) { console.log('[YOUR_BOT]', ...a) }

bot.once('spawn', async () => {
  log('Bot spawned')
  
  setInterval(() => bus.poll(), 400)
  
  bus.on('COMMAND', async (cmd) => {
    // Handle commands
  })
})

bot.on('kicked', (r) => log('kicked:', r))
bot.on('error', (e) => log('error:', e?.message || e))
```

3. Register bot in `config/bot_fleet.json`

### Testing

```bash
# Test individual bot
node bots/layer1_creative/story_analyzer_bot.js

# Test input handlers
node src/story_input_handler.js fantasy_kingdom
node src/image_input_handler.js test_image.jpg

# Test command center
npm run mega
```

## 🎯 Best Practices

1. **Writing Effective Stories**
   - Include specific architectural terms (castle, tower, bridge)
   - Mention colors explicitly
   - Describe the atmosphere and mood
   - Specify architectural styles

2. **Using Images**
   - Use high-contrast images for better detection
   - Include structural elements in the image
   - Clear colors work best

3. **Bot Coordination**
   - Start with Grand Orchestrator
   - Let bots register before starting tasks
   - Monitor progress via Command Center

## 🐛 Troubleshooting

### Bots Not Connecting
- Check Minecraft server is running
- Verify MC_HOST and MC_PORT in .env
- Ensure bots have permission: `/op BotName`

### Command Bus Issues
- Check `data/bus/commands.json` exists
- Verify file permissions
- Clear bus if stuck: `echo "{}" > data/bus/commands.json`

### Build Failures
- Ensure bots have required materials
- Check bot inventory with `/status`
- Verify bot is not stuck (use Emergency Response Bot)

## 📝 License

This project is part of the minecraft_civ_god_mode system.

## 🤝 Contributing

Contributions welcome! Please:
1. Follow existing bot patterns
2. Add comprehensive logging
3. Update documentation
4. Test thoroughly

## 🎉 Credits

Built on top of:
- mineflayer
- mineflayer-pathfinder
- mineflayer-collectblock

---

**Note**: This is an advanced automation system. Start with small projects and scale up as you become familiar with the system!

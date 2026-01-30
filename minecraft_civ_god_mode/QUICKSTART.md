# 🚀 Quick Start Guide - Mega Bot System

## Prerequisites

1. **Minecraft Server** (Paper/Spigot recommended)
   - Version: 1.19+ 
   - Online mode can be false for testing
   - Server should be running on localhost:25565 (or configure in .env)

2. **Node.js** 
   - Version: 16+ required
   - Check with: `node --version`

3. **Bot Permissions**
   - Bots need OP permissions on the server
   - Run in server console: `/op BotName`

## Installation

```bash
# Navigate to project directory
cd minecraft_civ_god_mode

# Install dependencies
npm install

# Copy environment template
cp .env1 .env

# Edit configuration (optional)
nano .env
```

## Quick Test - 5 Minutes

### 1. Start a Simple Bot

```bash
# Terminal 1: Start the Grand Orchestrator
npm run orchestrator
```

Wait for "Grand Orchestrator spawned" message.

### 2. Use Example Story

```bash
# Terminal 2: Start Command Center
npm run mega

# In Command Center, type:
/story fantasy_kingdom
```

The system will:
- Analyze the fantasy kingdom story
- Extract keywords: wizard, tower, bridge, purple, blue
- Create a city plan
- Show progress through state machine

### 3. Check Outputs

```bash
# View generated files
ls -la outputs/

# View story analysis
cat outputs/story_blueprint.json

# View city plan
cat outputs/city_plan.json
```

## Full System Launch

### Option 1: Launch All Bots (Recommended)

```bash
# This starts all bots in the correct order
node scripts/launch_bots.js
```

### Option 2: Manual Launch

```bash
# Terminal 1: Orchestrator
npm run orchestrator

# Terminal 2: Story Analyzer
node bots/layer1_creative/story_analyzer_bot.js

# Terminal 3: City Architect
node bots/layer1_creative/city_architect_bot.js

# Terminal 4: Theme Designer
node bots/layer1_creative/theme_designer_bot.js

# Terminal 5: Progress Reporter
node bots/layer6_coordination/progress_reporter_bot.js

# Terminal 6: Command Center
npm run mega
```

## Example Workflows

### Workflow 1: Fantasy Kingdom

```bash
# In Command Center:
/story fantasy_kingdom

# Wait for analysis
/status

# Check progress
/bots
```

**Expected Output:**
- Story analyzed with magic, wizard, tower themes
- City plan with wizard towers and magic fountains
- Theme: fantasy with purple/blue colors
- Blueprint saved to outputs/

### Workflow 2: Peaceful Village

```bash
# In Command Center:
/story peaceful_village

# System will create:
# - Wooden cottages
# - Bamboo bridges  
# - Rice farms
# - Rural theme
```

### Workflow 3: Custom Story

```bash
# Create a file: my_story.txt
echo "A steampunk city with copper towers and industrial buildings" > my_story.txt

# In Command Center:
/story my_story.txt
```

### Workflow 4: Image Input (Mock)

```bash
# In Command Center:
/image castle_image.jpg

# System will analyze and build based on image colors/structures
```

## Verify Everything Works

### 1. Check Bot Connections

```bash
# In Minecraft server console, you should see:
[INFO] OrchestratorBot joined the game
[INFO] StoryAnalyzerBot joined the game
[INFO] CityArchitectBot joined the game
# etc...
```

### 2. Check Outputs

```bash
# Should see these files created:
outputs/story_blueprint.json      # Story analysis
outputs/city_plan.json           # City layout
outputs/theme_spec.json          # Theme details
outputs/final_report.json        # Completion report
outputs/dashboard.html           # Progress dashboard
```

### 3. View Dashboard

```bash
# Open in browser:
open outputs/dashboard.html

# Or:
firefox outputs/dashboard.html
```

## Common Issues & Solutions

### Issue 1: "Bot disconnected"
```bash
# Solution: Give bot OP permissions
# In server console:
/op OrchestratorBot
/op StoryAnalyzerBot
# etc...
```

### Issue 2: "Cannot connect to server"
```bash
# Solution: Check server is running
# Check .env file has correct host/port

# Test connection:
telnet localhost 25565
```

### Issue 3: "No such file or directory"
```bash
# Solution: Make sure you're in the right directory
cd minecraft_civ_god_mode

# Check if bots exist:
ls -la bots/layer1_creative/
```

### Issue 4: "Command bus not found"
```bash
# Solution: Create command bus file
mkdir -p data/bus
echo "{}" > data/bus/commands.json
```

## Next Steps

### 1. Explore More Features

```bash
# Try different example stories
/story medieval_fortress

# Check bot status
/status

# List all bots
/bots
```

### 2. Create Custom Stories

Write stories with:
- Specific buildings (castle, tower, house, bridge)
- Colors (red, blue, purple, gold)
- Styles (medieval, modern, fantasy)
- Atmosphere (peaceful, grand, dark)

### 3. Monitor Progress

```bash
# View progress reports
cat outputs/reports/progress_report_1.json

# Check emergency log
cat outputs/crash_log.json

# View backups
ls -la outputs/backups/
```

### 4. Advanced Usage

```bash
# Save project state
/save

# Load project
/load Project_1234567890

# Pause all bots
/pause

# Resume
/resume
```

## Performance Tips

1. **Start Small**: Test with 1-2 bots first
2. **Monitor Resources**: Check CPU/RAM usage
3. **Use SSD**: Faster for file operations
4. **Optimize Settings**: Adjust bot_fleet.json

## Getting Help

### Check Logs

```bash
# View bot output
# Each bot logs to console with [BOT_NAME] prefix

# Search for errors
grep ERROR outputs/*.json
```

### Debug Mode

```bash
# Set in .env:
DEBUG=true

# Restart bots for verbose logging
```

### Documentation

- Full docs: `README_MEGA_BOTS.md`
- API reference: Check individual bot files
- Examples: See `src/story_input_handler.js`

## What's Next?

Now that you have the basics working:

1. ✅ Read the full documentation: `README_MEGA_BOTS.md`
2. ✅ Explore building templates in `data/templates/`
3. ✅ Create your own stories
4. ✅ Launch more bots for actual building
5. ✅ Check out the dashboard for monitoring

Happy building! 🏗️✨

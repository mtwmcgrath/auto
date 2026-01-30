# 🚀 Quick Start Guide - Human-Like Bot Names

## Overview

This system replaces generic bot names (`bot_lumberjack_01`) with realistic human names (`Alex`, `Emma`, `Minh`, `Sakura`) for your 100-bot Minecraft army.

---

## Installation & Setup

1. **Install dependencies** (if not already done):
   ```bash
   npm install
   ```

2. **Generate bot names**:
   ```bash
   npm run names:regenerate
   ```
   
   This creates 100 unique human names and saves them to `data/bot_names_mapping.json`.

3. **View the generated names**:
   ```bash
   npm run names:list
   ```

---

## Running Bots

### Start the Bot Army

```bash
npm run bot:army
```

**Expected Output:**
```
🎭 Grand Orchestrator initialized
📋 Configuration: 100 bots max
🌐 Server: 127.0.0.1:25565

🚀 Starting bot army initialization...

👥 Bot Army Roster:
==================================================
  ✅ Alex 🪓 (lumberjack) - resource team
  ✅ Emma 🪓 (lumberjack) - resource team
  ✅ Minh ⛏️ (miner) - resource team
  ✅ Sakura 🧱 (wall_builder) - construction team
  ... (96 more bots)

🎉 100 builders ready to work! 🚀
```

**Note:** This requires a running Minecraft server at `127.0.0.1:25565` (or configured in `.env`).

---

## CLI Commands

### List All Bots
```bash
npm run names:list
```

### List by Role
```bash
node src/cli_name_manager.js list --role lumberjack
```

### List by Team
```bash
node src/cli_name_manager.js team resource
```

### Find Bot by Name
```bash
node src/cli_name_manager.js find Alex
```

Output:
```
🔍 Bot Information:
────────────────────────────────────────
Name:     Alex
Role:     lumberjack 🪓
Team:     resource
Region:   english
Gender:   male
────────────────────────────────────────
```

### Show Statistics
```bash
npm run names:stats
```

Output:
```
📊 Bot Army Statistics:
──────────────────────────────────────────────────
Total Bots: 100

🌍 Regional Distribution:
  english          40 (40.0%) ████████████████████
  vietnamese       30 (30.0%) ███████████████
  chinese          10 (10.0%) █████
  japanese         10 (10.0%) █████
  korean            5 (5.0%) ███
  unique            5 (5.0%) ███

👥 Teams:
  resource         46 (46.0%)
  construction     32 (32.0%)
  support          19 (19.0%)
  artists           6 (6.0%)
```

### Regenerate Names
```bash
# Regenerate all names
npm run names:regenerate

# Regenerate with specific count
node src/cli_name_manager.js regenerate --count 50

# Generate 100% Vietnamese names
node src/cli_name_manager.js regenerate --region vietnamese
```

---

## Testing

### Run Tests
```bash
npm run test:names
```

### Run Demo (Dry Run)
```bash
node test/demo_orchestrator.js
```

This shows what the bot army would look like without connecting to a server.

---

## Configuration

Edit `config/bot_army_config.json` to customize:

### Change Name Distribution
```json
{
  "botNaming": {
    "distribution": {
      "english": 50,      // Change percentages
      "vietnamese": 50,
      "chinese": 0,       // Disable regions
      "japanese": 0,
      "korean": 0,
      "unique": 0
    }
  }
}
```

### Change Bot Counts
```json
{
  "botCounts": {
    "resource": {
      "lumberjackWorkers": 30,  // Increase lumberjacks
      "minerWorkers": 10,       // Decrease miners
      "farmers": 5,
      "fishermen": 5
    }
  }
}
```

---

## File Structure

```
minecraft_civ_god_mode/
├── src/
│   ├── bot_name_generator.js       ← Core logic
│   └── cli_name_manager.js         ← CLI interface
├── bots/
│   └── control/
│       └── grand_orchestrator_bot.js  ← Bot army manager
├── config/
│   └── bot_army_config.json        ← Configuration
├── data/
│   └── bot_names_mapping.json      ← Generated names (auto-created)
├── test/
│   ├── test_bot_name_generator.js  ← Tests
│   └── demo_orchestrator.js        ← Demo
└── BOT_NAMING_README.md            ← Full documentation
```

---

## Examples

### Before (Old System)
```javascript
const bot = mineflayer.createBot({
  username: 'bot_lumberjack_01'  // ❌ Looks fake
});
```

### After (New System)
```javascript
const bot = mineflayer.createBot({
  username: 'Alex'  // ✅ Looks like real player
});
```

### Video Hooks
```
❌ "I hired 100 BOTS to build a city"
✅ "I hired Alex, Emma, and 98 others to build a CITY! 🏙️"

❌ "Watch bot_lumberjack_01 chop trees"
✅ "Watch Minh chop 1000 TREES in 10 minutes! 🪓🔥"
```

---

## Server Configuration

### Update .env file
```env
MC_HOST=127.0.0.1
MC_PORT=25565
MC_AUTH=offline

# For online servers (requires premium accounts):
# MC_AUTH=microsoft
```

### Server Requirements
- **Player limit**: Most servers allow 50-100 max players
- **Performance**: 100 bots require ~4GB RAM minimum
- **Version**: Tested with Minecraft 1.20.1

---

## Troubleshooting

### "All names exhausted" error
**Cause:** Too many bots for available names.  
**Solution:** Reduce bot count or add more name pools.

### Bots can't connect
**Cause:** Server not running or wrong configuration.  
**Solution:** Check `.env` file and verify server is running.

### Names not saved
**Cause:** Permission issues.  
**Solution:** Ensure `data/` directory exists and has write permissions.

---

## Next Steps

1. ✅ **Test locally**: Run `npm run test:names` and `node test/demo_orchestrator.js`
2. ✅ **Configure**: Edit `config/bot_army_config.json` for your needs
3. ✅ **Generate names**: Run `npm run names:regenerate`
4. ✅ **Start server**: Launch your Minecraft server
5. ✅ **Deploy bots**: Run `npm run bot:army`

---

## Support & Documentation

- **Full Documentation**: See `BOT_NAMING_README.md`
- **CLI Help**: Run `npm run names:help`
- **Test Suite**: Run `npm run test:names`

---

**THIS SYSTEM IS READY FOR PRODUCTION!** 🚀

**100 HUMAN NAMES, ZERO "bot_" PREFIXES!** 🎭✨

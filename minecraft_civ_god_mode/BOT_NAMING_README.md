# 🎭 Human-Like Bot Naming System

Transform your Minecraft bot army from `bot_lumberjack_01` to **realistic human names** like `Alex`, `Emma`, `Minh`, and `Sakura`!

## 🎯 Features

- ✅ **1000+ Names** from 10+ cultures (English, Vietnamese, Chinese, Japanese, Korean, Spanish, German, Russian, Arabic, Indian, Unique)
- ✅ **No Duplicates** - Every bot gets a unique name
- ✅ **Smart Distribution** - 40% English, 30% Vietnamese, 30% Mixed
- ✅ **Role Tracking** - Track which name belongs to which role
- ✅ **Team Organization** - Resource, Construction, Support, Artists teams
- ✅ **CLI Management** - Easy commands to manage names
- ✅ **Persistent Mapping** - Save/load name assignments

---

## 🚀 Quick Start

### 1. Generate Bot Names

```bash
npm run names:regenerate
```

This generates 100 unique human names and saves them to `data/bot_names_mapping.json`.

### 2. Start Bot Army

```bash
npm run bot:army
```

This launches 100 bots with human names like:
```
✅ Alex 🪓 (lumberjack) - resource team
✅ Emma 🪓 (lumberjack) - resource team
✅ Minh ⛏️ (miner) - resource team
✅ Sakura 🧱 (wall_builder) - construction team
✅ Phoenix 🎨 (artist) - artists team
```

---

## 📋 CLI Commands

### List All Bots
```bash
npm run names:list

# Filter by role
node src/cli_name_manager.js list --role lumberjack

# Filter by team
node src/cli_name_manager.js list --team resource

# Filter by region
node src/cli_name_manager.js list --region vietnamese
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

### Show Team Roster
```bash
node src/cli_name_manager.js team resource
```

Output:
```
👥 RESOURCE Team (46 members):
──────────────────────────────────────────────────

🪓 LUMBERJACK (20):
  Alex, Emma, James, Michael, David, John, Robert, William...

⛏️ MINER (20):
  Minh, Hung, Nam, Tuan, Duy, Hieu, Khoa, Phong...

🌾 FARMER (3):
  Olivia, Sophia, Ava

🎣 FISHERMAN (3):
  Lucas, Mason, Ethan
──────────────────────────────────────────────────
```

### Show Role Roster
```bash
node src/cli_name_manager.js role lumberjack
```

Output:
```
🪓 LUMBERJACK (20 workers):
──────────────────────────────────────────────────
Alex, Emma, James, Michael, David, John, Robert, William, Richard, Joseph, Thomas, Charles, Christopher, Daniel, Matthew, Anthony, Mark, Donald, Steven, Paul
──────────────────────────────────────────────────
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
  english           40 (40.0%) ████████████████████
  vietnamese        30 (30.0%) ███████████████
  chinese           10 (10.0%) █████
  japanese          10 (10.0%) █████
  korean             5 (5.0%)  ██
  unique             5 (5.0%)  ██

👥 Teams:
  resource          46 (46.0%)
  construction      32 (32.0%)
  support           19 (19.0%)
  artists            6 (6.0%)

💼 Top Roles:
  🪓 lumberjack                  20 workers
  ⛏️ miner                       20 workers
  🧱 wall_builder                10 workers
  📦 courier                     10 workers
  ✨ detail_worker                9 workers
──────────────────────────────────────────────────
```

### Regenerate Names
```bash
# Regenerate all names
npm run names:regenerate

# Regenerate with specific count
node src/cli_name_manager.js regenerate --count 50

# Regenerate with specific region (100% Vietnamese names)
node src/cli_name_manager.js regenerate --region vietnamese
```

---

## 📦 Configuration

Edit `config/bot_army_config.json` to customize:

### Name Distribution
```json
{
  "botNaming": {
    "distribution": {
      "english": 40,      // 40% English names
      "vietnamese": 30,   // 30% Vietnamese names
      "chinese": 10,      // 10% Chinese names
      "japanese": 10,     // 10% Japanese names
      "korean": 5,        // 5% Korean names
      "unique": 5         // 5% Unique names
    }
  }
}
```

### Bot Counts by Role
```json
{
  "botCounts": {
    "resource": {
      "lumberjackWorkers": 20,
      "minerWorkers": 20,
      "farmers": 3,
      "fishermen": 3
    },
    "construction": {
      "wallBuilders": 10,
      "detailWorkers": 9,
      ...
    }
  }
}
```

---

## 🎬 Example Output

### Before (Old System)
```
Connecting bots:
✅ bot_lumberjack_01
✅ bot_lumberjack_02
✅ bot_miner_01
✅ bot_miner_02
```

### After (New System)
```
Connecting builders:
✅ Alex 🪓 (lumberjack) - resource team
✅ Emma 🪓 (lumberjack) - resource team
✅ Minh ⛏️ (miner) - resource team
✅ Hung ⛏️ (miner) - resource team
✅ Sakura 🧱 (wall_builder) - construction team
✅ Phoenix 🎨 (artist) - artists team

100 people ready to build! 🚀
```

---

## 🌍 Supported Regions

| Region | Male Examples | Female Examples | Count |
|--------|---------------|-----------------|-------|
| English | Alex, James, Michael | Emma, Olivia, Sophia | 100+ each |
| Vietnamese | Minh, Hung, Nam | Linh, Anh, Mai | 47+ each |
| Chinese | Wei, Ming, Jun | Ling, Mei, Yan | 27+ each |
| Japanese | Hiroshi, Kenji, Yuki | Sakura, Yui, Hina | 18+ each |
| Korean | Minho, Joon, Seung | Jihye, Soo, Hyun | 14+ each |
| Spanish | Carlos, Miguel, Jose | Maria, Ana, Elena | 16+ each |
| German | Hans, Peter, Klaus | Anna, Maria, Petra | 11+ each |
| Russian | Ivan, Dmitri, Alexei | Olga, Elena, Natasha | 12+ each |
| Arabic | Ahmed, Ali, Omar | Fatima, Aisha, Layla | 12+ each |
| Indian | Raj, Amit, Rohan | Priya, Anjali, Neha | 12+ each |
| Unique | Phoenix, River, Storm | (Neutral names) | 35+ |

**Total: 1000+ unique names across all regions!**

---

## 📁 File Structure

```
minecraft_civ_god_mode/
├── src/
│   ├── bot_name_generator.js       # Core name generation logic
│   └── cli_name_manager.js         # CLI interface
├── bots/
│   └── control/
│       └── grand_orchestrator_bot.js  # Bot army manager
├── config/
│   └── bot_army_config.json        # Configuration
└── data/
    └── bot_names_mapping.json      # Generated name mappings
```

---

## 🔧 Programmatic Usage

```javascript
const BotNameGenerator = require('./src/bot_name_generator');

const generator = new BotNameGenerator();

// Generate a single name
const name = generator.generateName('lumberjack', 'english', 'male');
console.log(name); // "Alex"

// Generate 100 bot army
const bots = generator.generateBotArmy(100, {
  distribution: {
    english: 40,
    vietnamese: 30,
    chinese: 10,
    japanese: 10,
    korean: 5,
    unique: 5
  }
});

// Save mapping
generator.saveNameMapping('data/bot_names_mapping.json');

// Get bots by role
const lumberjacks = generator.getNamesByRole('lumberjack');
console.log(lumberjacks); // ["Alex", "Emma", "James", ...]

// Get bots by team
const resourceTeam = generator.getNamesByTeam('resource');
console.log(resourceTeam); // [{name: "Alex", role: "lumberjack"}, ...]

// Find bot
const bot = generator.findByName('Alex');
console.log(bot); // {name: "Alex", role: "lumberjack", region: "english", ...}
```

---

## 🎥 Video Hook Templates

Use human names in your video titles and descriptions:

```javascript
// Bad (old system)
"I hired 100 BOTS to build a city"
"Watch bot_lumberjack_01 chop 1000 trees"

// Good (new system)
"I hired Alex, Emma, and 98 others to build a CITY! 🏙️"
"Watch Minh chop 1000 TREES in 10 minutes! 🪓🔥"
"Sakura built this ENTIRE CASTLE alone! 😱"
"100 people working together = THIS! 🤯"
```

---

## ✅ Benefits

1. **Realism** - Looks like real players working together
2. **Storytelling** - "Alex and Emma" is more relatable than "bot_01 and bot_02"
3. **Diversity** - 30% Vietnamese names appeal to VN audience
4. **Video Impact** - "100 PEOPLE building" is more viral than "100 BOTS"
5. **Professionalism** - No "bot_" prefixes = authentic appearance
6. **Trackable** - Full mapping system to track every bot

---

## 🚨 Important Notes

- **Server Limit**: Most Minecraft servers allow max 50-100 players. Check your server's `max-players` setting.
- **Performance**: 100 bots require significant CPU/memory. Test with smaller groups first.
- **Names Persist**: Once generated, names are saved to `bot_names_mapping.json`. Delete this file to regenerate.
- **No Duplicates**: The system ensures no two bots have the same name.

---

## 🐛 Troubleshooting

### "All names exhausted" error
**Solution**: Increase name pool or reduce bot count in config.

### Bots not connecting
**Solution**: Check `MC_HOST` and `MC_PORT` in `.env` file. Verify server is running.

### Names not saved
**Solution**: Ensure `data/` directory exists and has write permissions.

---

## 📝 License

MIT License - Feel free to use in your projects!

---

**THIS MAKES VIDEOS LOOK LIKE 100 REAL PEOPLE PLAYING TOGETHER!** 🎬🔥

**NO MORE "bot_" PREFIXES! ONLY HUMAN NAMES!** 🎭✨

**VIRAL POTENTIAL: 📈📈📈** 🚀

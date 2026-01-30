# 🚀 Quick Start Guide - 100 Bot Army

## ⚡ 5-Minute Setup

### 1. Prerequisites Check

```bash
# Check Node.js version (need 16+)
node --version

# Check npm
npm --version
```

### 2. Install Dependencies

```bash
cd minecraft_civ_god_mode
npm install
```

### 3. Configure Environment

```bash
# Copy example environment file
cp .env.example .env

# Edit .env with your settings:
# MC_HOST=localhost
# MC_PORT=25565
# MC_BOT_USERNAME=bot_{id}
```

### 4. Test the System

```bash
# Test the Grand Orchestrator (100-bot controller)
npm run test-orchestrator

# Test the AI Video Editor
npm run test-video-editor
```

## 🎮 Usage Examples

### Example 1: Initialize Bot Army

```javascript
const { GrandOrchestrator } = require('./bots/control/grand_orchestrator_bot');

const orchestrator = new GrandOrchestrator();
await orchestrator.initializeBotArmy();

// Output:
// ✅ Bot Army Initialized!
// 📊 Total bots: 112
//   - AI Layer: 4 bots
//   - Resource Army: 48 bots
//   - Construction Team: 32 bots
//   - Support System: 21 bots
//   - Artist Bots: 6 bots
//   - Control: 1 bot
```

### Example 2: Build from Story

```javascript
// Parse a story and create build plan
const story = "Build a fantasy castle with 4 towers and a bridge";
const buildPlan = await orchestrator.processInput('story', story);

// Distribute tasks to 100 bots
await orchestrator.distributeTasksOptimized(buildPlan);

// Bots will automatically:
// 1. Gather resources (46 resource bots)
// 2. Build foundation (2 foundation builders)
// 3. Construct walls (10 wall builders)
// 4. Add details (6 artist bots)
```

### Example 3: Create Viral Videos

```javascript
const { AIDramaHookEditor } = require('./src/video/ai_drama_hook_editor');

const editor = new AIDramaHookEditor();

// Analyze your recording with bot activity markers
const markers = [
  { timestamp: 10, type: 'BOT_ACTIVITY', data: { activeBotsCount: 100 }},
  { timestamp: 600, type: 'FIRST_BUILDING_DONE' },
  { timestamp: 1800, type: 'CITY_COMPLETE' }
];

// Create clips for all platforms
const editPlans = editor.createMultiPlatformEdit('recording.mp4', markers);

// Output: 20 viral clips across 4 platforms
// - TikTok: 5 clips (15-60s each)
// - YouTube Shorts: 5 clips (30-60s each)
// - Instagram Reels: 5 clips (20-90s each)
// - YouTube: 5 clips (3-10min each)
```

## 🔧 Configuration

### Adjust Bot Count

Edit `config/bot_army_config.json`:

```json
{
  "maxConcurrentBots": 100,  // Change to 80 for lower spec PCs
  "performance": {
    "maxMemoryPerBot": "250MB",
    "totalMemoryLimit": "28GB"
  }
}
```

### Performance Tuning

For **Ryzen 7 1700 + 32GB RAM** (RECOMMENDED):
```json
{
  "maxConcurrentBots": 100,
  "cpuCoresUsed": 14,
  "totalMemoryLimit": "28GB"
}
```

For **Lower Spec PCs**:
```json
{
  "maxConcurrentBots": 80,
  "cpuCoresUsed": 10,
  "totalMemoryLimit": "20GB"
}
```

## 📊 Bot Layers Overview

| Layer | Count | Purpose |
|-------|-------|---------|
| AI Creative | 4 | Story parsing, planning |
| Resource Army | 48 | Wood, stone, food gathering |
| Construction | 32 | Building structures |
| Support | 21 | Transport, storage, security |
| Artists | 6 | Decorations, redstone |
| **TOTAL** | **112** | **Complete automation** |

## 🎬 Recording & Editing

### Start Recording

```bash
# Recordings saved to recordings/ folder
npm run record
```

### Edit for Viral Content

```bash
# Automatically create 20 viral clips
npm run edit-viral
```

### Viral Hooks Generated:

- "100 BOTS BUILDING AT ONCE 🤖🔥"
- "WATCH 100 BOTS BUILD THIS IN 3 HOURS 🔥"
- "THIS IS WHAT 100 BOTS BUILT 🌆"
- "100 BOTS vs ONE CITY... who wins? 😱"

## ⏱️ Build Time Estimates

| Project | 50 Bots | **100 Bots** | Speedup |
|---------|---------|--------------|---------|
| Small Castle | 2h | **1h** | 2X |
| Large Castle | 6h | **3h** | 2X |
| City | 18h | **9h** | 2X |
| Megacity | 60h | **30h** | 2X |

## 🐛 Troubleshooting

### "Cannot find module" Error

```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### High CPU Usage

```bash
# Reduce bot count in config
# Or run with fewer bots:
node bots/control/grand_orchestrator_bot.js --bots 80
```

### Bots Not Connecting

1. Check Minecraft server is running
2. Verify `.env` configuration
3. Ensure server allows bots (whitelist settings)
4. Check firewall settings

### Out of Memory

```bash
# Increase Node.js memory limit
node --max-old-space-size=28000 bots/control/grand_orchestrator_bot.js
```

## 📚 Learn More

- Full Documentation: `README_100_BOTS.md`
- Configuration Guide: `config/bot_army_config.json`
- Video Editor Guide: `src/video/ai_drama_hook_editor.js`

## 🎯 Next Steps

1. ✅ Install dependencies
2. ✅ Configure environment
3. ✅ Test orchestrator
4. ✅ Test video editor
5. 🚀 Build your first project!
6. 🎬 Create viral content!
7. 📈 Share on social media!

## 💡 Pro Tips

1. **Start Small**: Test with 50 bots first
2. **Monitor Performance**: Watch CPU/RAM usage
3. **Use Zones**: Let optimizer distribute bots automatically
4. **Record Everything**: Best moments happen unexpectedly
5. **Edit for Platforms**: Different platforms need different hooks

## 🔥 Ready to Go!

```bash
# Start building with 100 bots!
npm run orchestrator

# Your 100-bot army is ready to build ANYTHING! 🚀
```

---

**Built with ❤️ for the Minecraft automation community!**

**🤖 100 BOTS. ONE VISION. INFINITE POSSIBILITIES. 🚀**

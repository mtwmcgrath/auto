# 🤖 Minecraft Bot Army + Auto Video System

## 🎯 Overview

A revolutionary Minecraft automation system featuring:
- **50+ Bot Army** - Automatically builds cities from stories/images
- **Auto Camera System** - 9 cinematic camera bots record footage
- **AI Drama Hook Editor** - Automatically edits viral clips with MrBeast-style hooks
- **One-Command Workflow** - From story to viral video in one command

## 🚀 Quick Start

### Installation

```bash
cd minecraft_civ_god_mode
npm install
```

### Configuration

1. Copy `.env.example` to `.env`
2. Configure your Minecraft server settings:

```env
MC_HOST=localhost
MC_PORT=25565
MC_USERNAME=BotArmy
MC_PASSWORD=
```

### Usage

#### Full Automation (Recommended)

```bash
# One command to build and record
npm run auto-build-and-record story "A white castle with 4 towers"
```

#### Step by Step

```bash
# 1. Start Grand Orchestrator
npm run orchestrator

# 2. Start Story Analyzer
npm run story-analyzer

# 3. Start Resource Bots
npm run lumberjack-leader
npm run lumberjack-worker

# 4. Start Camera System
npm run cinematic-director

# 5. Run workflow
npm run workflow story "Your story here"
```

## 🏗️ Architecture

### Layer 1: AI Creative Bots (4 bots)

**Story Analyzer Bot** (`bots/ai/story_analyzer_bot.js`)
- Parses stories in Vietnamese and English
- Extracts buildings, materials, dimensions
- NLP-powered blueprint generation

**Image Vision Bot** (`bots/ai/image_vision_bot.js`)
- Computer vision for image analysis
- Color extraction and mapping
- Voxel map generation

**City Architect Bot** (`bots/ai/city_architect_bot.js`)
- Master planning and zoning
- Task distribution to worker bots
- Resource calculation

**Theme Designer Bot** (`bots/ai/theme_designer_bot.js`)
- Ensures visual consistency
- Color palette management
- Architectural style enforcement

### Layer 2: Resource Army (23 bots)

**Lumberjack Squad** (11 bots total)
- 1 Squad Leader (`lumberjack_squad_leader.js`)
- 10 Workers (`lumberjack_worker_01.js` - `lumberjack_worker_10.js`)
- Automated tree harvesting and replanting
- Zone-based work distribution

**Miner Team** (11 bots total)
- 1 Miner Chief
- 10 Miner Workers
- Strip mining strategy
- Resource collection: coal, iron, diamond

**Support Bots**
- Farmer Bot - Crop automation
- Fisherman Bot - Fishing automation

### Layer 3: Construction Team (17 bots)

- Foundation Builder
- 5 Wall Builders (parallel construction)
- Roof Builder
- Interior Designer
- Road Paver
- Landscaper
- Skyscraper Specialist
- 6 Detail Workers

### Layer 4: Support System (12 bots)

- Supply Chain Manager
- 5 Courier Bots
- Inventory Manager
- Tool Smith
- Security Bot
- Night Shift Coordinator
- 2 Maintenance Bots

### Layer 5: Artist Bots (4 bots)

- Statue Builder
- Sign Writer
- Redstone Engineer
- Artist Bot (pixel art)

### Layer 6: Master Control (3 bots)

**Grand Orchestrator** (`bots/control/grand_orchestrator_bot.js`)
- Central brain of the system
- Coordinates all 50+ bots
- Task distribution and conflict resolution
- Progress monitoring

**Progress Reporter Bot**
- Real-time metrics
- Dashboard updates
- ETA calculations

**Emergency Response Bot**
- Auto-restart failed bots
- Error recovery
- Emergency stop system

## 🎥 Video Recording System

### Camera Bots (10 bots)

**Cinematic Director** (`bots/camera/cinematic_director_bot.js`)
- Shot planning and coordination
- Timeline generation
- Manages 9 camera bots

**Specialized Camera Bots:**
1. **Camera Bot 01** - Aerial Drone (establishing shots, panoramas)
2. **Camera Bot 02** - Tracking Cam (follows worker bots)
3. **Camera Bot 03** - Timelapse Cam (fixed long-term recording)
4. **Camera Bot 04** - Close-up Specialist (detail shots)
5. **Camera Bot 05** - POV Cam (first-person perspective)
6. **Camera Bot 06** - Crane Cam (vertical movements)
7. **Camera Bot 07** - Dolly Cam (horizontal tracking)
8. **Camera Bot 08** - Steadicam (dynamic angles)
9. **Camera Bot 09** - Night/Lighting Cam (dramatic lighting)

### Shot Types

- **ESTABLISHING** - Wide city view from distance
- **AERIAL** - Drone view from above
- **TRACKING** - Follow bot working
- **TIMELAPSE** - Sped-up construction
- **CLOSE_UP** - Block placement details
- **REVEAL** - Pan to reveal building
- **TRANSITION** - Scene transitions

## ✂️ AI Drama Hook Editor

**Core Editor** (`src/video/ai_drama_hook_editor.js`)

### Features

- **Drama Moment Detection** - AI identifies viral moments
- **Auto Hook Generation** - MrBeast-style opening hooks
- **Beat Synchronization** - Cuts synced to music beats
- **Platform Optimization** - TikTok, YouTube Shorts, YouTube
- **Auto Thumbnails** - Clickbait-style thumbnails

### Drama Moments Detected

1. **Bot Army Working** - 50 bots simultaneously
2. **Epic Reveal** - Completed structure reveal
3. **Before/After** - Transformation shots
4. **Timelapse** - Fast construction
5. **Close Call** - Near-death moments
6. **Milestones** - 10,000 blocks placed
7. **Building Complete** - First structure done

### Hook Templates

**Opening Hooks:**
- "I spent 24 hours building this city..."
- "What if 50 bots built a city?"
- "This is the BIGGEST Minecraft project ever..."
- "I hired 50 bots to do this..."

**Mid-Video:**
- "Wait until you see what's coming..."
- "But then THIS happened..."
- "And it gets CRAZIER..."

**Call-to-Action:**
- "Like if you want to see more!"
- "Comment which building you like best!"
- "Subscribe for part 2!"

### Video Structure (60s TikTok/Shorts)

```
0:00-0:03 - HOOK: Best moment + dramatic text
0:03-0:10 - SETUP: Explain the challenge
0:10-0:45 - MONTAGE: Fast-cut construction timelapse
0:45-0:55 - CLIMAX: Final reveal in slow motion
0:55-1:00 - CTA: Call to action
```

## 🎬 Workflow

### Main Workflow (`src/main_workflow.js`)

```javascript
// Full automation pipeline
masterWorkflow({
  type: 'story',
  content: 'A white castle with 4 towers',
  platform: 'TIKTOK'
})
```

**Pipeline Phases:**

1. **Phase 1: AI Planning** - Story/image analysis → Blueprint
2. **Phase 2: Bot Deployment** - Initialize 50+ bots
3. **Phase 3: Recording Start** - Camera bots start filming
4. **Phase 4: Construction** - Bots build (parallel with recording)
5. **Phase 5: AI Editing** - Detect drama hooks, auto-edit
6. **Phase 6: Export** - Generate TikTok, YouTube Shorts, YouTube versions
7. **Phase 7: Thumbnails** - Auto-generate clickbait thumbnails

## 📤 Export Formats

### TikTok
- Resolution: 1080x1920 (9:16)
- Duration: 60s max
- FPS: 30
- Bitrate: 5000k

### YouTube Shorts
- Resolution: 1080x1920 (9:16)
- Duration: 60s max
- FPS: 60
- Bitrate: 8000k

### YouTube Full
- Resolution: 1920x1080 (16:9)
- Duration: Unlimited
- FPS: 60
- Bitrate: 12000k

## 🎨 Example Usage

### Example 1: Fantasy Kingdom

```bash
npm run workflow story "Lâu đài trắng với 4 tháp cao 30 blocks"
```

**Output:**
- `outputs/tiktok_version.mp4` - 60s viral clip
- `outputs/youtube_shorts.mp4` - 60s vertical video
- `outputs/youtube_full.mp4` - 10min full build
- `outputs/thumbnail_option_1.jpg` - Clickbait thumbnail

### Example 2: From Image

```bash
npm run workflow image ./castle.png
```

### Example 3: Custom Platform

```bash
node src/main_workflow.js story "Cyberpunk city with neon lights" --platform YOUTUBE_SHORTS
```

## 🔧 API Reference

### Grand Orchestrator Commands

```javascript
// Start a build
bus.send({
  type: 'START_BUILD',
  target: 'grand_orchestrator',
  data: {
    name: 'MyProject',
    type: 'story',
    input: blueprint
  }
});

// Emergency stop
bus.send({
  type: 'EMERGENCY_STOP',
  target: 'grand_orchestrator'
});

// Get status
bus.send({
  type: 'GET_STATUS',
  target: 'grand_orchestrator'
});
```

### Cinematic Director Commands

```javascript
// Start recording
bus.send({
  type: 'START_RECORDING',
  target: 'cinematic_director',
  data: {
    blueprint,
    duration: 300
  }
});

// Stop recording
bus.send({
  type: 'STOP_RECORDING',
  target: 'cinematic_director'
});
```

### AI Editor Usage

```javascript
const { AIDramaHookEditor } = require('./src/video/ai_drama_hook_editor');

const editor = new AIDramaHookEditor({
  style: 'mrbeast',
  platform: 'TIKTOK',
  music: 'epic'
});

const result = await editor.edit({
  footagePath: './recordings/build.mp4'
}, {
  outputPath: './outputs/viral_clip.mp4'
});
```

## 🎯 Success Metrics

The system achieves:
- ✅ 50+ bots building simultaneously
- ✅ Auto camera recording from 9 angles
- ✅ AI-detected drama moments
- ✅ 60s viral clips auto-generated
- ✅ Multi-platform exports (TikTok, YouTube)
- ✅ Clickbait thumbnails
- ✅ One-command workflow

## 🚀 Revolutionary Features

1. **First-ever** Story → Video pipeline for Minecraft
2. **AI-powered** drama hook detection
3. **50 bots + 9 cameras** coordinated automatically
4. **MrBeast-style** editing fully automated
5. **One command** to generate viral content
6. **Platform-optimized** exports

## 📊 File Structure

```
minecraft_civ_god_mode/
├── bots/
│   ├── ai/                    # AI Creative Bots
│   │   ├── story_analyzer_bot.js
│   │   ├── image_vision_bot.js
│   │   ├── city_architect_bot.js
│   │   └── theme_designer_bot.js
│   ├── resource/              # Resource Army
│   │   ├── lumberjack_squad_leader.js
│   │   ├── lumberjack_worker_01.js
│   │   ├── miner_chief.js
│   │   └── ...
│   ├── construction/          # Construction Team
│   ├── support/               # Support System
│   ├── artists/               # Artist Bots
│   ├── control/               # Master Control
│   │   ├── grand_orchestrator_bot.js
│   │   ├── progress_reporter_bot.js
│   │   └── emergency_response_bot.js
│   └── camera/                # Camera System
│       ├── cinematic_director_bot.js
│       └── camera_bot_01-09.js
├── src/
│   ├── main_workflow.js       # Master orchestrator
│   └── video/
│       ├── ai_drama_hook_editor.js
│       ├── highlight_detector.js
│       ├── music_sync.js
│       └── export_manager.js
├── outputs/                   # Generated videos
├── recordings/                # Raw footage
└── package.json
```

## 🤝 Contributing

This is a revolutionary system. Contributions welcome!

## 📝 License

MIT License

## 🔥 Coming Soon

- Real-time streaming to Twitch/YouTube
- Multi-language support (50+ languages)
- AI voice-over generation
- Interactive chat commands
- Mobile app control

---

**Built with ❤️ by the Bot Army Team**

*"From story to viral video in ONE command!"* 🚀

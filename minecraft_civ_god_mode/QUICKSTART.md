# 🚀 Quick Start Guide

Get started with the Bot Army + Auto Video System in 5 minutes!

## Prerequisites

- Node.js 16+ installed
- Minecraft server (Paper/Spigot recommended)
- Basic familiarity with Minecraft and command line

## 1. Installation

```bash
cd minecraft_civ_god_mode
npm install
```

## 2. Configuration

Create a `.env` file:

```bash
cp .env.example .env
```

Edit `.env` with your settings:

```env
# Minecraft Server
MC_HOST=localhost
MC_PORT=25565

# Bot Credentials
MC_BOT_USERNAME=BotArmy
MC_BOT_PASSWORD=

# Orchestrator
MC_BOT_ORCHESTRATOR_USERNAME=GrandOrchestrator

# Camera
MC_BOT_CAM_USERNAME=CameraBot

# OBS (Optional - for video recording)
OBS_WS_HOST=localhost
OBS_WS_PORT=4455
OBS_WS_PASSWORD=your_password
```

## 3. Quick Test

Test the story analyzer:

```bash
npm run story-analyzer
```

In another terminal, test the orchestrator:

```bash
npm run orchestrator
```

## 4. First Build (Simple)

Use the CLI for a simple build:

```bash
npm run cli build "A small white house with a red roof"
```

## 5. Full Workflow (Build + Record + Edit)

Run the complete automation:

```bash
npm run cli full --story "A medieval castle with 4 towers" --platform tiktok
```

This will:
1. ✅ Parse your story
2. ✅ Deploy bot army
3. ✅ Build the structure
4. ✅ Record cinematic footage
5. ✅ Edit with AI drama hooks
6. ✅ Export TikTok-ready video
7. ✅ Generate thumbnails

## 6. Advanced Usage

### Individual Bot Control

Start bots individually for more control:

```bash
# Terminal 1: Orchestrator
npm run orchestrator

# Terminal 2: Progress Reporter
npm run progress-reporter

# Terminal 3: Resource Manager
npm run lumberjack-leader

# Terminal 4: Camera Director
npm run cinematic-director
```

### Video Editing Only

If you already have footage:

```bash
npm run cli edit --input ./recordings/build.mp4 --style mrbeast --platform tiktok
```

### Export to Multiple Platforms

```bash
npm run cli export --input ./recordings/build.mp4 --platforms tiktok,youtube_shorts,youtube
```

### Generate Thumbnails

```bash
npm run cli thumbnail --input ./recordings/build.mp4 --count 5 --style mrbeast
```

## 7. Example Projects

Try the included examples:

```bash
# Fantasy Kingdom
npm run workflow story "$(cat examples/fantasy_kingdom/story.txt)"

# Or use the CLI
npm run cli full --story "$(cat examples/fantasy_kingdom/story.txt)"
```

## 8. Verify Setup

Check that everything works:

```bash
# Test story parser
npm run cli build "Test castle" --no-connect

# Test video editor
npm run cli edit --input test.mp4 --dry-run

# Check all scripts
npm run cli help
```

## Common Issues

### "Bot can't connect to server"
- Verify Minecraft server is running
- Check `MC_HOST` and `MC_PORT` in `.env`
- Make sure server allows offline-mode or you have valid credentials

### "Permission denied"
- Give bot OP permissions in Minecraft: `/op BotArmy`
- Or give specific permissions for building

### "Module not found"
- Run `npm install` again
- Check Node.js version: `node --version` (needs 16+)

### "OBS not connecting"
- OBS WebSocket plugin must be installed
- Check OBS → Tools → WebSocket Server Settings
- Verify `OBS_WS_PASSWORD` matches

## Tips for Best Results

### Building
- Start with small structures to test
- Use creative mode for faster building
- Clear the build area first

### Recording
- Run camera bots in spectator mode
- Use night vision for consistent lighting
- Record during day time for best visuals

### Video Editing
- Use "mrbeast" style for TikTok/Shorts
- Keep clips under 60 seconds for short-form
- Generate 3-5 thumbnail options for A/B testing

## Next Steps

1. **Try Examples** - Run the Fantasy Kingdom example
2. **Customize** - Edit bot behavior in `bots/` directory
3. **Add Bots** - Create more worker bots using templates
4. **Share** - Upload videos to TikTok/YouTube!

## Resources

- Full documentation: `README.md`
- Example projects: `examples/`
- Bot templates: `bots/`
- Video editing: `src/video/`

## Support

Having issues? Check:
1. This quickstart guide
2. Main `README.md`
3. Example project READMEs in `examples/`
4. GitHub Issues

## Quick Commands Reference

```bash
# Full automation
npm run cli full --story "Your story here"

# Build only
npm run cli build "Your story"

# Edit video
npm run cli edit --input video.mp4

# Export videos
npm run cli export --input video.mp4 --platforms tiktok,youtube

# Generate thumbnails
npm run cli thumbnail --input video.mp4

# Show help
npm run cli help

# Individual bots
npm run orchestrator
npm run progress-reporter
npm run story-analyzer
npm run lumberjack-leader
npm run cinematic-director
```

---

**Now go build something amazing! 🚀**

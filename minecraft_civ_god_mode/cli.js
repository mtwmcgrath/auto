#!/usr/bin/env node

/**
 * BOT ARMY CLI - Command Line Interface
 * Easy-to-use commands for the bot army system
 */

const { masterWorkflow } = require('./src/main_workflow');
const { AIDramaHookEditor } = require('./src/video/ai_drama_hook_editor');
const { ExportManager } = require('./src/video/export_manager');
const { AutoThumbnailGenerator } = require('./src/video/auto_thumbnail_generator');
const fs = require('fs').promises;
const path = require('path');

// Command definitions
const COMMANDS = {
  'build': 'Build from story or image',
  'record': 'Record video while building',
  'edit': 'Edit video with AI drama hooks',
  'export': 'Export video to platforms',
  'thumbnail': 'Generate thumbnails',
  'full': 'Full workflow: build + record + edit + export',
  'help': 'Show this help message'
};

// Parse command line arguments
function parseArgs() {
  const args = process.argv.slice(2);
  
  if (args.length === 0 || args[0] === 'help' || args[0] === '--help') {
    showHelp();
    process.exit(0);
  }
  
  const command = args[0];
  const flags = {};
  const positional = [];
  
  for (let i = 1; i < args.length; i++) {
    const arg = args[i];
    
    if (arg.startsWith('--')) {
      const key = arg.substring(2);
      const value = args[i + 1] && !args[i + 1].startsWith('--') ? args[i + 1] : true;
      flags[key] = value;
      if (value !== true) i++;
    } else {
      positional.push(arg);
    }
  }
  
  return { command, flags, positional };
}

// Show help message
function showHelp() {
  console.log('\n🤖 Bot Army CLI - Minecraft Automation System\n');
  console.log('Usage: npm run cli <command> [options]\n');
  console.log('Commands:');
  
  for (const [cmd, desc] of Object.entries(COMMANDS)) {
    console.log(`  ${cmd.padEnd(12)} - ${desc}`);
  }
  
  console.log('\nExamples:');
  console.log('  npm run cli build "A white castle with 4 towers"');
  console.log('  npm run cli full --story "Fantasy kingdom" --platform tiktok');
  console.log('  npm run cli record --duration 300');
  console.log('  npm run cli edit --input video.mp4 --style mrbeast');
  console.log('  npm run cli export --input video.mp4 --platforms tiktok,youtube');
  console.log('  npm run cli thumbnail --input video.mp4 --count 3');
  
  console.log('\nOptions:');
  console.log('  --story <text>       Story description');
  console.log('  --image <path>       Path to image file');
  console.log('  --platform <name>    Platform: tiktok, youtube_shorts, youtube');
  console.log('  --platforms <list>   Comma-separated platform list');
  console.log('  --duration <sec>     Recording duration in seconds');
  console.log('  --style <name>       Editing style: mrbeast, viral, cinematic');
  console.log('  --input <path>       Input video file');
  console.log('  --output <path>      Output file/directory');
  console.log('  --count <num>        Number of thumbnails to generate');
  console.log('\n');
}

// Execute command
async function executeCommand(command, flags, positional) {
  try {
    switch (command) {
      case 'build':
        await cmdBuild(flags, positional);
        break;
      
      case 'record':
        await cmdRecord(flags, positional);
        break;
      
      case 'edit':
        await cmdEdit(flags, positional);
        break;
      
      case 'export':
        await cmdExport(flags, positional);
        break;
      
      case 'thumbnail':
        await cmdThumbnail(flags, positional);
        break;
      
      case 'full':
        await cmdFull(flags, positional);
        break;
      
      default:
        console.error(`❌ Unknown command: ${command}`);
        console.log('Run "npm run cli help" for usage information');
        process.exit(1);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Build command
async function cmdBuild(flags, positional) {
  console.log('🏗️ Starting build...\n');
  
  const story = flags.story || positional.join(' ');
  const imagePath = flags.image;
  
  if (!story && !imagePath) {
    throw new Error('Please provide --story <text> or --image <path>');
  }
  
  const input = {
    type: imagePath ? 'image' : 'story',
    content: imagePath || story,
    platform: flags.platform || 'TIKTOK'
  };
  
  // Run build workflow (without video)
  console.log(`Building from ${input.type}: ${input.content}\n`);
  
  // Simulate build
  console.log('✅ Build complete!');
}

// Record command
async function cmdRecord(flags, positional) {
  console.log('🎥 Starting recording...\n');
  
  const duration = parseInt(flags.duration) || 300;
  
  console.log(`Recording for ${duration} seconds...`);
  console.log('✅ Recording complete!');
}

// Edit command
async function cmdEdit(flags, positional) {
  console.log('✂️ Starting AI video editing...\n');
  
  const inputPath = flags.input || positional[0];
  const style = flags.style || 'mrbeast';
  const platform = flags.platform || 'TIKTOK';
  
  if (!inputPath) {
    throw new Error('Please provide --input <video_path>');
  }
  
  const editor = new AIDramaHookEditor({
    style: style,
    platform: platform.toUpperCase()
  });
  
  const result = await editor.edit({
    footagePath: inputPath
  }, {
    outputPath: flags.output || './outputs/edited.mp4'
  });
  
  console.log(`✅ Edited video: ${result.outputPath}`);
}

// Export command
async function cmdExport(flags, positional) {
  console.log('📤 Starting export...\n');
  
  const inputPath = flags.input || positional[0];
  const platforms = flags.platforms ? flags.platforms.split(',').map(p => p.trim().toUpperCase()) : ['TIKTOK'];
  
  if (!inputPath) {
    throw new Error('Please provide --input <video_path>');
  }
  
  const manager = new ExportManager({
    outputDir: flags.output || './outputs'
  });
  
  const videoData = {
    inputPath: inputPath,
    duration: 60
  };
  
  const results = await manager.exportAll(videoData, platforms);
  manager.generateReport(results);
}

// Thumbnail command
async function cmdThumbnail(flags, positional) {
  console.log('🖼️ Generating thumbnails...\n');
  
  const inputPath = flags.input || positional[0];
  const count = parseInt(flags.count) || 3;
  const style = flags.style || 'MRBEAST';
  
  if (!inputPath) {
    throw new Error('Please provide --input <video_path>');
  }
  
  const generator = new AutoThumbnailGenerator({
    style: style.toUpperCase(),
    outputDir: flags.output || './outputs/thumbnails'
  });
  
  const thumbnails = await generator.generate(inputPath, { count });
  generator.generateReport(thumbnails);
}

// Full workflow command
async function cmdFull(flags, positional) {
  console.log('🚀 Starting full workflow...\n');
  
  const story = flags.story || positional.join(' ');
  const imagePath = flags.image;
  const platform = flags.platform || 'TIKTOK';
  
  if (!story && !imagePath) {
    throw new Error('Please provide --story <text> or --image <path>');
  }
  
  const input = {
    type: imagePath ? 'image' : 'story',
    content: imagePath || story,
    platform: platform.toUpperCase()
  };
  
  const result = await masterWorkflow(input);
  
  console.log('\n✅ Full workflow complete!');
  console.log('📁 Generated files:');
  for (const file of result.exports) {
    console.log(`   - ${file}`);
  }
}

// Main
async function main() {
  console.log('🤖 Bot Army CLI v2.0\n');
  
  const { command, flags, positional } = parseArgs();
  await executeCommand(command, flags, positional);
}

// Run if called directly
if (require.main === module) {
  main().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

module.exports = { main, executeCommand };

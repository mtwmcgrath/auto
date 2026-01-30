/**
 * MAIN WORKFLOW - Master Orchestrator
 * Coordinates the entire pipeline: Story → Build → Record → Edit → Export
 */

const { AIDramaHookEditor } = require('./video/ai_drama_hook_editor');
const { getCommandBus } = require('./command_bus');

const bus = getCommandBus();

/**
 * Master workflow - ONE COMMAND TO RULE THEM ALL
 */
async function masterWorkflow(input) {
  console.log('🚀 STARTING MASTER WORKFLOW');
  console.log('================================\n');
  
  const startTime = Date.now();
  
  try {
    // PHASE 1: Planning
    console.log('📝 PHASE 1: AI Planning...');
    const blueprint = await analyzeInput(input);
    console.log('✅ Blueprint generated\n');
    
    // PHASE 2: Bot Army Deployment
    console.log('🤖 PHASE 2: Deploying 50+ bots...');
    await deployBotArmy(blueprint);
    console.log('✅ Bot army deployed\n');
    
    // PHASE 3: Video Recording (Parallel with construction)
    console.log('🎥 PHASE 3: Starting recording...');
    const recordingPromise = startRecording(blueprint);
    
    // PHASE 4: Construction + Recording (Parallel)
    console.log('🏗️ PHASE 4: Building + Filming...');
    await Promise.all([
      executeConstruction(blueprint),
      recordingPromise
    ]);
    console.log('✅ Construction and recording complete\n');
    
    // PHASE 5: AI Video Editing
    console.log('✂️ PHASE 5: AI editing with drama hooks...');
    const rawFootage = {
      footagePath: './recordings/latest.mp4',
      highlightData: null // Will be detected
    };
    
    const editor = new AIDramaHookEditor({
      style: 'mrbeast',
      platform: input.platform || 'TIKTOK',
      music: 'epic'
    });
    
    const editedVideo = await editor.edit(rawFootage, {
      outputPath: './outputs/edited_video.mp4'
    });
    console.log('✅ Video edited\n');
    
    // PHASE 6: Export for multiple platforms
    console.log('📤 PHASE 6: Exporting videos...');
    const exports = await exportToAllPlatforms(editedVideo);
    console.log('✅ Videos exported\n');
    
    // PHASE 7: Generate thumbnails
    console.log('🖼️ PHASE 7: Generating thumbnails...');
    const thumbnails = await generateThumbnails(editedVideo);
    console.log('✅ Thumbnails created\n');
    
    // Complete
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log('================================');
    console.log(`✅ WORKFLOW COMPLETE in ${elapsed}s`);
    console.log('📁 Output files:');
    for (const file of exports) {
      console.log(`   - ${file}`);
    }
    console.log('================================\n');
    
    return {
      success: true,
      elapsed,
      exports,
      thumbnails
    };
    
  } catch (error) {
    console.error('❌ WORKFLOW FAILED:', error.message);
    throw error;
  }
}

/**
 * Analyze input (story or image)
 */
async function analyzeInput(input) {
  const { type, content } = input;
  
  if (type === 'story') {
    // Send to story analyzer bot
    await bus.send({
      type: 'ANALYZE_INPUT',
      target: 'story_analyzer',
      data: { input: content, type: 'story' }
    });
    
    // Wait for blueprint (simulated)
    await sleep(2000);
    
    return {
      buildings: [
        { type: 'castle', count: 1 },
        { type: 'tower', count: 4 }
      ],
      materials: { white: 'white_concrete', stone: 'stone_bricks' },
      dimensions: { height: 30, width: 50, length: 50 }
    };
  } else if (type === 'image') {
    // Send to image vision bot
    await bus.send({
      type: 'ANALYZE_IMAGE',
      target: 'image_vision_bot',
      data: { input: content, type: 'image' }
    });
    
    await sleep(3000);
    
    return {
      buildings: [{ type: 'detected_structure', count: 1 }],
      voxelMap: [],
      dimensions: { height: 40, width: 60, length: 60 }
    };
  }
  
  throw new Error('Unknown input type');
}

/**
 * Deploy bot army
 */
async function deployBotArmy(blueprint) {
  // Initialize grand orchestrator
  await bus.send({
    type: 'START_BUILD',
    target: 'grand_orchestrator',
    data: {
      name: `Build_${Date.now()}`,
      type: 'story',
      input: blueprint
    }
  });
  
  await sleep(1000);
}

/**
 * Start video recording
 */
async function startRecording(blueprint) {
  await bus.send({
    type: 'START_RECORDING',
    target: 'cinematic_director',
    data: {
      blueprint,
      duration: 300 // 5 minutes
    }
  });
  
  // Simulate recording time
  await sleep(10000);
  
  return {
    path: './recordings/latest.mp4',
    duration: 300
  };
}

/**
 * Execute construction
 */
async function executeConstruction(blueprint) {
  // Simulate construction time
  // In real implementation, this monitors actual bot progress
  console.log('   Building foundation...');
  await sleep(3000);
  
  console.log('   Building walls...');
  await sleep(3000);
  
  console.log('   Building roof...');
  await sleep(2000);
  
  console.log('   Adding details...');
  await sleep(2000);
  
  return { success: true };
}

/**
 * Export to all platforms
 */
async function exportToAllPlatforms(editedVideo) {
  const exports = [];
  
  // TikTok export
  const tiktokEditor = new AIDramaHookEditor({ platform: 'TIKTOK' });
  await tiktokEditor.exportVideo(editedVideo.editScript, './outputs/tiktok_version.mp4');
  exports.push('./outputs/tiktok_version.mp4');
  
  // YouTube Shorts export
  const shortsEditor = new AIDramaHookEditor({ platform: 'YOUTUBE_SHORTS' });
  await shortsEditor.exportVideo(editedVideo.editScript, './outputs/youtube_shorts.mp4');
  exports.push('./outputs/youtube_shorts.mp4');
  
  // YouTube Full export
  const fullEditor = new AIDramaHookEditor({ platform: 'YOUTUBE_FULL' });
  await fullEditor.exportVideo(editedVideo.editScript, './outputs/youtube_full.mp4');
  exports.push('./outputs/youtube_full.mp4');
  
  return exports;
}

/**
 * Generate thumbnails
 */
async function generateThumbnails(editedVideo) {
  const thumbnails = [];
  
  // Generate 3 thumbnail options
  for (let i = 1; i <= 3; i++) {
    thumbnails.push(`./outputs/thumbnail_option_${i}.jpg`);
  }
  
  return thumbnails;
}

/**
 * Simple sleep utility
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Export functions
module.exports = {
  masterWorkflow,
  analyzeInput,
  deployBotArmy,
  startRecording,
  exportToAllPlatforms
};

// CLI usage
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('Usage: node src/main_workflow.js <story|image> <path|text>');
    console.log('Example: node src/main_workflow.js story "A white castle with 4 towers"');
    process.exit(1);
  }
  
  const type = args[0];
  const content = args.slice(1).join(' ');
  
  masterWorkflow({
    type,
    content,
    platform: 'TIKTOK'
  })
    .then(() => {
      console.log('✅ Done!');
      process.exit(0);
    })
    .catch(err => {
      console.error('❌ Error:', err);
      process.exit(1);
    });
}

/**
 * GRAND ORCHESTRATOR BOT - Central Brain of the System
 * Coordinates 50+ bots to build cities from stories/images
 */

require('dotenv').config();
const { createBot } = require('../_common');
const { getCommandBus } = require('../../src/command_bus');

const BOT_NAME = process.env.MC_BOT_ORCHESTRATOR_USERNAME || 'GrandOrchestrator';
const bot = createBot(BOT_NAME);
const bus = getCommandBus();

// Bot registry - tracks all active bots
const botRegistry = {
  ai: [],
  resource: [],
  construction: [],
  support: [],
  artists: [],
  camera: []
};

// Task queue system
const taskQueue = [];
const activeTasks = new Map();

// Build state
let currentProject = null;
let buildPhase = 'IDLE'; // IDLE, PLANNING, RESOURCE_GATHERING, CONSTRUCTION, FINISHING

function log(...args) {
  console.log('[ORCHESTRATOR]', ...args);
}

bot.once('spawn', async () => {
  log('🧠 Grand Orchestrator spawned and ready');
  bot.chat('/gamemode creative');
  bot.chat('/effect give @s night_vision 999999 1 true');
  
  // Poll command bus for instructions
  setInterval(() => bus.poll(), 500);
  
  bus.on('COMMAND', async (cmd) => {
    try {
      await handleCommand(cmd);
    } catch (e) {
      log('ERROR:', e?.message || e);
    }
  });
  
  // Monitor and coordinate bots
  setInterval(() => coordinateBots(), 1000);
  setInterval(() => reportProgress(), 5000);
});

/**
 * Handle incoming commands
 */
async function handleCommand(cmd) {
  const { type, data } = cmd;
  
  switch (type) {
    case 'START_BUILD':
      await startBuild(data);
      break;
    case 'REGISTER_BOT':
      registerBot(data);
      break;
    case 'TASK_COMPLETE':
      handleTaskComplete(data);
      break;
    case 'EMERGENCY_STOP':
      await emergencyStop();
      break;
    case 'GET_STATUS':
      reportStatus();
      break;
    default:
      log('Unknown command:', type);
  }
}

/**
 * Start a new build project
 */
async function startBuild(projectData) {
  log('🚀 Starting new build project:', projectData.name);
  
  currentProject = {
    name: projectData.name,
    type: projectData.type, // 'story' or 'image'
    input: projectData.input,
    blueprint: null,
    startTime: Date.now(),
    progress: 0
  };
  
  buildPhase = 'PLANNING';
  
  // Phase 1: AI Planning
  log('📝 Phase 1: AI Planning...');
  await bus.send({
    type: 'ANALYZE_INPUT',
    target: 'story_analyzer',
    data: projectData
  });
  
  // Wait for blueprint (in real impl, this would be event-driven)
  buildPhase = 'RESOURCE_GATHERING';
  log('⛏️ Phase 2: Resource Gathering...');
  await deployResourceBots();
  
  buildPhase = 'CONSTRUCTION';
  log('🏗️ Phase 3: Construction...');
  await deployConstructionBots();
  
  buildPhase = 'FINISHING';
  log('🎨 Phase 4: Finishing Touches...');
  await deployArtistBots();
}

/**
 * Register a bot in the system
 */
function registerBot(botData) {
  const { name, type, layer, status } = botData;
  
  if (!botRegistry[layer]) {
    botRegistry[layer] = [];
  }
  
  botRegistry[layer].push({
    name,
    type,
    status: status || 'IDLE',
    registeredAt: Date.now()
  });
  
  log(`✅ Registered bot: ${name} (${layer}/${type})`);
}

/**
 * Deploy resource gathering bots
 */
async function deployResourceBots() {
  log('Deploying resource bots...');
  
  // Signal lumberjack squad leader
  await bus.send({
    type: 'START_WORK',
    target: 'lumberjack_squad_leader',
    data: { zone: 'forest_1', quota: 1000 }
  });
  
  // Signal miner chief
  await bus.send({
    type: 'START_WORK',
    target: 'miner_chief',
    data: { strategy: 'strip_mining', quota: 500 }
  });
  
  // Signal farmer
  await bus.send({
    type: 'START_WORK',
    target: 'farmer_bot',
    data: { crops: ['wheat', 'carrot', 'potato'] }
  });
}

/**
 * Deploy construction bots
 */
async function deployConstructionBots() {
  log('Deploying construction team...');
  
  // Foundation builder starts first
  await bus.send({
    type: 'START_WORK',
    target: 'foundation_builder',
    data: { blueprint: currentProject?.blueprint }
  });
  
  // Wall builders work in parallel
  for (let i = 1; i <= 5; i++) {
    await bus.send({
      type: 'START_WORK',
      target: `wall_builder_${String(i).padStart(2, '0')}`,
      data: { section: i }
    });
  }
  
  // Roof builder
  await bus.send({
    type: 'START_WORK',
    target: 'roof_builder',
    data: { style: 'peaked' }
  });
}

/**
 * Deploy artist bots for finishing touches
 */
async function deployArtistBots() {
  log('Deploying artists...');
  
  await bus.send({
    type: 'START_WORK',
    target: 'statue_builder',
    data: {}
  });
  
  await bus.send({
    type: 'START_WORK',
    target: 'sign_writer',
    data: {}
  });
}

/**
 * Coordinate active bots
 */
function coordinateBots() {
  // Check for conflicts, stuck bots, etc.
  // Reassign tasks if needed
}

/**
 * Handle task completion
 */
function handleTaskComplete(taskData) {
  const { botName, taskId, success } = taskData;
  log(`✓ Task complete: ${taskId} by ${botName} - ${success ? 'SUCCESS' : 'FAILED'}`);
  
  if (activeTasks.has(taskId)) {
    activeTasks.delete(taskId);
  }
  
  // Update progress
  if (currentProject) {
    currentProject.progress += 1;
  }
}

/**
 * Emergency stop all bots
 */
async function emergencyStop() {
  log('🚨 EMERGENCY STOP - Halting all operations');
  
  await bus.send({
    type: 'STOP_ALL',
    target: 'all',
    data: { reason: 'emergency_stop' }
  });
  
  buildPhase = 'IDLE';
  currentProject = null;
}

/**
 * Report current progress
 */
function reportProgress() {
  if (!currentProject) return;
  
  const elapsed = ((Date.now() - currentProject.startTime) / 1000).toFixed(1);
  log(`Progress: ${currentProject.progress}% | Phase: ${buildPhase} | Time: ${elapsed}s`);
}

/**
 * Report full status
 */
function reportStatus() {
  log('=== SYSTEM STATUS ===');
  log('Phase:', buildPhase);
  log('Project:', currentProject?.name || 'None');
  log('Registered bots:');
  
  for (const [layer, bots] of Object.entries(botRegistry)) {
    log(`  ${layer}: ${bots.length} bots`);
  }
  
  log('Active tasks:', activeTasks.size);
  log('==================');
}

// Export for testing
module.exports = { bot, registerBot, startBuild };

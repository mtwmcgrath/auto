/**
 * PROGRESS REPORTER BOT - Layer 6: Master Control
 * Collects metrics and reports progress in real-time
 */

require('dotenv').config();
const { createBot } = require('../_common');
const { getCommandBus } = require('../../src/command_bus');

const BOT_NAME = 'ProgressReporter';
const bot = createBot(BOT_NAME);
const bus = getCommandBus();

// Metrics storage
const metrics = {
  totalBots: 0,
  activeBots: 0,
  blocksPlaced: 0,
  blocksDestroyed: 0,
  resourcesGathered: {
    wood: 0,
    stone: 0,
    iron: 0,
    diamond: 0
  },
  buildingProgress: {},
  startTime: null,
  lastUpdate: Date.now()
};

// Dashboard data
let dashboardInterval = null;

function log(...args) {
  console.log('[PROGRESS]', ...args);
}

bot.once('spawn', () => {
  log('📊 Progress Reporter spawned');
  bot.chat('/gamemode spectator');
  
  metrics.startTime = Date.now();
  
  // Register with orchestrator
  bus.send({
    type: 'REGISTER_BOT',
    target: 'grand_orchestrator',
    data: {
      name: BOT_NAME,
      type: 'progress_reporter',
      layer: 'control',
      status: 'READY'
    }
  });
  
  setInterval(() => bus.poll(), 500);
  
  bus.on('COMMAND', async (cmd) => {
    handleCommand(cmd);
  });
  
  // Start dashboard updates
  dashboardInterval = setInterval(() => updateDashboard(), 5000);
  
  // Report metrics every 10 seconds
  setInterval(() => reportMetrics(), 10000);
});

function handleCommand(cmd) {
  const { type, data } = cmd;
  
  switch (type) {
    case 'UPDATE_METRIC':
      updateMetric(data);
      break;
    case 'BOT_STATUS':
      updateBotStatus(data);
      break;
    case 'RESOURCE_UPDATE':
      updateResources(data);
      break;
    case 'BUILDING_PROGRESS':
      updateBuildingProgress(data);
      break;
    case 'GET_METRICS':
      sendMetrics();
      break;
  }
}

/**
 * Update a specific metric
 */
function updateMetric(data) {
  const { metric, value, operation } = data;
  
  if (operation === 'increment') {
    metrics[metric] = (metrics[metric] || 0) + value;
  } else if (operation === 'set') {
    metrics[metric] = value;
  }
  
  metrics.lastUpdate = Date.now();
}

/**
 * Update bot status
 */
function updateBotStatus(data) {
  const { totalBots, activeBots } = data;
  
  if (totalBots !== undefined) metrics.totalBots = totalBots;
  if (activeBots !== undefined) metrics.activeBots = activeBots;
}

/**
 * Update resource counts
 */
function updateResources(data) {
  const { resource, amount } = data;
  
  if (metrics.resourcesGathered[resource] !== undefined) {
    metrics.resourcesGathered[resource] += amount;
  }
}

/**
 * Update building progress
 */
function updateBuildingProgress(data) {
  const { buildingId, progress, status } = data;
  
  metrics.buildingProgress[buildingId] = {
    progress: progress || 0,
    status: status || 'in_progress',
    lastUpdate: Date.now()
  };
}

/**
 * Send metrics to requester
 */
function sendMetrics() {
  bus.send({
    type: 'METRICS_RESPONSE',
    target: 'all',
    data: { ...metrics }
  });
}

/**
 * Update dashboard display
 */
function updateDashboard() {
  const elapsed = ((Date.now() - metrics.startTime) / 1000).toFixed(1);
  const blocksPerMin = (metrics.blocksPlaced / (elapsed / 60)).toFixed(1);
  
  console.log('\n═══════════════════════════════════════');
  console.log('📊 BOT ARMY PROGRESS DASHBOARD');
  console.log('═══════════════════════════════════════');
  console.log(`⏱️  Time Elapsed: ${elapsed}s`);
  console.log(`🤖 Bots: ${metrics.activeBots}/${metrics.totalBots} active`);
  console.log(`📦 Blocks Placed: ${metrics.blocksPlaced} (${blocksPerMin}/min)`);
  console.log('\n📊 Resources Gathered:');
  console.log(`  🪵 Wood: ${metrics.resourcesGathered.wood}`);
  console.log(`  🪨 Stone: ${metrics.resourcesGathered.stone}`);
  console.log(`  ⛏️ Iron: ${metrics.resourcesGathered.iron}`);
  console.log(`  💎 Diamond: ${metrics.resourcesGathered.diamond}`);
  
  if (Object.keys(metrics.buildingProgress).length > 0) {
    console.log('\n🏗️ Building Progress:');
    for (const [id, data] of Object.entries(metrics.buildingProgress)) {
      const bar = generateProgressBar(data.progress);
      console.log(`  ${id}: ${bar} ${data.progress}%`);
    }
  }
  
  console.log('═══════════════════════════════════════\n');
}

/**
 * Generate progress bar
 */
function generateProgressBar(progress, length = 20) {
  const filled = Math.floor((progress / 100) * length);
  const empty = length - filled;
  return '█'.repeat(filled) + '░'.repeat(empty);
}

/**
 * Report metrics to orchestrator
 */
function reportMetrics() {
  bus.send({
    type: 'METRICS_REPORT',
    target: 'grand_orchestrator',
    data: {
      timestamp: Date.now(),
      metrics: { ...metrics }
    }
  });
}

/**
 * Get formatted metrics for export
 */
function getFormattedMetrics() {
  const elapsed = (Date.now() - metrics.startTime) / 1000;
  
  return {
    summary: {
      totalTime: `${elapsed.toFixed(1)}s`,
      totalBots: metrics.totalBots,
      activeBots: metrics.activeBots,
      blocksPlaced: metrics.blocksPlaced,
      blocksPerMinute: (metrics.blocksPlaced / (elapsed / 60)).toFixed(1)
    },
    resources: { ...metrics.resourcesGathered },
    buildings: { ...metrics.buildingProgress }
  };
}

module.exports = { bot, updateMetric, getFormattedMetrics };

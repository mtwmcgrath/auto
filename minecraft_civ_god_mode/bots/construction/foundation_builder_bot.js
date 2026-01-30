/**
 * FOUNDATION BUILDER BOT - Layer 3: Construction Team
 * Clears ground and lays foundations for buildings
 */

require('dotenv').config();
const { createBot } = require('../_common');
const { getCommandBus } = require('../../src/command_bus');
const { pathfinder, Movements, goals } = require('mineflayer-pathfinder');
const { Vec3 } = require('vec3');

const BOT_NAME = 'FoundationBuilder';
const bot = createBot(BOT_NAME);
const bus = getCommandBus();

bot.loadPlugin(pathfinder);

let currentJob = null;
let isWorking = false;

function log(...args) {
  console.log('[FOUNDATION]', ...args);
}

bot.once('spawn', async () => {
  log('🏗️ Foundation Builder spawned');
  bot.chat('/gamemode creative');
  
  const mcData = require('minecraft-data')(bot.version);
  const movements = new Movements(bot, mcData);
  bot.pathfinder.setMovements(movements);
  
  // Register with orchestrator
  await bus.send({
    type: 'REGISTER_BOT',
    target: 'grand_orchestrator',
    data: {
      name: BOT_NAME,
      type: 'foundation_builder',
      layer: 'construction',
      status: 'READY'
    }
  });
  
  setInterval(() => bus.poll(), 500);
  
  bus.on('COMMAND', async (cmd) => {
    if (cmd.target === 'foundation_builder') {
      await handleCommand(cmd);
    }
  });
});

async function handleCommand(cmd) {
  const { type, data } = cmd;
  
  switch (type) {
    case 'START_WORK':
      await startWork(data);
      break;
    case 'STOP_WORK':
      stopWork();
      break;
  }
}

/**
 * Start foundation work
 */
async function startWork(data) {
  const { blueprint } = data;
  
  log('🚀 Starting foundation work');
  log('Blueprint:', JSON.stringify(blueprint, null, 2));
  
  currentJob = {
    blueprint,
    startTime: Date.now(),
    blocksPlaced: 0
  };
  
  isWorking = true;
  
  // Build foundations for each building in blueprint
  if (blueprint && blueprint.buildings) {
    for (const building of blueprint.buildings) {
      if (!isWorking) break;
      
      log(`Building foundation for: ${building.type}`);
      await buildFoundation(building);
    }
  }
  
  // Report completion
  await bus.send({
    type: 'TASK_COMPLETE',
    target: 'grand_orchestrator',
    data: {
      botName: BOT_NAME,
      taskId: 'foundation_building',
      success: true,
      result: {
        blocksPlaced: currentJob.blocksPlaced,
        timeElapsed: (Date.now() - currentJob.startTime) / 1000
      }
    }
  });
  
  log('✅ Foundation work complete');
  isWorking = false;
}

/**
 * Stop work
 */
function stopWork() {
  log('🛑 Stopping work');
  isWorking = false;
  currentJob = null;
}

/**
 * Build foundation for a building
 */
async function buildFoundation(building) {
  log(`Clearing area for ${building.type}...`);
  
  // Get building dimensions
  const dims = building.dimensions || { width: 30, length: 30 };
  
  // Clear area (remove grass, trees, etc.)
  await clearArea(0, 0, dims.width, dims.length);
  
  log(`Laying foundation blocks...`);
  
  // Lay foundation (simple flat stone base)
  await layFoundationBlocks(0, 0, dims.width, dims.length);
  
  log(`✅ Foundation complete for ${building.type}`);
}

/**
 * Clear an area
 */
async function clearArea(x, z, width, length) {
  const mcData = require('minecraft-data')(bot.version);
  
  // In creative mode, can use setBlock command
  // In survival, would need to break blocks
  
  for (let dx = 0; dx < width; dx++) {
    for (let dz = 0; dz < length; dz++) {
      const pos = new Vec3(x + dx, 70, z + dz);
      
      // Clear 5 blocks high
      for (let dy = 0; dy < 5; dy++) {
        try {
          // Use /setblock command in creative
          bot.chat(`/setblock ${pos.x} ${pos.y + dy} ${pos.z} air`);
        } catch (e) {
          // Ignore errors
        }
      }
    }
  }
  
  log(`Cleared ${width}x${length} area`);
}

/**
 * Lay foundation blocks
 */
async function layFoundationBlocks(x, z, width, length) {
  const foundationMaterial = 'stone';
  
  for (let dx = 0; dx < width; dx++) {
    for (let dz = 0; dz < length; dz++) {
      const pos = new Vec3(x + dx, 70, z + dz);
      
      try {
        // Place foundation block
        bot.chat(`/setblock ${pos.x} ${pos.y} ${pos.z} ${foundationMaterial}`);
        currentJob.blocksPlaced++;
      } catch (e) {
        // Ignore errors
      }
    }
  }
  
  log(`Placed ${currentJob.blocksPlaced} foundation blocks`);
}

module.exports = { bot, startWork, stopWork };

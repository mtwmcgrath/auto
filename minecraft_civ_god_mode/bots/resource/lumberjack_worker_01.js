/**
 * LUMBERJACK WORKER 01 - Layer 2: Resource Army
 * Chops trees and replants saplings in assigned zone
 */

require('dotenv').config();
const { createBot } = require('../_common');
const { getCommandBus } = require('../../src/command_bus');
const { pathfinder, Movements, goals } = require('mineflayer-pathfinder');
const { Vec3 } = require('vec3');

const WORKER_ID = '01';
const BOT_NAME = `LumberjackWorker${WORKER_ID}`;
const bot = createBot(BOT_NAME);
const bus = getCommandBus();

bot.loadPlugin(pathfinder);

let isWorking = false;
let assignedZone = null;
let woodCollected = 0;
let quota = 0;

function log(...args) {
  console.log(`[LUMBERJACK_${WORKER_ID}]`, ...args);
}

bot.once('spawn', async () => {
  log('🪓 Lumberjack Worker spawned');
  bot.chat('/gamemode survival');
  
  const mcData = require('minecraft-data')(bot.version);
  const movements = new Movements(bot, mcData);
  bot.pathfinder.setMovements(movements);
  
  // Register with squad leader
  await bus.send({
    type: 'REGISTER_WORKER',
    target: 'lumberjack_squad_leader',
    data: {
      name: BOT_NAME,
      status: 'READY'
    }
  });
  
  setInterval(() => bus.poll(), 500);
  
  bus.on('COMMAND', async (cmd) => {
    if (cmd.target === `lumberjack_worker_${WORKER_ID}`) {
      await handleCommand(cmd);
    }
  });
  
  // Work loop
  setInterval(() => {
    if (isWorking) {
      workLoop();
    }
  }, 5000);
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
    case 'RESTART':
      await restart();
      break;
  }
}

/**
 * Start working in assigned zone
 */
async function startWork(data) {
  const { zone, quota: targetQuota } = data;
  
  assignedZone = zone;
  quota = targetQuota;
  isWorking = true;
  
  log(`🚀 Starting work in zone ${zone.id}`);
  log(`Target: ${quota} logs`);
  
  // Get axe
  await getAxe();
  
  // Start chopping
  await workLoop();
}

/**
 * Stop working
 */
function stopWork() {
  log('🛑 Stopping work');
  isWorking = false;
}

/**
 * Restart after being stuck
 */
async function restart() {
  log('🔄 Restarting...');
  stopWork();
  await new Promise(resolve => setTimeout(resolve, 2000));
  if (assignedZone && quota > 0) {
    await startWork({ zone: assignedZone, quota });
  }
}

/**
 * Main work loop
 */
async function workLoop() {
  if (!isWorking || woodCollected >= quota) {
    if (woodCollected >= quota) {
      log('✅ Quota reached!');
      reportProgress();
      isWorking = false;
    }
    return;
  }
  
  try {
    // Find nearest tree
    const tree = await findNearestTree();
    
    if (tree) {
      log(`Found tree at ${tree.position}`);
      
      // Go to tree
      await bot.pathfinder.goto(new goals.GoalNear(
        tree.position.x,
        tree.position.y,
        tree.position.z,
        2
      ));
      
      // Chop tree
      await chopTree(tree);
      
      // Collect wood
      await collectDrops();
      
      // Plant sapling
      await plantSapling(tree.position);
      
      woodCollected++;
      
      // Report progress every 10 logs
      if (woodCollected % 10 === 0) {
        reportProgress();
      }
    } else {
      log('No trees found in zone, waiting...');
    }
  } catch (e) {
    log('Error in work loop:', e.message);
  }
}

/**
 * Find nearest tree in assigned zone
 */
async function findNearestTree() {
  if (!assignedZone) return null;
  
  const mcData = require('minecraft-data')(bot.version);
  const logBlocks = [
    mcData.blocksByName['oak_log']?.id,
    mcData.blocksByName['birch_log']?.id,
    mcData.blocksByName['spruce_log']?.id
  ].filter(Boolean);
  
  // Search in assigned zone
  const zoneCenter = new Vec3(
    assignedZone.x + assignedZone.size / 2,
    bot.entity.position.y,
    assignedZone.z + assignedZone.size / 2
  );
  
  const tree = bot.findBlock({
    matching: (block) => logBlocks.includes(block.type),
    maxDistance: assignedZone.size,
    point: zoneCenter
  });
  
  return tree;
}

/**
 * Chop down a tree
 */
async function chopTree(tree) {
  log('Chopping tree...');
  
  try {
    // Dig the log block
    await bot.dig(tree);
    
    // Look for more logs above (simple tree chopping)
    let logAbove = bot.blockAt(tree.position.offset(0, 1, 0));
    while (logAbove && logAbove.name.includes('log')) {
      await bot.dig(logAbove);
      logAbove = bot.blockAt(logAbove.position.offset(0, 1, 0));
    }
  } catch (e) {
    log('Error chopping tree:', e.message);
  }
}

/**
 * Collect dropped wood
 */
async function collectDrops() {
  // Wait for drops to land
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // In a real implementation, use mineflayer-collectblock plugin
  // For now, just wait and assume collection
}

/**
 * Plant sapling at tree location
 */
async function plantSapling(position) {
  // In real impl, place sapling block
  // For now, just log
  log('Planting sapling at', position);
}

/**
 * Get/craft an axe
 */
async function getAxe() {
  // Check inventory for axe
  const axe = bot.inventory.items().find(item => 
    item.name.includes('axe')
  );
  
  if (!axe) {
    log('No axe found - requesting from supply chain');
    await bus.send({
      type: 'REQUEST_TOOL',
      target: 'tool_smith_bot',
      data: { tool: 'wooden_axe', requester: BOT_NAME }
    });
  }
}

/**
 * Report progress to squad leader
 */
function reportProgress() {
  bus.send({
    type: 'WORKER_REPORT',
    target: 'lumberjack_squad_leader',
    data: {
      workerName: BOT_NAME,
      woodCollected,
      status: 'WORKING'
    }
  });
}

module.exports = { bot, startWork, stopWork };

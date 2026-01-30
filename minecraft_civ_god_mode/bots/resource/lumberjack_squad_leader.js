/**
 * LUMBERJACK SQUAD LEADER - Layer 2: Resource Army
 * Manages 10 lumberjack workers for wood collection
 */

require('dotenv').config();
const { createBot } = require('../_common');
const { getCommandBus } = require('../../src/command_bus');
const { pathfinder, Movements, goals } = require('mineflayer-pathfinder');

const BOT_NAME = 'LumberjackLeader';
const bot = createBot(BOT_NAME);
const bus = getCommandBus();

bot.loadPlugin(pathfinder);

// Worker management
const workers = [];
const workZones = [];
let woodQuota = 0;
let woodCollected = 0;

function log(...args) {
  console.log('[LUMBERJACK_LEADER]', ...args);
}

bot.once('spawn', async () => {
  log('🪓 Lumberjack Squad Leader spawned');
  bot.chat('/gamemode survival');
  
  const mcData = require('minecraft-data')(bot.version);
  const movements = new Movements(bot, mcData);
  bot.pathfinder.setMovements(movements);
  
  // Register with orchestrator
  await bus.send({
    type: 'REGISTER_BOT',
    target: 'grand_orchestrator',
    data: {
      name: BOT_NAME,
      type: 'lumberjack_squad_leader',
      layer: 'resource',
      status: 'READY'
    }
  });
  
  setInterval(() => bus.poll(), 500);
  
  bus.on('COMMAND', async (cmd) => {
    if (cmd.target === 'lumberjack_squad_leader') {
      await handleCommand(cmd);
    }
  });
  
  // Monitor workers
  setInterval(() => monitorWorkers(), 2000);
});

async function handleCommand(cmd) {
  const { type, data } = cmd;
  
  switch (type) {
    case 'START_WORK':
      await startLogging(data);
      break;
    case 'STOP_WORK':
      stopLogging();
      break;
    case 'REGISTER_WORKER':
      registerWorker(data);
      break;
    case 'WORKER_REPORT':
      handleWorkerReport(data);
      break;
  }
}

/**
 * Start logging operation
 */
async function startLogging(data) {
  const { zone, quota } = data;
  
  log(`🚀 Starting logging operation in ${zone}`);
  log(`Target quota: ${quota} logs`);
  
  woodQuota = quota;
  woodCollected = 0;
  
  // Divide zone into 10 sections for workers
  const zoneSize = 50; // 50x50 area per worker
  for (let i = 0; i < 10; i++) {
    workZones.push({
      id: i,
      x: i * zoneSize,
      z: 0,
      size: zoneSize,
      assigned: false
    });
  }
  
  // Signal workers to start (if they're registered)
  for (let i = 1; i <= 10; i++) {
    const workerId = `lumberjack_worker_${String(i).padStart(2, '0')}`;
    const zone = workZones[i - 1];
    
    if (zone) {
      await bus.send({
        type: 'START_WORK',
        target: workerId,
        data: {
          zone: zone,
          quota: Math.floor(quota / 10)
        }
      });
      zone.assigned = true;
    }
  }
  
  log('✅ All workers deployed');
}

/**
 * Stop logging operation
 */
function stopLogging() {
  log('🛑 Stopping logging operation');
  
  // Signal all workers to stop
  for (let i = 1; i <= 10; i++) {
    const workerId = `lumberjack_worker_${String(i).padStart(2, '0')}`;
    bus.send({
      type: 'STOP_WORK',
      target: workerId,
      data: {}
    });
  }
}

/**
 * Register a worker bot
 */
function registerWorker(data) {
  const { name, status } = data;
  
  workers.push({
    name,
    status: status || 'IDLE',
    woodCollected: 0,
    lastReport: Date.now()
  });
  
  log(`✅ Worker registered: ${name} (Total: ${workers.length}/10)`);
}

/**
 * Handle worker progress report
 */
function handleWorkerReport(data) {
  const { workerName, woodCollected: workerWood } = data;
  
  const worker = workers.find(w => w.name === workerName);
  if (worker) {
    worker.woodCollected = workerWood;
    worker.lastReport = Date.now();
  }
  
  // Update total
  woodCollected = workers.reduce((sum, w) => sum + w.woodCollected, 0);
  
  // Check if quota reached
  if (woodCollected >= woodQuota) {
    log(`🎉 QUOTA REACHED! Collected ${woodCollected}/${woodQuota} logs`);
    
    // Report to orchestrator
    bus.send({
      type: 'TASK_COMPLETE',
      target: 'grand_orchestrator',
      data: {
        botName: BOT_NAME,
        taskId: 'wood_collection',
        success: true,
        result: { woodCollected }
      }
    });
    
    stopLogging();
  }
}

/**
 * Monitor worker status
 */
function monitorWorkers() {
  const now = Date.now();
  
  for (const worker of workers) {
    // Check for stuck workers (no report in 30 seconds)
    if (now - worker.lastReport > 30000) {
      log(`⚠️ Worker ${worker.name} may be stuck - no report in 30s`);
      
      // Try to restart worker
      bus.send({
        type: 'RESTART',
        target: worker.name,
        data: {}
      });
    }
  }
  
  // Progress report
  if (woodQuota > 0) {
    const progress = ((woodCollected / woodQuota) * 100).toFixed(1);
    log(`Progress: ${woodCollected}/${woodQuota} logs (${progress}%)`);
  }
}

module.exports = { bot, startLogging, registerWorker };

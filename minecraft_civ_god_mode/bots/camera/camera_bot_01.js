/**
 * CAMERA BOT 01 - AERIAL DRONE
 * Specializes in aerial shots, establishing views, and panoramas
 */

require('dotenv').config();
const { createBot } = require('../_common');
const { getCommandBus } = require('../../src/command_bus');
const { Vec3 } = require('vec3');

const CAMERA_ID = '01';
const BOT_NAME = `CameraBot${CAMERA_ID}`;
const SPECIALTY = 'AERIAL';

const bot = createBot(BOT_NAME);
const bus = getCommandBus();

let currentShot = null;
let isFilming = false;

function log(...args) {
  console.log(`[CAMERA_${CAMERA_ID}]`, ...args);
}

bot.once('spawn', () => {
  log(`📹 Aerial Drone Camera spawned (${SPECIALTY})`);
  bot.chat('/gamemode spectator');
  bot.chat('/effect give @s night_vision 999999 1 true');
  
  // Notify director we're ready
  bus.send({
    type: 'CAMERA_READY',
    target: 'cinematic_director',
    data: {
      cameraId: CAMERA_ID,
      specialty: SPECIALTY,
      status: 'READY'
    }
  });
  
  setInterval(() => bus.poll(), 500);
  
  bus.on('COMMAND', async (cmd) => {
    if (cmd.target === `camera_bot_${CAMERA_ID}`) {
      await handleCommand(cmd);
    }
  });
  
  setInterval(() => {
    if (isFilming && currentShot) {
      executeShot();
    }
  }, 100);
});

async function handleCommand(cmd) {
  const { type, data } = cmd;
  
  switch (type) {
    case 'EXECUTE_SHOT':
      await startShot(data);
      break;
    case 'STOP':
      stopShot();
      break;
  }
}

/**
 * Start executing a shot
 */
async function startShot(shotData) {
  log(`🎬 Starting shot: ${shotData.type}`);
  
  currentShot = {
    ...shotData,
    startTime: Date.now(),
    endTime: Date.now() + (shotData.duration * 1000)
  };
  
  isFilming = true;
  
  // Position camera for shot
  if (shotData.position) {
    await bot.entity.position.set(
      shotData.position.x,
      shotData.position.y,
      shotData.position.z
    );
  }
  
  // For aerial shots, fly high
  if (shotData.type === 'AERIAL' || shotData.type === 'ESTABLISHING') {
    const height = shotData.height || 150;
    bot.entity.position.y = height;
  }
}

/**
 * Stop current shot
 */
function stopShot() {
  log('🛑 Stopping shot');
  isFilming = false;
  currentShot = null;
}

/**
 * Execute shot movement (called every tick)
 */
function executeShot() {
  if (!currentShot) return;
  
  const now = Date.now();
  if (now >= currentShot.endTime) {
    log('✅ Shot complete');
    stopShot();
    return;
  }
  
  // Calculate progress (0 to 1)
  const progress = (now - currentShot.startTime) / (currentShot.duration * 1000);
  
  // Apply movement based on shot type
  switch (currentShot.movement) {
    case 'slow_orbit':
      orbitMovement(progress);
      break;
    case '360_panorama':
      panoramaMovement(progress);
      break;
    case 'fixed':
      // No movement, just look at target
      lookAtTarget();
      break;
  }
}

/**
 * Orbit around a point
 */
function orbitMovement(progress) {
  const center = currentShot.lookAt === 'city_center' 
    ? new Vec3(0, 70, 0) 
    : bot.entity.position;
  
  const radius = 100;
  const angle = progress * Math.PI * 2; // Full circle
  
  const x = center.x + Math.cos(angle) * radius;
  const z = center.z + Math.sin(angle) * radius;
  const y = currentShot.position?.y || 150;
  
  bot.entity.position.set(x, y, z);
  
  // Look at center
  try {
    bot.lookAt(center, true);
  } catch (e) {
    // Ignore look errors
  }
}

/**
 * 360 degree panorama
 */
function panoramaMovement(progress) {
  const angle = progress * Math.PI * 2;
  
  // Rotate view while staying in place
  const yaw = angle;
  const pitch = 0;
  
  bot.entity.yaw = yaw;
  bot.entity.pitch = pitch;
}

/**
 * Look at target
 */
function lookAtTarget() {
  if (!currentShot.lookAt) return;
  
  const target = currentShot.lookAt === 'city_center'
    ? new Vec3(0, 70, 0)
    : new Vec3(0, 70, 0);
  
  try {
    bot.lookAt(target, true);
  } catch (e) {
    // Ignore
  }
}

module.exports = { bot, startShot, stopShot };

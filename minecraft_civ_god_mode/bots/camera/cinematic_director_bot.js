/**
 * CINEMATIC DIRECTOR BOT - Camera System Coordinator
 * Plans and coordinates 9 camera bots for cinematic footage
 */

require('dotenv').config();
const { createBot } = require('../_common');
const { getCommandBus } = require('../../src/command_bus');

const BOT_NAME = 'CinematicDirector';
const bot = createBot(BOT_NAME);
const bus = getCommandBus();

// Shot types
const SHOT_TYPES = {
  ESTABLISHING: 'Wide view from far away',
  AERIAL: 'Drone view from above',
  TRACKING: 'Follow bot working',
  TIMELAPSE: 'Fixed position, long recording',
  CLOSE_UP: 'Detail shots of blocks being placed',
  REVEAL: 'Pan to reveal building',
  TRANSITION: 'Smooth transition between scenes',
  POV: 'First-person from bot perspective'
};

// Camera assignments
const CAMERA_BOTS = [
  { id: '01', specialty: 'AERIAL', name: 'Aerial Drone' },
  { id: '02', specialty: 'TRACKING', name: 'Tracking Cam' },
  { id: '03', specialty: 'TIMELAPSE', name: 'Timelapse Cam' },
  { id: '04', specialty: 'CLOSE_UP', name: 'Close-up Specialist' },
  { id: '05', specialty: 'POV', name: 'POV Cam' },
  { id: '06', specialty: 'CRANE', name: 'Crane Cam' },
  { id: '07', specialty: 'DOLLY', name: 'Dolly Cam' },
  { id: '08', specialty: 'STEADICAM', name: 'Steadicam' },
  { id: '09', specialty: 'NIGHT', name: 'Night/Lighting Cam' }
];

let shotList = [];
let currentShot = null;
let isRecording = false;
let recordingStartTime = null;

function log(...args) {
  console.log('[CINEMATIC_DIRECTOR]', ...args);
}

bot.once('spawn', () => {
  log('🎬 Cinematic Director spawned');
  bot.chat('/gamemode spectator');
  bot.chat('/effect give @s night_vision 999999 1 true');
  
  setInterval(() => bus.poll(), 500);
  
  bus.on('COMMAND', async (cmd) => {
    if (cmd.target === 'cinematic_director') {
      await handleCommand(cmd);
    }
  });
  
  // Monitor recording progress
  setInterval(() => monitorRecording(), 1000);
});

async function handleCommand(cmd) {
  const { type, data } = cmd;
  
  switch (type) {
    case 'START_RECORDING':
      await startRecording(data);
      break;
    case 'STOP_RECORDING':
      stopRecording();
      break;
    case 'GENERATE_SHOT_LIST':
      await generateShotList(data);
      break;
    case 'CAMERA_READY':
      handleCameraReady(data);
      break;
  }
}

/**
 * Start recording with auto-generated shot list
 */
async function startRecording(data) {
  log('🎥 Starting cinematic recording');
  
  const { blueprint, duration } = data;
  
  // Generate shot list from blueprint
  shotList = await generateShotList({ blueprint, duration: duration || 300 });
  
  isRecording = true;
  recordingStartTime = Date.now();
  
  // Signal OBS to start recording
  await bus.send({
    type: 'OBS_START_RECORDING',
    target: 'obs_controller',
    data: { session: `build_${Date.now()}` }
  });
  
  // Start executing shots
  await executeShots();
}

/**
 * Stop all recording
 */
function stopRecording() {
  log('🛑 Stopping recording');
  
  isRecording = false;
  currentShot = null;
  
  // Signal OBS to stop
  bus.send({
    type: 'OBS_STOP_RECORDING',
    target: 'obs_controller',
    data: {}
  });
  
  // Stop all cameras
  for (const camera of CAMERA_BOTS) {
    bus.send({
      type: 'STOP',
      target: `camera_bot_${camera.id}`,
      data: {}
    });
  }
}

/**
 * Generate shot list from blueprint
 */
async function generateShotList(data) {
  const { blueprint, duration } = data;
  
  log('📋 Generating shot list...');
  
  const shots = [];
  let timeAllocated = 0;
  
  // Opening establishing shot
  shots.push({
    type: 'ESTABLISHING',
    camera: '01',
    duration: 10,
    position: { x: 100, y: 150, z: 100 },
    lookAt: 'city_center',
    movement: 'slow_orbit',
    priority: 10
  });
  timeAllocated += 10;
  
  // Timelapse of construction (longest shot)
  shots.push({
    type: 'TIMELAPSE',
    camera: '03',
    duration: 60,
    position: { x: 50, y: 100, z: 50 },
    lookAt: 'construction_zone',
    movement: 'fixed',
    priority: 9
  });
  timeAllocated += 60;
  
  // Tracking shots of workers (multiple)
  for (let i = 0; i < 3; i++) {
    shots.push({
      type: 'TRACKING',
      camera: '02',
      duration: 15,
      follow: `worker_bot_${i + 1}`,
      distance: 5,
      angle: 45,
      priority: 8
    });
    timeAllocated += 15;
  }
  
  // Close-up details
  shots.push({
    type: 'CLOSE_UP',
    camera: '04',
    duration: 10,
    focus: 'blocks_being_placed',
    priority: 7
  });
  timeAllocated += 10;
  
  // Aerial sweep
  shots.push({
    type: 'AERIAL',
    camera: '01',
    duration: 20,
    movement: '360_panorama',
    height: 200,
    priority: 9
  });
  timeAllocated += 20;
  
  // Final reveal
  shots.push({
    type: 'REVEAL',
    camera: '06',
    duration: 15,
    movement: 'crane_up',
    startPos: { x: 0, y: 70, z: 0 },
    endPos: { x: 0, y: 150, z: 0 },
    priority: 10
  });
  timeAllocated += 15;
  
  log(`✅ Generated ${shots.length} shots (${timeAllocated}s total)`);
  
  return shots;
}

/**
 * Execute all shots in sequence
 */
async function executeShots() {
  log('🎬 Executing shot sequence');
  
  for (const shot of shotList) {
    if (!isRecording) break;
    
    currentShot = shot;
    log(`📸 Executing shot: ${shot.type} (${shot.duration}s)`);
    
    // Assign camera
    const cameraTarget = `camera_bot_${shot.camera}`;
    
    await bus.send({
      type: 'EXECUTE_SHOT',
      target: cameraTarget,
      data: shot
    });
    
    // Wait for shot duration
    await new Promise(resolve => setTimeout(resolve, shot.duration * 1000));
  }
  
  log('✅ All shots complete');
  stopRecording();
}

/**
 * Handle camera ready notification
 */
function handleCameraReady(data) {
  const { cameraId, status } = data;
  log(`📹 Camera ${cameraId} is ${status}`);
}

/**
 * Monitor recording progress
 */
function monitorRecording() {
  if (!isRecording || !recordingStartTime) return;
  
  const elapsed = ((Date.now() - recordingStartTime) / 1000).toFixed(1);
  const shotInfo = currentShot ? `${currentShot.type}` : 'None';
  
  log(`Recording: ${elapsed}s | Current shot: ${shotInfo}`);
}

/**
 * Create shot for specific build phase
 */
function createPhaseShots(phase) {
  const phaseShots = {
    FOUNDATION: [
      { type: 'AERIAL', camera: '01', duration: 10 },
      { type: 'TIMELAPSE', camera: '03', duration: 30 }
    ],
    WALLS: [
      { type: 'TRACKING', camera: '02', duration: 15 },
      { type: 'CLOSE_UP', camera: '04', duration: 10 }
    ],
    ROOF: [
      { type: 'CRANE', camera: '06', duration: 15 }
    ],
    FINAL: [
      { type: 'AERIAL', camera: '01', duration: 20 },
      { type: 'REVEAL', camera: '06', duration: 15 }
    ]
  };
  
  return phaseShots[phase] || [];
}

module.exports = { bot, generateShotList, startRecording };

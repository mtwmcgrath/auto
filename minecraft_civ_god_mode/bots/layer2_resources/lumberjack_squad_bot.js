require('dotenv').config()
const { createBot, sleep } = require('../_common')
const { getCommandBus } = require('../../src/command_bus')
const { pathfinder, Movements, goals } = require('mineflayer-pathfinder')
const { collectBlock } = require('mineflayer-collectblock')

const BOT_NAME = process.env.MC_BOT_LUMBERJACK_SQUAD_USERNAME || 'LumberjackSquadBot'
const bot = createBot(BOT_NAME)
const bus = getCommandBus()

bot.loadPlugin(pathfinder)
bot.loadPlugin(collectBlock)

let mcData, movements
let workers = []
let loggingActive = false
let targetLogs = 0
let collectedLogs = 0

function log(...a) { console.log('[LUMBERJACK_SQUAD]', ...a) }

// Register worker bot
function registerWorker(workerId) {
  workers.push({
    id: workerId,
    status: 'idle',
    area: null,
    logsCollected: 0
  })
  log('Registered worker:', workerId, '- Total workers:', workers.length)
}

// Assign logging areas to workers
function assignAreas(centerX, centerZ, radius) {
  log('Assigning logging areas to', workers.length, 'workers')
  
  const workersCount = workers.length
  if (workersCount === 0) {
    log('No workers available!')
    return
  }
  
  // Divide area into sectors
  const sectorSize = Math.floor(radius / Math.sqrt(workersCount))
  
  workers.forEach((worker, idx) => {
    const angle = (idx / workersCount) * 2 * Math.PI
    const areaX = centerX + Math.cos(angle) * (radius / 2)
    const areaZ = centerZ + Math.sin(angle) * (radius / 2)
    
    worker.area = {
      x: Math.floor(areaX),
      z: Math.floor(areaZ),
      radius: sectorSize
    }
    
    log(`Worker ${worker.id} assigned to area: (${worker.area.x}, ${worker.area.z}) r=${worker.area.radius}`)
  })
}

// Start logging operation
async function startLogging(target, replant = true) {
  log('Starting logging operation')
  log('Target:', target, 'logs')
  log('Replanting:', replant)
  
  loggingActive = true
  targetLogs = target
  collectedLogs = 0
  
  // Get bot position as center
  const pos = bot.entity.position
  assignAreas(Math.floor(pos.x), Math.floor(pos.z), 50)
  
  // Send commands to workers via command bus
  workers.forEach((worker, idx) => {
    setTimeout(() => {
      const cmd = {
        action: 'START_CHOPPING',
        workerId: worker.id,
        area: worker.area,
        replant: replant,
        target: Math.floor(target / workers.length)
      }
      // Would write to worker-specific command bus
      log('Assigned chopping task to worker:', worker.id)
    }, idx * 500)
  })
  
  log('All workers dispatched')
}

// Monitor progress
function monitorProgress() {
  if (!loggingActive) return
  
  const totalCollected = workers.reduce((sum, w) => sum + w.logsCollected, 0)
  collectedLogs = totalCollected
  
  const progress = Math.floor((collectedLogs / targetLogs) * 100)
  log(`Progress: ${collectedLogs}/${targetLogs} logs (${progress}%)`)
  
  if (collectedLogs >= targetLogs) {
    log('TARGET REACHED! Logging operation complete.')
    loggingActive = false
  }
}

// Update worker status
function updateWorkerStatus(workerId, status, logsCollected) {
  const worker = workers.find(w => w.id === workerId)
  if (worker) {
    worker.status = status
    worker.logsCollected = logsCollected || worker.logsCollected
  }
}

// Coordinate replanting
async function coordinateReplanting() {
  log('Coordinating replanting phase...')
  
  workers.forEach(worker => {
    if (worker.area) {
      // Send replant command
      log('Sending replant command to:', worker.id)
    }
  })
}

bot.once('spawn', async () => {
  mcData = require('minecraft-data')(bot.version)
  movements = new Movements(bot, mcData)
  bot.pathfinder.setMovements(movements)
  
  log('Lumberjack Squad Leader spawned')
  log('Waiting for workers to register...')
  
  setInterval(() => bus.poll(), 400)
  
  bus.on('COMMAND', async (cmd) => {
    try {
      const action = String(cmd.action || '').toUpperCase()
      
      if (action === 'REGISTER_WORKER') {
        registerWorker(cmd.workerId)
        
      } else if (action === 'START_LOGGING') {
        await startLogging(cmd.target || 1000, cmd.replant !== false)
        
      } else if (action === 'UPDATE_WORKER') {
        updateWorkerStatus(cmd.workerId, cmd.status, cmd.logsCollected)
        
      } else if (action === 'STATUS') {
        log('Status Report:')
        log('- Workers:', workers.length)
        log('- Active:', loggingActive)
        log('- Progress:', collectedLogs, '/', targetLogs)
        
      } else if (action === 'PING') {
        log('pong')
      }
    } catch (e) {
      log('ERROR:', e?.message || e)
    }
  })
  
  // Monitor loop
  setInterval(() => {
    if (loggingActive) {
      monitorProgress()
    }
  }, 5000)
  
  log('Lumberjack Squad ready!')
})

bot.on('kicked', (r) => log('kicked:', r))
bot.on('error', (e) => log('error:', e?.message || e))

require('dotenv').config()
const { createBot, sleep } = require('../_common')
const { getCommandBus } = require('../../src/command_bus')
const { pathfinder, Movements, goals } = require('mineflayer-pathfinder')
const { collectBlock } = require('mineflayer-collectblock')

// Worker ID from process arguments or environment
const WORKER_ID = process.argv[2] || process.env.WORKER_ID || 'Worker1'
const BOT_NAME = `LumberjackWorker_${WORKER_ID}`

const bot = createBot(BOT_NAME)
const bus = getCommandBus()

bot.loadPlugin(pathfinder)
bot.loadPlugin(collectBlock)

let mcData, movements
let assignedArea = null
let logsCollected = 0
let isWorking = false

function log(...a) { console.log(`[LUMBERJACK_${WORKER_ID}]`, ...a) }

// Find logs in area
function findLogsinArea(area) {
  if (!area) return []
  
  const logSuffixes = ['_log']
  const ids = Object.values(mcData.blocksByName)
    .filter(b => logSuffixes.some(suffix => b.name.endsWith(suffix)))
    .map(b => b.id)
  
  const positions = bot.findBlocks({
    matching: (b) => b && ids.includes(b.type),
    maxDistance: area.radius || 20,
    count: 20
  })
  
  return positions.map(p => bot.blockAt(p)).filter(Boolean)
}

// Chop tree
async function chopTree(logBlock) {
  try {
    // Equip axe
    const axes = ['netherite_axe', 'diamond_axe', 'iron_axe', 'stone_axe', 'wooden_axe']
    for (const axe of axes) {
      const item = bot.inventory.items().find(i => i.name === axe)
      if (item) {
        await bot.equip(item, 'hand')
        break
      }
    }
    
    // Collect the log block
    await bot.collectBlock.collect([logBlock])
    logsCollected++
    
    return true
  } catch (err) {
    log('Error chopping:', err.message)
    return false
  }
}

// Replant sapling
async function replantSapling(x, y, z) {
  try {
    const saplings = ['oak_sapling', 'birch_sapling', 'spruce_sapling']
    let sapling = null
    
    for (const saplingName of saplings) {
      sapling = bot.inventory.items().find(i => i.name === saplingName)
      if (sapling) break
    }
    
    if (!sapling) {
      log('No saplings available for replanting')
      return false
    }
    
    // Navigate to position
    await bot.pathfinder.goto(new goals.GoalNear(x, y, z, 2))
    
    // Find ground block
    const { Vec3 } = require('vec3')
    const groundBlock = bot.blockAt(new Vec3(x, y - 1, z))
    
    if (groundBlock) {
      await bot.equip(sapling, 'hand')
      await bot.placeBlock(groundBlock, new Vec3(0, 1, 0))
      log('Replanted sapling at', x, y, z)
      return true
    }
  } catch (err) {
    log('Error replanting:', err.message)
  }
  return false
}

// Main chopping loop
async function startChopping(area, target, replant = true) {
  log('Starting work in area:', area)
  log('Target:', target, 'logs')
  
  assignedArea = area
  isWorking = true
  
  while (isWorking && logsCollected < target) {
    const logs = findLogsinArea(area)
    
    if (logs.length === 0) {
      log('No logs found in area. Waiting...')
      await sleep(5000)
      continue
    }
    
    log('Found', logs.length, 'logs. Chopping...')
    
    for (const logBlock of logs) {
      if (!isWorking || logsCollected >= target) break
      
      const success = await chopTree(logBlock)
      
      if (success && replant) {
        // Replant at the log position
        await replantSapling(logBlock.position.x, logBlock.position.y, logBlock.position.z)
      }
      
      await sleep(100)
    }
    
    // Report progress to squad leader
    log('Progress:', logsCollected, '/', target)
    
    await sleep(2000)
  }
  
  isWorking = false
  log('Work complete! Total logs collected:', logsCollected)
}

bot.once('spawn', async () => {
  mcData = require('minecraft-data')(bot.version)
  movements = new Movements(bot, mcData)
  bot.pathfinder.setMovements(movements)
  
  log('Lumberjack Worker spawned')
  
  // Register with squad leader
  log('Registering with squad leader...')
  // Would send registration command to squad leader
  
  setInterval(() => bus.poll(), 400)
  
  bus.on('COMMAND', async (cmd) => {
    try {
      const action = String(cmd.action || '').toUpperCase()
      
      if (action === 'START_CHOPPING' && cmd.workerId === WORKER_ID) {
        await startChopping(cmd.area, cmd.target || 100, cmd.replant !== false)
        
      } else if (action === 'STOP') {
        log('Stopping work...')
        isWorking = false
        
      } else if (action === 'STATUS') {
        log('Status: Working:', isWorking, 'Logs:', logsCollected)
        
      } else if (action === 'PING') {
        log('pong')
      }
    } catch (e) {
      log('ERROR:', e?.message || e)
    }
  })
  
  log('Ready to work!')
})

bot.on('kicked', (r) => log('kicked:', r))
bot.on('error', (e) => log('error:', e?.message || e))

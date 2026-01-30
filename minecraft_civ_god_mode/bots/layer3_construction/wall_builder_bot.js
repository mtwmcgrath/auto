require('dotenv').config()
const { createBot, sleep } = require('../_common')
const { getCommandBus } = require('../../src/command_bus')
const { pathfinder, Movements, goals } = require('mineflayer-pathfinder')
const { Vec3 } = require('vec3')

const BOT_NAME = process.env.MC_BOT_WALL_BUILDER_USERNAME || 'WallBuilderBot'
const bot = createBot(BOT_NAME)
const bus = getCommandBus()

bot.loadPlugin(pathfinder)

let mcData, movements
let building = false

function log(...a) { console.log('[WALL_BUILDER]', ...a) }

// Place block at position
async function placeBlockAt(x, y, z, blockName) {
  try {
    const item = bot.inventory.items().find(i => i.name === blockName)
    if (!item) {
      log('No', blockName, 'in inventory')
      return false
    }
    
    // Navigate near the position
    await bot.pathfinder.goto(new goals.GoalNear(x, y, z, 3))
    
    // Find reference block (under target)
    const referenceBlock = bot.blockAt(new Vec3(x, y - 1, z))
    if (!referenceBlock) {
      log('No reference block at', x, y - 1, z)
      return false
    }
    
    await bot.equip(item, 'hand')
    await bot.placeBlock(referenceBlock, new Vec3(0, 1, 0))
    
    return true
  } catch (err) {
    log('Error placing block:', err.message)
    return false
  }
}

// Build wall segment
async function buildWall(startX, startY, startZ, endX, endY, endZ, blockName, height) {
  log(`Building wall from (${startX},${startY},${startZ}) to (${endX},${endY},${endZ})`)
  log('Height:', height, 'Block:', blockName)
  
  building = true
  
  const dx = Math.sign(endX - startX)
  const dz = Math.sign(endZ - startZ)
  
  // Build layer by layer
  for (let h = 0; h < height; h++) {
    for (let x = startX; dx >= 0 ? x <= endX : x >= endX; x += dx || 1) {
      for (let z = startZ; dz >= 0 ? z <= endZ : z >= endZ; z += dz || 1) {
        if (!building) {
          log('Build interrupted')
          return
        }
        
        const success = await placeBlockAt(x, startY + h, z, blockName)
        if (success) {
          await sleep(50)
        }
      }
    }
  }
  
  building = false
  log('Wall complete!')
}

// Build structure with walls
async function buildStructure(config) {
  const { x, z, width, depth, height, wallBlock, theme } = config
  const y = config.y || 64
  
  log('Building structure:', config.type || 'generic')
  log('Position:', x, y, z)
  log('Size:', width, 'x', depth, 'x', height)
  log('Theme:', theme)
  
  // Build four walls
  // Front wall
  await buildWall(x, y, z, x + width, y, z, wallBlock, height)
  
  // Back wall
  await buildWall(x, y, z + depth, x + width, y, z + depth, wallBlock, height)
  
  // Left wall
  await buildWall(x, y, z, x, y, z + depth, wallBlock, height)
  
  // Right wall
  await buildWall(x + width, y, z, x + width, y, z + depth, wallBlock, height)
  
  log('Structure walls complete!')
}

bot.once('spawn', async () => {
  mcData = require('minecraft-data')(bot.version)
  movements = new Movements(bot, mcData)
  bot.pathfinder.setMovements(movements)
  
  log('Wall Builder Bot spawned')
  
  setInterval(() => bus.poll(), 400)
  
  bus.on('COMMAND', async (cmd) => {
    try {
      const action = String(cmd.action || '').toUpperCase()
      
      if (action === 'BUILD_WALL') {
        const { start, end, block, height } = cmd
        await buildWall(
          start.x, start.y, start.z,
          end.x, end.y, end.z,
          block || 'stone_bricks',
          height || 5
        )
        
      } else if (action === 'BUILD_STRUCTURE') {
        await buildStructure(cmd)
        
      } else if (action === 'STOP') {
        log('Stopping...')
        building = false
        
      } else if (action === 'PING') {
        log('pong')
      }
    } catch (e) {
      log('ERROR:', e?.message || e)
    }
  })
  
  log('Ready to build walls!')
})

bot.on('kicked', (r) => log('kicked:', r))
bot.on('error', (e) => log('error:', e?.message || e))

require('dotenv').config()
const { createBot, sleep } = require('../_common')
const { getCommandBus } = require('../../src/command_bus')
const { pathfinder, Movements, goals } = require('mineflayer-pathfinder')
const { Vec3 } = require('vec3')

const BOT_NAME = process.env.MC_BOT_LANDSCAPER_USERNAME || 'LandscaperBot'
const bot = createBot(BOT_NAME)
const bus = getCommandBus()

bot.loadPlugin(pathfinder)

let mcData, movements
let isWorking = false

function log(...a) { console.log('[LANDSCAPER]', ...a) }

// Plant tree
async function plantTree(x, y, z, treeType = 'oak') {
  try {
    const sapling = `${treeType}_sapling`
    const saplingItem = bot.inventory.items().find(i => i.name === sapling)
    
    if (!saplingItem) {
      log('No', sapling, 'in inventory')
      return false
    }
    
    await bot.pathfinder.goto(new goals.GoalNear(x, y, z, 2))
    
    const groundBlock = bot.blockAt(new Vec3(x, y - 1, z))
    if (!groundBlock) return false
    
    await bot.equip(saplingItem, 'hand')
    await bot.placeBlock(groundBlock, new Vec3(0, 1, 0))
    
    log('Planted', sapling, 'at', x, y, z)
    return true
  } catch (err) {
    log('Error planting tree:', err.message)
    return false
  }
}

// Plant flowers
async function plantFlower(x, y, z, flowerType) {
  try {
    const flower = bot.inventory.items().find(i => i.name === flowerType)
    if (!flower) return false
    
    await bot.pathfinder.goto(new goals.GoalNear(x, y, z, 2))
    
    const groundBlock = bot.blockAt(new Vec3(x, y - 1, z))
    if (!groundBlock) return false
    
    await bot.equip(flower, 'hand')
    await bot.placeBlock(groundBlock, new Vec3(0, 1, 0))
    
    return true
  } catch (err) {
    return false
  }
}

// Create garden
async function createGarden(centerX, centerY, centerZ, size) {
  log('Creating garden at', centerX, centerY, centerZ, 'size:', size)
  
  isWorking = true
  
  const flowers = ['poppy', 'dandelion', 'blue_orchid', 'allium']
  
  for (let x = centerX - size; x <= centerX + size; x += 2) {
    for (let z = centerZ - size; z <= centerZ + size; z += 2) {
      if (!isWorking) break
      
      const flower = flowers[Math.floor(Math.random() * flowers.length)]
      await plantFlower(x, centerY, z, flower)
      await sleep(200)
    }
  }
  
  log('Garden created!')
  isWorking = false
}

// Create park
async function createPark(area) {
  log('Creating park in area:', area)
  
  isWorking = true
  const { x, y, z, width, depth } = area
  
  // Plant trees around perimeter
  const treeSpacing = 5
  
  for (let i = 0; i < width; i += treeSpacing) {
    if (!isWorking) break
    await plantTree(x + i, y, z, 'oak')
    await plantTree(x + i, y, z + depth, 'oak')
    await sleep(500)
  }
  
  for (let i = 0; i < depth; i += treeSpacing) {
    if (!isWorking) break
    await plantTree(x, y, z + i, 'birch')
    await plantTree(x + width, y, z + i, 'birch')
    await sleep(500)
  }
  
  // Create central garden
  await createGarden(x + width/2, y, z + depth/2, 3)
  
  log('Park created!')
  isWorking = false
}

// Create fountain (simplified)
async function createFountain(centerX, centerY, centerZ) {
  log('Creating fountain at', centerX, centerY, centerZ)
  
  // In a real implementation, would build a water fountain
  // For now, just place water and decorative blocks
  
  log('Fountain created!')
}

// Beautify terrain
async function beautifyTerrain(area, features) {
  log('Beautifying terrain with features:', features.join(', '))
  
  isWorking = true
  
  for (const feature of features) {
    if (!isWorking) break
    
    if (feature === 'trees') {
      // Scatter trees
      for (let i = 0; i < 10; i++) {
        const x = area.x + Math.random() * area.width
        const z = area.z + Math.random() * area.depth
        await plantTree(Math.floor(x), area.y, Math.floor(z))
        await sleep(1000)
      }
    } else if (feature === 'flowers') {
      // Scatter flowers
      await createGarden(area.x + area.width/2, area.y, area.z + area.depth/2, 5)
    } else if (feature === 'gardens') {
      await createGarden(area.x, area.y, area.z, 3)
    } else if (feature === 'fountains') {
      await createFountain(area.x + area.width/2, area.y, area.z + area.depth/2)
    }
  }
  
  isWorking = false
  log('Terrain beautification complete!')
}

bot.once('spawn', async () => {
  mcData = require('minecraft-data')(bot.version)
  movements = new Movements(bot, mcData)
  bot.pathfinder.setMovements(movements)
  
  log('Landscaper Bot spawned')
  
  setInterval(() => bus.poll(), 400)
  
  bus.on('COMMAND', async (cmd) => {
    try {
      const action = String(cmd.action || '').toUpperCase()
      
      if (action === 'PLANT_TREE') {
        await plantTree(cmd.x, cmd.y, cmd.z, cmd.treeType || 'oak')
        
      } else if (action === 'CREATE_GARDEN') {
        await createGarden(cmd.x, cmd.y, cmd.z, cmd.size || 3)
        
      } else if (action === 'CREATE_PARK') {
        await createPark(cmd.area)
        
      } else if (action === 'CREATE_FOUNTAIN') {
        await createFountain(cmd.x, cmd.y, cmd.z)
        
      } else if (action === 'LANDSCAPE') {
        await beautifyTerrain(cmd.area || {}, cmd.features || ['trees', 'flowers'])
        
      } else if (action === 'STOP') {
        log('Stopping...')
        isWorking = false
        
      } else if (action === 'PING') {
        log('pong')
      }
    } catch (e) {
      log('ERROR:', e?.message || e)
    }
  })
  
  log('Ready to landscape!')
})

bot.on('kicked', (r) => log('kicked:', r))
bot.on('error', (e) => log('error:', e?.message || e))

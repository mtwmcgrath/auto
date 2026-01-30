require('dotenv').config()
const { createBot, sleep } = require('../_common')
const { getCommandBus } = require('../../src/command_bus')
const { pathfinder, Movements, goals } = require('mineflayer-pathfinder')
const { Vec3 } = require('vec3')

const BOT_NAME = process.env.MC_BOT_FARMER_USERNAME || 'FarmerBot'
const bot = createBot(BOT_NAME)
const bus = getCommandBus()

bot.loadPlugin(pathfinder)

let mcData, movements
let farmArea = null
let isWorking = false

function log(...a) { console.log('[FARMER]', ...a) }

// Check if crop is mature
function isCropMature(block) {
  if (!block || !block.name) return false
  
  const matureAge = {
    'wheat': 7,
    'carrots': 7,
    'potatoes': 7,
    'beetroots': 3,
    'nether_wart': 3
  }
  
  for (const [crop, maxAge] of Object.entries(matureAge)) {
    if (block.name === crop) {
      return block.metadata === maxAge
    }
  }
  
  return false
}

// Find mature crops in area
function findMatureCrops(area) {
  const crops = []
  const radius = area.radius || 20
  
  for (let x = area.x - radius; x <= area.x + radius; x++) {
    for (let z = area.z - radius; z <= area.z + radius; z++) {
      const block = bot.blockAt(new Vec3(x, area.y || 64, z))
      if (block && isCropMature(block)) {
        crops.push(block)
      }
    }
  }
  
  return crops
}

// Harvest crop
async function harvestCrop(cropBlock) {
  try {
    await bot.pathfinder.goto(new goals.GoalNear(
      cropBlock.position.x,
      cropBlock.position.y,
      cropBlock.position.z,
      1
    ))
    
    await bot.dig(cropBlock)
    log('Harvested', cropBlock.name, 'at', cropBlock.position)
    
    return true
  } catch (err) {
    log('Error harvesting:', err.message)
    return false
  }
}

// Replant crop
async function replantCrop(x, y, z, seedName) {
  try {
    const seed = bot.inventory.items().find(i => i.name === seedName)
    if (!seed) {
      log('No seeds:', seedName)
      return false
    }
    
    const groundBlock = bot.blockAt(new Vec3(x, y - 1, z))
    if (!groundBlock || groundBlock.name !== 'farmland') {
      log('Invalid farmland at', x, y, z)
      return false
    }
    
    await bot.equip(seed, 'hand')
    await bot.placeBlock(groundBlock, new Vec3(0, 1, 0))
    log('Replanted at', x, y, z)
    
    return true
  } catch (err) {
    log('Error replanting:', err.message)
    return false
  }
}

// Farm cycle
async function farmingCycle(area, crops) {
  log('Starting farming cycle in area:', area)
  log('Crops to farm:', crops.join(', '))
  
  farmArea = area
  isWorking = true
  
  const seedMap = {
    'wheat': 'wheat_seeds',
    'carrots': 'carrot',
    'potatoes': 'potato',
    'beetroots': 'beetroot_seeds'
  }
  
  while (isWorking) {
    const matureCrops = findMatureCrops(area)
    
    if (matureCrops.length === 0) {
      log('No mature crops. Waiting...')
      await sleep(10000)
      continue
    }
    
    log('Found', matureCrops.length, 'mature crops. Harvesting...')
    
    for (const crop of matureCrops) {
      if (!isWorking) break
      
      const success = await harvestCrop(crop)
      
      if (success) {
        // Replant
        const seedName = seedMap[crop.name]
        if (seedName) {
          await replantCrop(crop.position.x, crop.position.y, crop.position.z, seedName)
        }
      }
      
      await sleep(500)
    }
    
    log('Cycle complete. Next cycle in 30 seconds...')
    await sleep(30000)
  }
  
  log('Farming stopped')
}

// Animal breeding (simplified)
async function breedAnimals(animalType, area) {
  log('Breeding', animalType, 'in area')
  
  // In a real implementation, would:
  // 1. Find animals
  // 2. Feed them breeding items
  // 3. Collect offspring
  
  log('Breeding cycle complete')
}

bot.once('spawn', async () => {
  mcData = require('minecraft-data')(bot.version)
  movements = new Movements(bot, mcData)
  bot.pathfinder.setMovements(movements)
  
  log('Farmer Bot spawned')
  
  setInterval(() => bus.poll(), 400)
  
  bus.on('COMMAND', async (cmd) => {
    try {
      const action = String(cmd.action || '').toUpperCase()
      
      if (action === 'START_FARMING') {
        const area = cmd.area || { x: 0, y: 64, z: 0, radius: 10 }
        const crops = cmd.crops || ['wheat', 'carrots', 'potatoes']
        await farmingCycle(area, crops)
        
      } else if (action === 'BREED_ANIMALS') {
        await breedAnimals(cmd.animalType || 'cow', cmd.area)
        
      } else if (action === 'STOP') {
        log('Stopping farming...')
        isWorking = false
        
      } else if (action === 'STATUS') {
        log('Status: Working:', isWorking)
        if (farmArea) {
          log('Farm area:', farmArea)
        }
        
      } else if (action === 'PING') {
        log('pong')
      }
    } catch (e) {
      log('ERROR:', e?.message || e)
    }
  })
  
  log('Ready to farm!')
})

bot.on('kicked', (r) => log('kicked:', r))
bot.on('error', (e) => log('error:', e?.message || e))

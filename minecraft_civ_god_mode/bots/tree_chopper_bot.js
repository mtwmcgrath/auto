/**
 * Tree Chopper Bot - Bot chặt cây tự động cho 9woke
 * Tự động tìm và chặt cây, thu thập gỗ, trồng lại cây
 */

require('dotenv').config()
const { createBot, sleep } = require('./_common')
const { pathfinder, Movements, goals } = require('mineflayer-pathfinder')
const { collectBlock } = require('mineflayer-collectblock')
const { Vec3 } = require('vec3')
const { findNearestTree, chopTreeComplete } = require('../src/building_utils')

const BOT_NAME = process.env.MC_BOT_TREECHOP_USERNAME || '9woke_treechop'

const bot = createBot(BOT_NAME)
bot.loadPlugin(pathfinder)
bot.loadPlugin(collectBlock)

let mcData
let movements
let stats = {
  treesChopped: 0,
  woodCollected: 0,
  saplingsPlanted: 0,
  axesCrafted: 0
}

function log(...args) {
  console.log('[TREECHOP]', ...args)
}

bot.once('spawn', async () => {
  mcData = require('minecraft-data')(bot.version)
  movements = new Movements(bot, mcData)
  bot.pathfinder.setMovements(movements)
  
  log('TreeChopper bot spawned as', BOT_NAME)
  log('Sẵn sàng chặt cây tự động!')
  
  // Chế độ survival
  bot.chat('/gamemode survival')
  
  // Bắt đầu loop chặt cây
  startTreeChoppingLoop()
})

/**
 * Trang bị rìu tốt nhất có sẵn
 */
async function equipBestAxe() {
  const axes = [
    'netherite_axe',
    'diamond_axe', 
    'iron_axe',
    'stone_axe',
    'wooden_axe'
  ]
  
  for (const axeName of axes) {
    const axe = bot.inventory.items().find(item => item.name === axeName)
    if (axe) {
      await bot.equip(axe, 'hand')
      log('Equipped', axeName)
      return true
    }
  }
  
  log('No axe found, trying to craft...')
  return await craftAxe()
}

/**
 * Craft rìu mới nếu cần
 */
async function craftAxe() {
  // Thử craft rìu gỗ đơn giản nhất
  const planks = bot.inventory.items().find(item => item.name.includes('planks'))
  const sticks = bot.inventory.items().find(item => item.name === 'stick')
  
  if (!planks || planks.count < 3) {
    log('Not enough planks to craft axe')
    return false
  }
  
  if (!sticks || sticks.count < 2) {
    // Craft sticks from planks
    try {
      const plankItem = bot.inventory.items().find(item => item.name.includes('planks'))
      if (plankItem && plankItem.count >= 2) {
        await bot.craft(mcData.itemsByName.stick, 1)
        log('Crafted sticks')
      }
    } catch (err) {
      log('Failed to craft sticks:', err.message)
      return false
    }
  }
  
  // Craft wooden axe
  try {
    const woodenAxe = mcData.itemsByName.wooden_axe
    if (woodenAxe) {
      await bot.craft(woodenAxe, 1)
      log('Crafted wooden axe!')
      stats.axesCrafted++
      return true
    }
  } catch (err) {
    log('Failed to craft axe:', err.message)
  }
  
  return false
}

/**
 * Tìm và chặt cây gần nhất
 */
async function findAndChopNearestTree() {
  const range = 50
  const tree = findNearestTree(bot, range)
  
  if (!tree) {
    log('No trees found within', range, 'blocks')
    return false
  }
  
  log('Found tree at', tree.position.toString())
  
  // Di chuyển đến cây
  try {
    await bot.pathfinder.goto(new goals.GoalNear(tree.position.x, tree.position.y, tree.position.z, 2))
  } catch (err) {
    log('Failed to navigate to tree:', err.message)
    return false
  }
  
  // Trang bị rìu
  await equipBestAxe()
  
  // Chặt cây
  const woodCount = await chopTreeComplete(bot, tree)
  
  if (woodCount > 0) {
    log(`Chopped tree! Collected ${woodCount} wood blocks`)
    stats.treesChopped++
    stats.woodCollected += woodCount
    
    // Thử trồng lại cây
    await replantTree(tree.position)
  }
  
  return woodCount > 0
}

/**
 * Trồng lại cây tại vị trí
 */
async function replantTree(position) {
  // Tìm sapling trong inventory
  const sapling = bot.inventory.items().find(item => item.name.endsWith('_sapling'))
  
  if (!sapling) {
    log('No sapling to replant')
    return false
  }
  
  try {
    // Di chuyển đến vị trí gốc cây cũ
    await bot.pathfinder.goto(new goals.GoalNear(position.x, position.y, position.z, 2))
    
    // Tìm block đất/grass để trồng
    const groundBlock = bot.blockAt(position)
    if (groundBlock && (groundBlock.name === 'grass_block' || groundBlock.name === 'dirt')) {
      await bot.equip(sapling, 'hand')
      await bot.placeBlock(groundBlock, new Vec3(0, 1, 0))
      log('Replanted tree at', position.toString())
      stats.saplingsPlanted++
      return true
    }
  } catch (err) {
    log('Failed to replant tree:', err.message)
  }
  
  return false
}

/**
 * Quản lý inventory - craft planks từ logs
 */
async function manageInventory() {
  const logs = bot.inventory.items().filter(item => item.name.endsWith('_log'))
  
  if (logs.length > 0 && logs[0].count > 10) {
    log('Converting logs to planks...')
    try {
      // Craft planks
      const logItem = logs[0]
      const plankType = logItem.name.replace('_log', '_planks')
      const plankRecipe = mcData.itemsByName[plankType]
      
      if (plankRecipe) {
        await bot.craft(plankRecipe, Math.min(5, Math.floor(logItem.count / 1)))
        log('Crafted planks')
      }
    } catch (err) {
      log('Failed to craft planks:', err.message)
    }
  }
}

/**
 * In thống kê
 */
function printStats() {
  log('=== Tree Chopping Stats ===')
  log('Trees chopped:', stats.treesChopped)
  log('Wood collected:', stats.woodCollected)
  log('Saplings planted:', stats.saplingsPlanted)
  log('Axes crafted:', stats.axesCrafted)
  log('===========================')
}

/**
 * Loop chính - chặt cây liên tục
 */
async function startTreeChoppingLoop() {
  log('Starting tree chopping loop...')
  
  while (true) {
    try {
      // Tìm và chặt cây
      const success = await findAndChopNearestTree()
      
      if (success) {
        // Quản lý inventory sau khi chặt
        await manageInventory()
        
        // In stats mỗi 5 cây
        if (stats.treesChopped % 5 === 0) {
          printStats()
        }
      }
      
      // Delay giữa các lần chặt
      await sleep(2000)
      
    } catch (err) {
      log('Error in tree chopping loop:', err.message)
      await sleep(5000)
    }
  }
}

// Xử lý lỗi
bot.on('kicked', (reason) => {
  log('Bot kicked:', reason)
  printStats()
})

bot.on('error', (err) => {
  log('Bot error:', err.message || err)
})

// In stats khi thoát
process.on('SIGINT', () => {
  log('Shutting down...')
  printStats()
  process.exit(0)
})

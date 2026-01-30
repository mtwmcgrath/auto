/**
 * Resource Manager Bot - Quản lý tài nguyên cho 9woke
 * Theo dõi inventory, tính toán tài nguyên cần thiết, quản lý storage
 */

require('dotenv').config()
const { createBot, sleep } = require('./_common')
const { getCommandBus } = require('../src/command_bus')
const { pathfinder, Movements, goals } = require('mineflayer-pathfinder')
const { Vec3 } = require('vec3')
const { calculateBuildingMaterials } = require('../src/building_utils')

const BOT_NAME = process.env.MC_BOT_RESOURCE_USERNAME || '9woke_resource'

const bot = createBot(BOT_NAME)
const bus = getCommandBus()

bot.loadPlugin(pathfinder)

let mcData
let movements
let resourceState = {
  currentPhase: 'gathering', // gathering, building, crafting
  requiredMaterials: {},
  currentInventory: {},
  storedMaterials: {},
  chestLocations: []
}

function log(...args) {
  console.log('[RESOURCE_MGR]', ...args)
}

bot.once('spawn', async () => {
  mcData = require('minecraft-data')(bot.version)
  movements = new Movements(bot, mcData)
  bot.pathfinder.setMovements(movements)
  
  log('Resource Manager bot spawned as', BOT_NAME)
  log('Sẵn sàng quản lý tài nguyên!')
  
  bot.chat('/gamemode survival')
  
  // Poll command bus
  setInterval(() => bus.poll(), 500)
  
  bus.on('COMMAND', async (cmd) => {
    try {
      await handleCommand(cmd)
    } catch (err) {
      log('Command error:', err.message)
    }
  })
  
  // Cập nhật inventory định kỳ
  setInterval(() => {
    updateInventory()
  }, 5000)
  
  // In báo cáo tài nguyên định kỳ
  setInterval(() => {
    printResourceReport()
  }, 30000)
})

/**
 * Cập nhật inventory hiện tại
 */
function updateInventory() {
  const inventory = {}
  
  for (const item of bot.inventory.items()) {
    inventory[item.name] = (inventory[item.name] || 0) + item.count
  }
  
  resourceState.currentInventory = inventory
}

/**
 * Tính toán tài nguyên cần thiết cho một dự án
 */
function calculateRequiredMaterials(blueprint) {
  if (!blueprint) return {}
  
  const materials = calculateBuildingMaterials(blueprint)
  log('Required materials for blueprint:', materials)
  
  return materials
}

/**
 * Kiểm tra xem có đủ tài nguyên không
 */
function hasEnoughMaterials(requiredMaterials) {
  updateInventory()
  
  for (const [material, required] of Object.entries(requiredMaterials)) {
    const current = resourceState.currentInventory[material] || 0
    const stored = resourceState.storedMaterials[material] || 0
    const total = current + stored
    
    if (total < required) {
      log(`Not enough ${material}: need ${required}, have ${total}`)
      return false
    }
  }
  
  return true
}

/**
 * Phân bổ nhiệm vụ dựa trên tài nguyên hiện tại
 */
function decidePriority() {
  updateInventory()
  
  const woodCount = Object.entries(resourceState.currentInventory)
    .filter(([name]) => name.endsWith('_log') || name.endsWith('_planks'))
    .reduce((sum, [, count]) => sum + count, 0)
  
  const stoneCount = Object.entries(resourceState.currentInventory)
    .filter(([name]) => name.includes('stone') || name.includes('cobblestone'))
    .reduce((sum, [, count]) => sum + count, 0)
  
  // Quyết định ưu tiên
  if (woodCount < 100) {
    return { priority: 'chop_trees', reason: 'Low wood supply' }
  } else if (stoneCount < 200) {
    return { priority: 'mine_stone', reason: 'Low stone supply' }
  } else if (hasEnoughMaterials(resourceState.requiredMaterials)) {
    return { priority: 'build', reason: 'Enough materials for building' }
  } else {
    return { priority: 'gather', reason: 'General resource gathering' }
  }
}

/**
 * Tìm chest gần nhất
 */
function findNearestChest() {
  const chestBlock = bot.findBlock({
    matching: (block) => block && (block.name === 'chest' || block.name === 'trapped_chest'),
    maxDistance: 32
  })
  
  return chestBlock
}

/**
 * Lưu trữ vật phẩm vào chest
 */
async function storeItemsInChest(itemNames = []) {
  const chest = findNearestChest()
  
  if (!chest) {
    log('No chest found nearby')
    return false
  }
  
  try {
    // Di chuyển đến chest
    await bot.pathfinder.goto(new goals.GoalNear(chest.position.x, chest.position.y, chest.position.z, 2))
    
    // Mở chest
    const chestWindow = await bot.openChest(chest)
    
    // Chuyển items vào chest
    for (const itemName of itemNames) {
      const items = bot.inventory.items().filter(item => item.name === itemName)
      for (const item of items) {
        await chestWindow.deposit(item.type, null, item.count)
        log(`Stored ${item.count} ${itemName} in chest`)
        
        // Cập nhật stored materials
        resourceState.storedMaterials[itemName] = 
          (resourceState.storedMaterials[itemName] || 0) + item.count
      }
    }
    
    chestWindow.close()
    return true
    
  } catch (err) {
    log('Error storing items:', err.message)
    return false
  }
}

/**
 * Lấy vật phẩm từ chest
 */
async function retrieveItemsFromChest(itemName, count) {
  const chest = findNearestChest()
  
  if (!chest) {
    log('No chest found nearby')
    return false
  }
  
  try {
    await bot.pathfinder.goto(new goals.GoalNear(chest.position.x, chest.position.y, chest.position.z, 2))
    
    const chestWindow = await bot.openChest(chest)
    
    // Tìm item trong chest
    const items = chestWindow.containerItems().filter(item => item && item.name === itemName)
    let retrieved = 0
    
    for (const item of items) {
      if (retrieved >= count) break
      
      const takeCount = Math.min(item.count, count - retrieved)
      await chestWindow.withdraw(item.type, null, takeCount)
      retrieved += takeCount
      
      log(`Retrieved ${takeCount} ${itemName} from chest`)
    }
    
    chestWindow.close()
    
    // Cập nhật stored materials
    resourceState.storedMaterials[itemName] = 
      Math.max(0, (resourceState.storedMaterials[itemName] || 0) - retrieved)
    
    return retrieved > 0
    
  } catch (err) {
    log('Error retrieving items:', err.message)
    return false
  }
}

/**
 * Auto-craft vật liệu cơ bản
 */
async function autoCraftMaterials() {
  updateInventory()
  
  // Craft planks từ logs
  const logs = bot.inventory.items().filter(item => item.name.endsWith('_log'))
  if (logs.length > 0) {
    try {
      const logItem = logs[0]
      const plankType = logItem.name.replace('_log', '_planks')
      const plankRecipe = mcData.itemsByName[plankType]
      
      if (plankRecipe && logItem.count > 5) {
        await bot.craft(plankRecipe, Math.min(10, Math.floor(logItem.count)))
        log('Auto-crafted planks')
      }
    } catch (err) {
      log('Failed to auto-craft planks:', err.message)
    }
  }
  
  // Craft sticks từ planks
  const planks = bot.inventory.items().filter(item => item.name.endsWith('_planks'))
  if (planks.length > 0) {
    try {
      const sticks = bot.inventory.items().find(item => item.name === 'stick')
      if (!sticks || sticks.count < 16) {
        await bot.craft(mcData.itemsByName.stick, 5)
        log('Auto-crafted sticks')
      }
    } catch (err) {
      log('Failed to auto-craft sticks:', err.message)
    }
  }
}

/**
 * In báo cáo tài nguyên
 */
function printResourceReport() {
  log('=== Resource Report ===')
  log('Current Phase:', resourceState.currentPhase)
  
  const priority = decidePriority()
  log('Priority:', priority.priority, '-', priority.reason)
  
  log('Inventory Summary:')
  const topItems = Object.entries(resourceState.currentInventory)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
  
  for (const [item, count] of topItems) {
    log(`  ${item}: ${count}`)
  }
  
  log('======================')
}

/**
 * Xử lý command từ command bus
 */
async function handleCommand(cmd) {
  const action = String(cmd.action || cmd.type || '').toUpperCase()
  const p = cmd.params || cmd
  
  if (action === 'PING') {
    log('pong')
    return
  }
  
  if (action === 'SET_PHASE') {
    resourceState.currentPhase = p.phase
    log('Phase set to:', p.phase)
    return
  }
  
  if (action === 'SET_REQUIRED') {
    resourceState.requiredMaterials = p.materials || {}
    log('Required materials set:', resourceState.requiredMaterials)
    return
  }
  
  if (action === 'STORE_ITEMS') {
    await storeItemsInChest(p.items || [])
    return
  }
  
  if (action === 'RETRIEVE_ITEMS') {
    await retrieveItemsFromChest(p.item, p.count || 64)
    return
  }
  
  if (action === 'AUTO_CRAFT') {
    await autoCraftMaterials()
    return
  }
  
  if (action === 'REPORT') {
    printResourceReport()
    return
  }
  
  log('Unknown action:', action)
}

// Error handlers
bot.on('kicked', (reason) => {
  log('Bot kicked:', reason)
})

bot.on('error', (err) => {
  log('Bot error:', err.message || err)
})

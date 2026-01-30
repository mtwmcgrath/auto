/**
 * City Builder Bot - Bot xây dựng thành phố tự động cho 9woke
 * Xây dựng theo blueprint phong cách MrBeast Minecraft
 */

require('dotenv').config()
const { createBot, sleep } = require('./_common')
const { getCommandBus } = require('../src/command_bus')
const { pathfinder, Movements, goals } = require('mineflayer-pathfinder')
const { Vec3 } = require('vec3')
const { 
  placeBlockPattern, 
  calculateBuildingMaterials, 
  createBuildingBlueprint 
} = require('../src/building_utils')

const BOT_NAME = process.env.MC_BOT_CITYBUILDER_USERNAME || '9woke_builder'

const bot = createBot(BOT_NAME)
const bus = getCommandBus()

bot.loadPlugin(pathfinder)

let mcData
let movements
let cityState = {
  currentProject: null,
  buildingQueue: [],
  completedBuildings: [],
  totalBlocksPlaced: 0,
  currentPhase: 'planning'
}

function log(...args) {
  console.log('[CITY_BUILDER]', ...args)
}

bot.once('spawn', async () => {
  mcData = require('minecraft-data')(bot.version)
  movements = new Movements(bot, mcData)
  bot.pathfinder.setMovements(movements)
  
  log('City Builder bot spawned as', BOT_NAME)
  log('Sẵn sàng xây dựng thành phố phong cách MrBeast!')
  
  bot.chat('/gamemode creative') // Có thể thay đổi sang survival sau
  
  // Poll command bus
  setInterval(() => bus.poll(), 500)
  
  bus.on('COMMAND', async (cmd) => {
    try {
      await handleCommand(cmd)
    } catch (err) {
      log('Command error:', err.message)
    }
  })
})

/**
 * Tạo blueprint cho toàn bộ thành phố
 */
function createCityBlueprint(startPos, citySize = '50x50') {
  const [width, depth] = citySize.split('x').map(Number)
  
  const cityPlan = {
    name: '9woke City - MrBeast Style',
    startPosition: startPos,
    size: { width, depth },
    buildings: [],
    roads: [],
    plaza: null
  }
  
  // Quảng trường trung tâm
  const plazaPos = new Vec3(
    startPos.x + Math.floor(width / 2) - 10,
    startPos.y,
    startPos.z + Math.floor(depth / 2) - 10
  )
  cityPlan.plaza = {
    position: plazaPos,
    blueprint: createBuildingBlueprint('plaza', { width: 20, depth: 20, height: 1 }, 'stone_bricks')
  }
  
  // Đường phố - grid system
  for (let x = 0; x < width; x += 15) {
    cityPlan.roads.push({
      position: new Vec3(startPos.x + x, startPos.y, startPos.z),
      blueprint: createBuildingBlueprint('road', { width: 5, depth: depth, height: 1 }, 'stone')
    })
  }
  
  for (let z = 0; z < depth; z += 15) {
    cityPlan.roads.push({
      position: new Vec3(startPos.x, startPos.y, startPos.z + z),
      blueprint: createBuildingBlueprint('road', { width: width, depth: 5, height: 1 }, 'stone')
    })
  }
  
  // Nhà ở - residential area
  const housePositions = [
    [10, 10], [25, 10], [40, 10],
    [10, 25], [40, 25],
    [10, 40], [25, 40], [40, 40]
  ]
  
  for (const [dx, dz] of housePositions) {
    cityPlan.buildings.push({
      type: 'house',
      position: new Vec3(startPos.x + dx, startPos.y, startPos.z + dz),
      blueprint: createBuildingBlueprint('house', { width: 8, depth: 8, height: 5 }, 'oak_planks')
    })
  }
  
  // Trang trại
  cityPlan.buildings.push({
    type: 'farm',
    position: new Vec3(startPos.x + 5, startPos.y, startPos.z + 5),
    blueprint: createBuildingBlueprint('farm', { width: 10, depth: 10, height: 1 }, 'farmland')
  })
  
  // Cửa hàng
  const shopPositions = [[15, 30], [35, 30]]
  for (const [dx, dz] of shopPositions) {
    cityPlan.buildings.push({
      type: 'shop',
      position: new Vec3(startPos.x + dx, startPos.y, startPos.z + dz),
      blueprint: createBuildingBlueprint('shop', { width: 6, depth: 6, height: 4 }, 'brick')
    })
  }
  
  // Skyscraper (tòa nhà cao tầng)
  cityPlan.buildings.push({
    type: 'skyscraper',
    position: new Vec3(startPos.x + 60, startPos.y, startPos.z + 25),
    blueprint: createBuildingBlueprint('skyscraper', { width: 12, depth: 12, height: 40 }, 'stone_bricks')
  })
  
  log('City blueprint created with', cityPlan.buildings.length, 'buildings')
  
  return cityPlan
}

/**
 * Xây dựng một building từ blueprint
 */
async function buildStructure(position, blueprint) {
  if (!blueprint || !blueprint.pattern) {
    log('Invalid blueprint')
    return false
  }
  
  log(`Building ${blueprint.type} at ${position.toString()}`)
  log(`Total blocks to place: ${blueprint.blockCount}`)
  
  const progressCallback = (current, total) => {
    if (current % 50 === 0) {
      log(`Progress: ${current}/${total} blocks (${Math.floor(current/total*100)}%)`)
    }
  }
  
  const blocksPlaced = await placeBlockPattern(bot, blueprint.pattern, position, progressCallback)
  
  cityState.totalBlocksPlaced += blocksPlaced
  log(`Completed! Placed ${blocksPlaced} blocks`)
  
  return blocksPlaced > 0
}

/**
 * Xây dựng toàn bộ thành phố
 */
async function buildCity(cityPlan) {
  log('Starting city construction...')
  cityState.currentPhase = 'construction'
  
  // Phase 1: Xây đường
  log('Phase 1: Building roads...')
  for (const road of cityPlan.roads) {
    await buildStructure(road.position, road.blueprint)
    await sleep(1000)
  }
  
  // Phase 2: Xây quảng trường
  log('Phase 2: Building central plaza...')
  if (cityPlan.plaza) {
    await buildStructure(cityPlan.plaza.position, cityPlan.plaza.blueprint)
    await sleep(1000)
  }
  
  // Phase 3: Xây nhà ở và buildings
  log('Phase 3: Building structures...')
  for (const building of cityPlan.buildings) {
    await buildStructure(building.position, building.blueprint)
    cityState.completedBuildings.push(building)
    await sleep(2000)
    
    // In tiến độ
    log(`Completed: ${cityState.completedBuildings.length}/${cityPlan.buildings.length} buildings`)
  }
  
  cityState.currentPhase = 'completed'
  log('City construction completed!')
  printCityStats()
}

/**
 * Xây dựng từng khu vực (incremental)
 */
async function buildArea(areaType, position, size = {}) {
  log(`Building ${areaType} area at ${position.toString()}`)
  
  let blueprint
  switch (areaType) {
    case 'residential':
      // Xây nhiều nhà
      const houses = []
      for (let i = 0; i < 4; i++) {
        const housePos = position.offset(i * 10, 0, 0)
        houses.push({
          position: housePos,
          blueprint: createBuildingBlueprint('house', size, 'oak_planks')
        })
      }
      
      for (const house of houses) {
        await buildStructure(house.position, house.blueprint)
        await sleep(1000)
      }
      break
      
    case 'commercial':
      // Xây cửa hàng
      const shops = []
      for (let i = 0; i < 3; i++) {
        const shopPos = position.offset(i * 8, 0, 0)
        shops.push({
          position: shopPos,
          blueprint: createBuildingBlueprint('shop', size, 'brick')
        })
      }
      
      for (const shop of shops) {
        await buildStructure(shop.position, shop.blueprint)
        await sleep(1000)
      }
      break
      
    case 'plaza':
      blueprint = createBuildingBlueprint('plaza', size, 'stone_bricks')
      await buildStructure(position, blueprint)
      break
      
    case 'farm':
      blueprint = createBuildingBlueprint('farm', size, 'farmland')
      await buildStructure(position, blueprint)
      break
      
    default:
      log('Unknown area type:', areaType)
  }
}

/**
 * In thống kê xây dựng
 */
function printCityStats() {
  log('=== City Building Stats ===')
  log('Current Phase:', cityState.currentPhase)
  log('Total Blocks Placed:', cityState.totalBlocksPlaced)
  log('Completed Buildings:', cityState.completedBuildings.length)
  log('Buildings in Queue:', cityState.buildingQueue.length)
  log('===========================')
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
  
  if (action === 'BUILD_CITY') {
    const startPos = new Vec3(
      Number(p.x || bot.entity.position.x),
      Number(p.y || bot.entity.position.y),
      Number(p.z || bot.entity.position.z)
    )
    const cityPlan = createCityBlueprint(startPos, p.size || '50x50')
    cityState.currentProject = cityPlan
    await buildCity(cityPlan)
    return
  }
  
  if (action === 'BUILD_AREA') {
    const pos = new Vec3(Number(p.x), Number(p.y), Number(p.z))
    const size = p.size || { width: 10, depth: 10, height: 5 }
    await buildArea(p.areaType, pos, size)
    return
  }
  
  if (action === 'BUILD_STRUCTURE') {
    const pos = new Vec3(Number(p.x), Number(p.y), Number(p.z))
    const blueprint = createBuildingBlueprint(
      p.structureType || 'house',
      p.size || { width: 7, depth: 7, height: 4 },
      p.material || 'oak_planks'
    )
    await buildStructure(pos, blueprint)
    return
  }
  
  if (action === 'STATS') {
    printCityStats()
    return
  }
  
  log('Unknown action:', action)
}

// Error handlers
bot.on('kicked', (reason) => {
  log('Bot kicked:', reason)
  printCityStats()
})

bot.on('error', (err) => {
  log('Bot error:', err.message || err)
})

process.on('SIGINT', () => {
  log('Shutting down...')
  printCityStats()
  process.exit(0)
})

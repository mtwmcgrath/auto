require('dotenv').config()
const { createBot, sleep } = require('./_common')
const { getCommandBus } = require('../src/command_bus')

const { pathfinder, Movements, goals } = require('mineflayer-pathfinder')
const { collectBlock } = require('mineflayer-collectblock')
const { Vec3 } = require('vec3')
const { 
  findNearestTree, 
  chopTreeComplete,
  createBuildingBlueprint,
  placeBlockPattern,
  calculateBuildingMaterials
} = require('../src/building_utils')

const CIV_NAME = process.env.MC_BOT_CIV_USERNAME || '9woke'

const bot = createBot(CIV_NAME)
const bus = getCommandBus()

bot.loadPlugin(pathfinder)
bot.loadPlugin(collectBlock)

let mcData
let movements

// State machine cho Master Builder Bot
let masterState = {
  phase: 'idle', // idle, resource_gathering, foundation, construction, expansion, complete
  currentTask: null,
  stats: {
    treesChopped: 0,
    woodCollected: 0,
    buildingsCompleted: 0,
    blocksPlaced: 0
  },
  cityPlan: null,
  autoMode: false
}

function log(...a){ console.log('[9WOKE]', ...a) }

bot.once('spawn', async () => {
  mcData = require('minecraft-data')(bot.version)
  movements = new Movements(bot, mcData)
  bot.pathfinder.setMovements(movements)

  log('spawned on', process.env.MC_HOST, process.env.MC_PORT, 'as', CIV_NAME)
  log('type /op', CIV_NAME, 'if you want it to run /give (optional)')
  log('✨ Master Builder Bot with City Building & Tree Chopping enabled!')

  // Optional: set survival (won't hurt if no perms)
  bot.chat('/gamemode survival')

  // poll command bus
  setInterval(() => bus.poll(), 400)

  bus.on('COMMAND', async (cmd) => {
    try {
      await handle(cmd)
    } catch (e) {
      log('ERROR:', e?.message || e)
    }
  })
  
  // State machine loop nếu ở auto mode
  setInterval(async () => {
    if (masterState.autoMode) {
      await runStateMachine()
    }
  }, 5000)
})

async function gotoNear(x, y, z, range=1){
  await bot.pathfinder.goto(new goals.GoalNear(x, y, z, range))
}

async function equipBest(toolNames){
  for (const name of toolNames) {
    const it = bot.inventory.items().find(i => i.name === name)
    if (it) { await bot.equip(it, 'hand'); return true }
  }
  return false
}

function findBlocksBySuffix(suffix, radius=18, count=12){
  const ids = Object.values(mcData.blocksByName)
    .filter(b => b.name.endsWith(suffix))
    .map(b => b.id)

  const positions = bot.findBlocks({
    matching: (b) => b && ids.includes(b.type),
    maxDistance: radius,
    count
  })

  return positions.map(p => bot.blockAt(p)).filter(Boolean)
}

async function chopTreeCluster(radius=18, count=10){
  await equipBest(['netherite_axe','diamond_axe','iron_axe','stone_axe','wooden_axe'])
  const logs = findBlocksBySuffix('_log', radius, count)
  if (!logs.length) { log('no logs found nearby'); return }
  log('chopping logs:', logs.length)
  await bot.collectBlock.collect(logs)
}

async function ensureHave(blockName, minCount){
  const have = bot.inventory.items().filter(i => i.name === blockName).reduce((a,i)=>a+i.count,0)
  if (have >= minCount) return true
  log('missing', blockName, 'need', minCount, 'have', have)
  return false
}

async function placeAt(x, y, z, blockName){
  const item = bot.inventory.items().find(i => i.name === blockName)
  if (!item) throw new Error('no item: ' + blockName)

  // go near target
  await gotoNear(x, y, z, 2)

  // find a reference block (under target)
  const under = bot.blockAt(new Vec3(x, y-1, z))
  if (!under) throw new Error('no under-block at ' + [x,y-1,z].join(','))

  await bot.equip(item, 'hand')
  // place on top of under
  await bot.placeBlock(under, new Vec3(0, 1, 0))
}

async function buildSimpleHouse(x, y, z){
  const block = 'oak_planks'
  if (!await ensureHave(block, 256)) {
    // if no planks, try to craft quickly (optional) - keep simple
    log('tip: let DirectorBot /give 9woke oak_planks 512')
  }

  const W=7, D=7, H=4
  log('building house at', x,y,z)
  // floor
  for (let dx=0; dx<W; dx++){
    for (let dz=0; dz<D; dz++){
      await placeAt(x+dx, y, z+dz, block)
      await sleep(50)
    }
  }
  // walls
  for (let dy=1; dy<=H; dy++){
    for (let dx=0; dx<W; dx++){
      await placeAt(x+dx, y+dy, z, block); await sleep(40)
      await placeAt(x+dx, y+dy, z+D-1, block); await sleep(40)
    }
    for (let dz=0; dz<D; dz++){
      await placeAt(x, y+dy, z+dz, block); await sleep(40)
      await placeAt(x+W-1, y+dy, z+dz, block); await sleep(40)
    }
  }
  log('house done')
}

async function handle(cmd){
  const action = String(cmd.action || cmd.type || '').toUpperCase()
  const p = cmd.params || cmd

  if (action === 'PING') { log('pong'); return }

  if (action === 'MOVE'){
    await gotoNear(Number(p.x), Number(p.y), Number(p.z), Number(p.range||1))
    return
  }

  if (action === 'CHOP' || action === 'CHOP_TREE_CLUSTER'){
    await chopTreeCluster(Number(p.radius||18), Number(p.count||10))
    return
  }

  if (action === 'BUILD' || action === 'BUILD_HOUSE'){
    await buildSimpleHouse(Number(p.x), Number(p.y), Number(p.z))
    return
  }

  if (action === 'CHAT'){
    const msg = p.message || p.text || ''
    if (msg) bot.chat(msg)
    return
  }
  
  // === Các command mới cho Master Builder Bot ===
  
  if (action === 'START_AUTO_BUILD') {
    log('Starting automated city building project!')
    masterState.autoMode = true
    masterState.phase = 'resource_gathering'
    return
  }
  
  if (action === 'STOP_AUTO_BUILD') {
    log('Stopping automated building')
    masterState.autoMode = false
    printMasterStats()
    return
  }
  
  if (action === 'SET_PHASE') {
    masterState.phase = p.phase || 'idle'
    log('Phase set to:', masterState.phase)
    return
  }
  
  if (action === 'CHOP_TREE_ADVANCED') {
    await advancedTreeChopping(p.count || 10)
    return
  }
  
  if (action === 'BUILD_CITY') {
    const startPos = new Vec3(
      Number(p.x || bot.entity.position.x + 10),
      Number(p.y || bot.entity.position.y),
      Number(p.z || bot.entity.position.z + 10)
    )
    await buildCityProject(startPos, p.size || '50x50')
    return
  }
  
  if (action === 'STATS') {
    printMasterStats()
    return
  }

  log('unknown action:', action, p)
}

/**
 * State machine cho automated city building
 */
async function runStateMachine() {
  try {
    switch (masterState.phase) {
      case 'resource_gathering':
        await phaseResourceGathering()
        break
        
      case 'foundation':
        await phaseFoundation()
        break
        
      case 'construction':
        await phaseConstruction()
        break
        
      case 'expansion':
        await phaseExpansion()
        break
        
      case 'complete':
        log('City building project complete!')
        masterState.autoMode = false
        printMasterStats()
        break
        
      default:
        // idle - do nothing
        break
    }
  } catch (err) {
    log('State machine error:', err.message)
  }
}

/**
 * Phase 1: Resource Gathering
 */
async function phaseResourceGathering() {
  if (masterState.currentTask !== 'gathering') {
    log('=== PHASE 1: Resource Gathering ===')
    masterState.currentTask = 'gathering'
  }
  
  // Kiểm tra tài nguyên
  const woodCount = bot.inventory.items()
    .filter(i => i.name.endsWith('_log') || i.name.endsWith('_planks'))
    .reduce((sum, i) => sum + i.count, 0)
  
  if (woodCount < 200) {
    log(`Need more wood: ${woodCount}/200`)
    await advancedTreeChopping(5)
  } else {
    log('Phase 1 complete! Moving to Foundation phase')
    masterState.phase = 'foundation'
    masterState.currentTask = null
  }
}

/**
 * Phase 2: Foundation
 */
async function phaseFoundation() {
  if (masterState.currentTask !== 'foundation') {
    log('=== PHASE 2: Foundation ===')
    masterState.currentTask = 'foundation'
  }
  
  // Thiết lập base camp đơn giản
  const basePos = bot.entity.position.floored()
  
  log('Setting up base camp at', basePos.toString())
  // Xây một ngôi nhà nhỏ làm base
  await buildSimpleHouse(basePos.x + 5, basePos.y, basePos.z + 5)
  
  log('Phase 2 complete! Moving to Construction phase')
  masterState.phase = 'construction'
  masterState.currentTask = null
}

/**
 * Phase 3: Construction
 */
async function phaseConstruction() {
  if (masterState.currentTask !== 'construction') {
    log('=== PHASE 3: Construction ===')
    masterState.currentTask = 'construction'
  }
  
  // Xây thêm buildings
  const startPos = bot.entity.position.floored().offset(20, 0, 0)
  
  log('Building additional structures...')
  await buildSimpleHouse(startPos.x, startPos.y, startPos.z)
  masterState.stats.buildingsCompleted++
  
  // Sau khi xây 3 nhà, chuyển phase
  if (masterState.stats.buildingsCompleted >= 3) {
    log('Phase 3 complete! Moving to Expansion phase')
    masterState.phase = 'expansion'
    masterState.currentTask = null
  }
}

/**
 * Phase 4: Expansion
 */
async function phaseExpansion() {
  if (masterState.currentTask !== 'expansion') {
    log('=== PHASE 4: Expansion & Decoration ===')
    masterState.currentTask = 'expansion'
  }
  
  log('Adding decorations and final touches...')
  
  // Xây thêm cây xung quanh (nếu có sapling)
  const sapling = bot.inventory.items().find(i => i.name.endsWith('_sapling'))
  if (sapling) {
    log('Planting decorative trees')
  }
  
  log('Phase 4 complete! Project finished!')
  masterState.phase = 'complete'
  masterState.currentTask = null
}

/**
 * Advanced tree chopping với logging
 */
async function advancedTreeChopping(targetCount = 10) {
  log('Starting advanced tree chopping, target:', targetCount)
  
  for (let i = 0; i < targetCount; i++) {
    const tree = findNearestTree(bot, 50)
    
    if (!tree) {
      log('No more trees found')
      break
    }
    
    // Di chuyển đến cây
    try {
      await bot.pathfinder.goto(new goals.GoalNear(tree.position.x, tree.position.y, tree.position.z, 2))
      await equipBest(['netherite_axe','diamond_axe','iron_axe','stone_axe','wooden_axe'])
      
      const woodCount = await chopTreeComplete(bot, tree)
      
      if (woodCount > 0) {
        masterState.stats.treesChopped++
        masterState.stats.woodCollected += woodCount
        log(`Tree ${i+1}/${targetCount} chopped: ${woodCount} wood`)
      }
      
      await sleep(1000)
    } catch (err) {
      log('Error chopping tree:', err.message)
    }
  }
  
  log('Tree chopping complete!')
}

/**
 * Build city project
 */
async function buildCityProject(startPos, size = '50x50') {
  log('Starting city building project at', startPos.toString())
  log('City size:', size)
  
  const [width, depth] = size.split('x').map(Number)
  
  // Xây một grid của nhà đơn giản
  const houseSpacing = 12
  const housesPerRow = Math.floor(width / houseSpacing)
  
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < housesPerRow; col++) {
      const houseX = startPos.x + (col * houseSpacing)
      const houseZ = startPos.z + (row * houseSpacing)
      
      log(`Building house ${row * housesPerRow + col + 1}`)
      await buildSimpleHouse(houseX, startPos.y, houseZ)
      masterState.stats.buildingsCompleted++
      
      await sleep(2000)
    }
  }
  
  log('City project complete!')
}

/**
 * In thống kê tổng hợp
 */
function printMasterStats() {
  log('=== Master Builder Stats ===')
  log('Current Phase:', masterState.phase)
  log('Current Task:', masterState.currentTask || 'none')
  log('Trees Chopped:', masterState.stats.treesChopped)
  log('Wood Collected:', masterState.stats.woodCollected)
  log('Buildings Completed:', masterState.stats.buildingsCompleted)
  log('Blocks Placed:', masterState.stats.blocksPlaced)
  log('Auto Mode:', masterState.autoMode ? 'ON' : 'OFF')
  log('===========================')
}

bot.on('kicked', (r)=>log('kicked:', r))
bot.on('error', (e)=>log('error:', e?.message||e))

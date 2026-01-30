require('dotenv').config()
const { createBot, sleep } = require('./_common')
const { getCommandBus } = require('../src/command_bus')

const { pathfinder, Movements, goals } = require('mineflayer-pathfinder')
const { collectBlock } = require('mineflayer-collectblock')
const { Vec3 } = require('vec3')

const CIV_NAME = process.env.MC_BOT_CIV_USERNAME || '9woke'

const bot = createBot(CIV_NAME)
const bus = getCommandBus()

bot.loadPlugin(pathfinder)
bot.loadPlugin(collectBlock)

let mcData
let movements

function log(...a){ console.log('[9WOKE]', ...a) }

bot.once('spawn', async () => {
  mcData = require('minecraft-data')(bot.version)
  movements = new Movements(bot, mcData)
  bot.pathfinder.setMovements(movements)

  log('spawned on', process.env.MC_HOST, process.env.MC_PORT, 'as', CIV_NAME)
  log('type /op', CIV_NAME, 'if you want it to run /give (optional)')

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

  log('unknown action:', action, p)
}

bot.on('kicked', (r)=>log('kicked:', r))
bot.on('error', (e)=>log('error:', e?.message||e))

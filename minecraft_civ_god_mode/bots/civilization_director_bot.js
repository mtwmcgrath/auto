// bots/civilization_director_bot.js
const fs = require('fs')
const path = require('path')
const { createBot } = require('./_common')
const log = require('../src/logger')
const { OBSController } = require('../src/obs')
const { MarkerWriter } = require('../src/markers')
const { paths } = require('../src/config')
const { enqueueCommand } = require('../src/command_bus')

const STORY_FILE = process.env.STORY_FILE || '9woke_story.json'
const DIRECTOR_NAME = process.env.MC_BOT_DIRECTOR_USERNAME || 'DirectorBot'
const CIV_NAME = process.env.MC_BOT_CIV_USERNAME || '9woke'
const CAM_NAME = process.env.MC_BOT_CAM_USERNAME || 'CameraBot'

const CMD_DELAY_MS = Number(process.env.DIRECTOR_CMD_DELAY_MS || 1500)

function sleep(ms){ return new Promise(r=>setTimeout(r,ms)) }

function loadStory(){
  const p = path.join(paths.eventsDir, STORY_FILE)
  const raw = fs.readFileSync(p, 'utf-8')
  const json = JSON.parse(raw)
  const events = Array.isArray(json) ? json : (json.events || [])
  return { name: json.name || 'story', events }
}

// Anti-spam: send server commands safely
function makeCommander(bot){
  let q = Promise.resolve()
  return (cmd) => {
    q = q.then(async () => {
      bot.chat(cmd)
      await sleep(CMD_DELAY_MS)
    })
    return q
  }
}

async function buildCity(cmd, x,y,z){
  // nền + đường + 3 nhà + quảng trường nhỏ
  cmd(`/fill ${x-18} ${y-1} ${z-18} ${x+18} ${y-1} ${z+18} grass_block`)
  cmd(`/fill ${x-18} ${y} ${z} ${x+18} ${y} ${z} stone_bricks`)       // road X
  cmd(`/fill ${x} ${y} ${z-18} ${x} ${y} ${z+18} stone_bricks`)       // road Z
  cmd(`/fill ${x-4} ${y} ${z-4} ${x+4} ${y} ${z+4} polished_andesite`) // plaza

  // house 1
  cmd(`/fill ${x+6} ${y} ${z+6} ${x+12} ${y+4} ${z+12} oak_planks`)
  cmd(`/fill ${x+7} ${y+1} ${z+7} ${x+11} ${y+3} ${z+11} air`)
  cmd(`/setblock ${x+9} ${y+1} ${z+6} oak_door`)
  // house 2
  cmd(`/fill ${x-12} ${y} ${z+6} ${x-6} ${y+4} ${z+12} spruce_planks`)
  cmd(`/fill ${x-11} ${y+1} ${z+7} ${x-7} ${y+3} ${z+11} air`)
  cmd(`/setblock ${x-9} ${y+1} ${z+6} spruce_door`)
  // house 3
  cmd(`/fill ${x+6} ${y} ${z-12} ${x+12} ${y+4} ${z-6} birch_planks`)
  cmd(`/fill ${x+7} ${y+1} ${z-11} ${x+11} ${y+3} ${z-7} air`)
  cmd(`/setblock ${x+9} ${y+1} ${z-12} birch_door`)

  // lights
  cmd(`/setblock ${x+2} ${y+1} ${z+2} lantern`)
  cmd(`/setblock ${x-2} ${y+1} ${z+2} lantern`)
  cmd(`/setblock ${x+2} ${y+1} ${z-2} lantern`)
  cmd(`/setblock ${x-2} ${y+1} ${z-2} lantern`)
}

async function spawnNPC(cmd, x,y,z){
  cmd(`/summon villager ${x+2} ${y+1} ${z+2}`)
  cmd(`/summon villager ${x-2} ${y+1} ${z+2}`)
  cmd(`/summon villager ${x+2} ${y+1} ${z-2}`)
  cmd(`/summon iron_golem ${x} ${y+1} ${z+6}`)
}

async function startWar(cmd, x,y,z){
  // phe A: golem
  cmd(`/summon iron_golem ${x-10} ${y+1} ${z}`)
  cmd(`/summon iron_golem ${x-12} ${y+1} ${z+2}`)
  // phe B: pillager + vindicator
  cmd(`/summon pillager ${x+14} ${y+1} ${z}`)
  cmd(`/summon pillager ${x+16} ${y+1} ${z+2}`)
  cmd(`/summon vindicator ${x+18} ${y+1} ${z-1}`)
}

async function run(){
  const story = loadStory()
  log.ok('🎬 Director story loaded:', STORY_FILE, 'events=', story.events.length)

  const bot = createBot(DIRECTOR_NAME)
  const cmd = makeCommander(bot)
  const obs = new OBSController()

  const sessionId = `session_${Date.now()}`
  const markers = new MarkerWriter(sessionId)
  let recording = false

  bot.on('kicked', (r) => console.log('❌ Director kicked:', r))
  bot.on('error', (e) => console.log('❌ Director error:', e?.message || e))
  bot.on('end', () => console.log('⚠️ Director disconnected'))

  await new Promise(res => bot.once('spawn', res))
  log.ok('✅ DirectorBot spawned')

  // setup
  cmd('/gamerule sendCommandFeedback false')
  cmd('/gamemode creative')
  cmd('/effect give @s night_vision 999999 1 true')

  // (OPTIONAL) ép 9woke “tự chạy như phim” bằng spectate camera bot
  // Nếu server của bạn hỗ trợ /spectate <target> <player>:
  cmd(`/gamemode spectator ${CIV_NAME}`)
  cmd(`/spectate ${CAM_NAME} ${CIV_NAME}`)

  // chạy theo event
  for (const evt of story.events){
    const x = Number(evt?.actions?.find(a=>a.type==='MOVE')?.x ?? 0)
    const y = Number(evt?.actions?.find(a=>a.type==='MOVE')?.y ?? 70)
    const z = Number(evt?.actions?.find(a=>a.type==='MOVE')?.z ?? 0)

    console.log('\n' + '='.repeat(70))
    log.tag(`TURN ${evt.turn ?? '?'} / YEAR ${evt.year ?? '?'}`, `${evt.type} (${evt.category || 'UNKNOWN'})`)
    console.log('🗣️ VO:', evt.vo || '')

    if (!recording){
      await obs.startRecord()
      recording = true
      markers.mark('REC_START', { turn: evt.turn, type: evt.type })
    }

    markers.mark(evt.type || 'EVENT', { turn: evt.turn, year: evt.year, category: evt.category })

    // camera theo category
    if ((evt.category || '').toUpperCase() === 'BUILD'){
      cmd(`!cam orbit ${x} ${y} ${z} 16 7 10`)
    } else if ((evt.category || '').toUpperCase() === 'WAR'){
      cmd(`!cam follow ${CIV_NAME} 10 4 12`)
    } else {
      cmd(`!cam orbit ${x} ${y} ${z} 14 6 8`)
    }

    // chạy actions
    for (const a of (evt.actions || [])){
      if (a.type === 'CHAT'){
        cmd(`/say ${a.message}`)
      }

      if (a.type === 'MOVE'){
        // teleport các bot đến vị trí event để quay
        cmd(`/tp ${CIV_NAME} ${a.x} ${a.y} ${a.z}`)
        cmd(`/tp ${DIRECTOR_NAME} ${a.x} ${a.y} ${a.z}`)
        cmd(`/tp ${CAM_NAME} ${a.x} ${a.y+10} ${a.z+10}`)
      }

      if (a.type === 'BUILD'){
        await buildCity(cmd, a.x, a.y, a.z)
        await spawnNPC(cmd, a.x, a.y, a.z)
      }

      // Give items to civ bot (helps survival building not get stuck without resources)
      if (a.type === 'GIVE'){
        const item = a.item
        const count = Number(a.count || 1)
        if (item) cmd(`/give ${CIV_NAME} ${item} ${count}`)
      }

      // Send a command to the civ bot via the command bus.
      // Example action: {"type":"CIV_CMD","action":"CHOP","radius":18,"count":12}
      if (a.type === 'CIV_CMD'){
        enqueueCommand({ action: a.action, params: a })
      }
    }

    // tự kích hoạt theo type (không cần action cũng có thể xảy ra)
    const t = (evt.type || '').toUpperCase()
    if (t.includes('CITY_FOUNDED')){
      await buildCity(cmd, x,y,z)
      await spawnNPC(cmd, x,y,z)
      cmd(`/say 🏰 City founded at (${x},${y},${z})`)
    }
    if (t.includes('KING')){
      cmd(`/summon armor_stand ${x} ${y+1} ${z} {CustomName:'{"text":"KING","color":"gold"}'}`)
      cmd(`/say 👑 A king is crowned!`)
    }
    if (t.includes('WAR')){
      await startWar(cmd, x,y,z)
      cmd(`/say ⚔️ WAR BEGINS!`)
      markers.mark('HIGHLIGHT', { turn: evt.turn, label: evt.type })
    }
  }

  if (recording){
    await obs.stopRecord()
    markers.mark('REC_STOP')
  }
  const markerPath = markers.save()
  log.ok('✅ Markers saved:', path.basename(markerPath))
  log.info('Next: run auto edit with tools/auto_edit.py using OBS recording file + markers json')
}

run().catch(e => {
  console.error(e)
  process.exit(1)
})

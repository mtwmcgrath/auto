const Vec3 = require('vec3')
const { createBot } = require('./_common')
const log = require('../src/logger')
const { paths } = require('../src/config')
const { Tailer } = require('../src/command_bus')

const bot = createBot(process.env.MC_BOT_CAM_USERNAME || 'CameraBot')
const tail = new Tailer(paths.commandBusPath)

let anchor = null
let current = null
let queue = []
let followName = 'DirectorBot'
let theta = 0
let shotUntil = 0

bot.once('spawn', () => {
  log.ok('🎥 Camera bot spawned')
  anchor = bot.entity.position.clone()
  bot.chat('/gamemode spectator')
  bot.chat('/effect give @s night_vision 999999 1 true')
  bot.chat('/gamerule sendCommandFeedback false')
  setInterval(pollBus, 200)
  setInterval(tick, 100) // cinematic tick
})

function safeLookAt(x,y,z){
  try { bot.lookAt(new Vec3(x,y,z), true) } catch {}
}

function setAnchorToPlayer(name){
  const p = bot.players[name]?.entity
  if (p) anchor = p.position.clone()
}

function startShot(shotName, sec){
  current = { name: shotName, sec: sec || 6, start: Date.now() }
  shotUntil = Date.now() + (current.sec * 1000)
}

function enqueueShots(shots){
  queue = shots.map(s => ({ name: s[0], sec: s[1] }))
  if (!current && queue.length) {
    const s = queue.shift()
    startShot(s.name, s.sec)
  }
}

async function pollBus(){
  const msgs = await tail.readNew()
  for (const m of msgs){
    if (m.kind !== 'CAM') continue
    if (m.action === 'PLAY_SHOTS'){
      followName = m.target || followName
      setAnchorToPlayer(followName)
      enqueueShots(m.shots || [])
      log.info('🎬 Shots queued:', (m.shots||[]).map(x=>x[0]).join(', '))
    }
  }
}

function tick(){
  if (!anchor) return

  // advance shot
  if (current && Date.now() > shotUntil){
    current = null
    if (queue.length){
      const s = queue.shift()
      startShot(s.name, s.sec)
    }
  }

  // default if idle
  if (!current) {
    startShot('WIDE_ORBIT', 6)
  }

  // follow target updates anchor
  if (followName) setAnchorToPlayer(followName)

  const a = anchor
  const t = current.name

  // Smooth cinematic teleport (small steps)
  theta += 0.02

  if (t === 'FOLLOW'){
    const p = bot.players[followName]?.entity
    if (p){
      const pos = p.position
      const cam = pos.offset(7, 3.2, 7)
      bot.chat(`/tp @s ${cam.x.toFixed(2)} ${cam.y.toFixed(2)} ${cam.z.toFixed(2)}`)
      safeLookAt(pos.x, pos.y+1.6, pos.z)
      return
    }
  }

  if (t === 'LOW_DOLLY_IN'){
    // dolly towards anchor from far -> near
    const k = 1 - Math.min(1, (shotUntil - Date.now()) / (current.sec*1000))
    const dist = 18 - k*12
    const cam = a.offset(Math.cos(theta)*dist, 2.8, Math.sin(theta)*dist)
    bot.chat(`/tp @s ${cam.x.toFixed(2)} ${cam.y.toFixed(2)} ${cam.z.toFixed(2)}`)
    safeLookAt(a.x, a.y+1.2, a.z)
    return
  }

  if (t === 'CRANE_DOWN'){
    // high to low
    const k = 1 - Math.min(1, (shotUntil - Date.now()) / (current.sec*1000))
    const h = 18 - k*14
    const cam = a.offset(Math.cos(theta)*14, h, Math.sin(theta)*14)
    bot.chat(`/tp @s ${cam.x.toFixed(2)} ${cam.y.toFixed(2)} ${cam.z.toFixed(2)}`)
    safeLookAt(a.x, a.y+1.2, a.z)
    return
  }

  if (t === 'SHAKE_ZOOM'){
    // shake around close orbit
    const shake = 0.6
    const cam = a.offset(
      Math.cos(theta)*8 + (Math.random()-0.5)*shake,
      3.2 + (Math.random()-0.5)*shake,
      Math.sin(theta)*8 + (Math.random()-0.5)*shake
    )
    bot.chat(`/tp @s ${cam.x.toFixed(2)} ${cam.y.toFixed(2)} ${cam.z.toFixed(2)}`)
    safeLookAt(a.x, a.y+1.5, a.z)
    return
  }

  // WIDE_ORBIT default
  const radius = 18
  const height = 6 + Math.sin(theta*0.7)*1.2
  const cam = a.offset(Math.cos(theta)*radius, height, Math.sin(theta)*radius)
  bot.chat(`/tp @s ${cam.x.toFixed(2)} ${cam.y.toFixed(2)} ${cam.z.toFixed(2)}`)
  safeLookAt(a.x, a.y+1.5, a.z)
}

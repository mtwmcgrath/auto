// bots/civilization_camera_bot_pro.js
const Vec3 = require('vec3')
const { createBot } = require('./_common')
const log = require('../src/logger')

const bot = createBot(process.env.MC_BOT_CAM_USERNAME || 'CameraBot')

let shot = null // {type, t0, dur, params}
let tickTimer = null

function now() { return Date.now() }
function sleep(ms){ return new Promise(r=>setTimeout(r,ms)) }

function vec(x,y,z){ return new Vec3(Number(x),Number(y),Number(z)) }

function setPos(v){
  bot.entity.position.set(v.x, v.y, v.z)
}

function safeLookAt(v){
  try { bot.lookAt(new Vec3(v.x, v.y, v.z), true) } catch {}
}

function startShot(s){
  shot = { ...s, t0: now() }
}

function lerp(a,b,t){ return a + (b-a)*t }
function clamp01(t){ return Math.max(0, Math.min(1, t)) }

function tick(){
  if (!shot) return

  const t = clamp01((now() - shot.t0) / (shot.dur * 1000))

  if (shot.type === 'ORBIT'){
    const { cx, cy, cz, radius, height } = shot
    const ang = t * Math.PI * 2
    const x = cx + Math.cos(ang) * radius
    const z = cz + Math.sin(ang) * radius
    const y = cy + height
    setPos(vec(x,y,z))
    safeLookAt({x: cx, y: cy + 1.6, z: cz})
  }

  if (shot.type === 'FOLLOW'){
    const { name, dist, height } = shot
    const p = bot.players[name]?.entity
    if (p){
      const pos = p.position
      const x = pos.x + dist
      const z = pos.z + dist
      const y = pos.y + height
      setPos(vec(x,y,z))
      safeLookAt({x: pos.x, y: pos.y+1.6, z: pos.z})
    }
  }

  if (shot.type === 'CRANE'){
    const { cx, cy, cz, hFrom, hTo } = shot
    const y = lerp(hFrom, hTo, t)
    setPos(vec(cx+10, cy+y, cz+10))
    safeLookAt({x: cx, y: cy+1.6, z: cz})
  }

  if (shot.type === 'DOLLY'){
    const { fromX, fromY, fromZ, toX, toY, toZ, lookX, lookY, lookZ } = shot
    const x = lerp(fromX, toX, t)
    const y = lerp(fromY, toY, t)
    const z = lerp(fromZ, toZ, t)
    setPos(vec(x,y,z))
    safeLookAt({x: lookX, y: lookY, z: lookZ})
  }

  if (t >= 1){
    shot = null
  }
}

bot.once('spawn', async () => {
  log.ok('🎥 CameraBot PRO spawned')
  // cinematic settings
  bot.chat('/gamemode spectator')
  bot.chat('/effect give @s night_vision 999999 1 true')
  bot.chat('/gamerule sendCommandFeedback false')

  await sleep(500)
  tickTimer = setInterval(tick, 50) // 20 fps camera update
})

bot.on('kicked', (r) => console.log('❌ CameraBot kicked:', r))
bot.on('error', (e) => console.log('❌ CameraBot error:', e?.message || e))
bot.on('end', () => console.log('⚠️ CameraBot disconnected'))

bot.on('chat', (username, message) => {
  if (username === bot.username) return
  const m = message.trim()

  if (!m.startsWith('!cam ')) return

  const parts = m.split(/\s+/)
  const cmd = (parts[1] || '').toLowerCase()

  try {
    if (cmd === 'orbit'){
      // !cam orbit cx cy cz radius height seconds
      const [cx,cy,cz,radius,height,seconds] = parts.slice(2)
      startShot({ type:'ORBIT', dur:Number(seconds||6), cx:Number(cx),cy:Number(cy),cz:Number(cz), radius:Number(radius||14), height:Number(height||6) })
      log.info('🎬 CAM ORBIT', {cx,cy,cz,radius,height,seconds})
    }

    if (cmd === 'follow'){
      // !cam follow player dist height seconds
      const [name,dist,height,seconds] = parts.slice(2)
      startShot({ type:'FOLLOW', dur:Number(seconds||8), name, dist:Number(dist||8), height:Number(height||3) })
      log.info('🎬 CAM FOLLOW', {name,dist,height,seconds})
    }

    if (cmd === 'crane'){
      // !cam crane cx cy cz hFrom hTo seconds
      const [cx,cy,cz,hFrom,hTo,seconds] = parts.slice(2)
      startShot({ type:'CRANE', dur:Number(seconds||6), cx:Number(cx),cy:Number(cy),cz:Number(cz), hFrom:Number(hFrom||3), hTo:Number(hTo||18) })
      log.info('🎬 CAM CRANE', {cx,cy,cz,hFrom,hTo,seconds})
    }

    if (cmd === 'dolly'){
      // !cam dolly fromX fromY fromZ toX toY toZ seconds lookX lookY lookZ
      const [fromX,fromY,fromZ,toX,toY,toZ,seconds,lookX,lookY,lookZ] = parts.slice(2)
      startShot({
        type:'DOLLY',
        dur:Number(seconds||6),
        fromX:Number(fromX), fromY:Number(fromY), fromZ:Number(fromZ),
        toX:Number(toX), toY:Number(toY), toZ:Number(toZ),
        lookX:Number(lookX ?? toX), lookY:Number(lookY ?? toY), lookZ:Number(lookZ ?? toZ),
      })
      log.info('🎬 CAM DOLLY')
    }
  } catch (e) {
    console.log('⚠️ camera cmd parse error:', e?.message || e)
  }
})

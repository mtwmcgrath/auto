const path = require('path')
const log = require('./logger')
const { loadLatestEvents } = require('./event_loader')
const { OBSController } = require('./obs')
const { MarkerWriter } = require('./markers')
const { ensureDir } = require('./utils')
const { paths } = require('./config')
const { shotPlanFor, hookLine, classifyEvent } = require('./story_engine')
const { publish, clearBus } = require('./command_bus')

function sleep(ms){ return new Promise(r => setTimeout(r, ms)) }

function pickKeyEvents(events) {
  return events
    .filter(e => (e.severity ?? 0) >= 6 || ['WAR','BUILD','THREAT','DISASTER','POLITICS'].includes(classifyEvent(e)))
    .slice(0, 60)
}

function totalShotSeconds(evt){
  return shotPlanFor(evt).reduce((a, s) => a + (s[1] || 0), 0) || 8
}

async function run() {
  ensureDir(paths.recordingsDir)
  ensureDir(paths.markersDir)
  ensureDir(paths.outputsDir)
  ensureDir(paths.runtimeDir)
  await clearBus(paths.commandBusPath)

  const loaded = loadLatestEvents()
  if (!loaded) { log.err('No events found. Check EVENTS_DIR in .env'); process.exit(1) }

  const sessionId = `session_${Date.now()}`
  const markers = new MarkerWriter(sessionId)
  const obs = new OBSController()

  const keyEvents = pickKeyEvents(loaded.events)
  log.ok('GOD MODE session:', sessionId)
  log.info('Key events:', keyEvents.length)

  let recording = false

  // --- broadcast session start ---
  await publish(paths.commandBusPath, { kind:'SESSION', sessionId, action:'START' })

  for (const evt of keyEvents) {
    const kind = classifyEvent(evt)
    const vo = hookLine(evt)
    const shots = shotPlanFor(evt)
    const durS = totalShotSeconds(evt)

    console.log('\n' + '='.repeat(70))
    log.tag(`TURN ${evt.turn ?? '?'} / YEAR ${evt.year ?? '?'}`, `${evt.type} (${kind})`)
    console.log('🗣️ VO:', vo)
    console.log('🎬 Shot plan:', shots.map(s => `${s[0]} ${s[1]}s`).join(' | '))
    console.log(`⏱️ Live duration: ~${durS}s`)

    // Start recording early for BUILD/THREAT/WAR
    if (!recording && (kind === 'BUILD' || kind === 'THREAT' || kind === 'WAR')) {
      await obs.startRecord()
      recording = true
      markers.mark('REC_START', { turn: evt.turn, type: evt.type })
      await publish(paths.commandBusPath, { kind:'OBS', sessionId, action:'REC_START', turn: evt.turn })
    }

    // Mark event for editing timeline
    if (recording) markers.mark(evt.type || 'EVENT', { turn: evt.turn, year: evt.year, kind })

    // --- GOD MODE: send commands to bots ---
    // CIV narration + on-screen title
    await publish(paths.commandBusPath, {
      kind:'CIV',
      sessionId,
      action:'NARRATE',
      turn: evt.turn,
      year: evt.year,
      type: evt.type,
      text: vo
    })

    // DIRECTOR: build/spawn/war logic
    let directorAction = 'IDLE'
    if (kind === 'BUILD') directorAction = 'BUILD_CITY'
    else if (kind === 'POLITICS') directorAction = 'SPAWN_CITIZENS'
    else if (kind === 'WAR') directorAction = 'WAR_BATTLE'
    else if (kind === 'THREAT' || kind === 'DISASTER') directorAction = 'THREAT_SCENE'

    await publish(paths.commandBusPath, {
      kind:'DIRECTOR',
      sessionId,
      action: directorAction,
      turn: evt.turn,
      year: evt.year,
      type: evt.type,
      intensity: (evt.severity ?? 5),
    })

    // CAMERA: play shot plan as cinematic queue
    await publish(paths.commandBusPath, {
      kind:'CAM',
      sessionId,
      action:'PLAY_SHOTS',
      turn: evt.turn,
      target: 'DirectorBot',
      shots
    })

    // Auto highlight rules
    if (recording && (kind === 'WAR' || evt.type === 'BATTLE_VICTORY' || evt.type === 'WAR_DECLARED')) {
      markers.mark('HIGHLIGHT', { turn: evt.turn, label: evt.type || 'WAR' })
    }

    // Wait real time for bots to act + camera to capture
    await sleep((durS + 1.5) * 1000)
  }

  if (recording) { await obs.stopRecord(); markers.mark('REC_STOP') }

  await publish(paths.commandBusPath, { kind:'SESSION', sessionId, action:'STOP' })

  const markerPath = markers.save()
  log.ok('Markers saved:', path.basename(markerPath))
  log.info('Auto edit: python tools/auto_edit.py --input ... --markers ...')
}
run().catch(e => { log.err(e.stack || e.message); process.exit(1) })

require('dotenv').config()
const fs = require('fs')
const path = require('path')
const { writeCommand } = require('../src/command_bus')
const { sleep } = require('./_common')

const { paths } = require('../src/config')

const file = process.env.STORY_FILE || 'ep_001_tokyo.json'
const storyPath = path.join(paths.eventsDir, file)

function log(...a){ console.log('[STORY]', ...a) }

function readStory(){
  if(!fs.existsSync(storyPath)) throw new Error('Missing story file: ' + storyPath)
  return JSON.parse(fs.readFileSync(storyPath,'utf8'))
}

async function run(){
  const story = readStory()
  const delay = Number(process.env.DIRECTOR_CMD_DELAY_MS || 800)

  log('running', file)
  for(const evt of (story.events || [])){
    for(const a of (evt.actions || [])){
      const t = String(a.type || '').toUpperCase()

      if (t === 'CIV_CMD'){
        // send to civ bot
        writeCommand({ action: a.action, params: a })
        await sleep(delay)
      } else if (t === 'WAIT'){
        await sleep(Number(a.ms || 1000))
      } else if (t === 'INFO'){
        log(a.message || '')
      } else if (t === 'GIVE'){
        // director must be OP; we just write as CHAT command to civ, so civ can attempt /give if OP.
        // Better: keep GIVE as manual step; user can OP DirectorBot then it will work via Minecraft chat, but this runner doesn't own a MC connection.
        // We'll convert GIVE into a chat command targeted at server by 9woke (only works if 9woke is OP).
        writeCommand({ action: 'CHAT', params: { message: `/give ${a.target || (process.env.MC_BOT_CIV_USERNAME||'9woke')} ${a.item} ${a.count||1}` } })
        await sleep(delay)
      } else if (t === 'CHAT'){
        writeCommand({ action: 'CHAT', params: { message: a.message || '' } })
        await sleep(delay)
      }
    }
  }
  log('✅ finished', file)
}

run().catch(e=>{ console.error('[STORY] ERROR:', e.message); process.exit(1) })

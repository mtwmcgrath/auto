require('dotenv').config()
const { createBot, sleep } = require('./_common')

const DIRECTOR_NAME = process.env.MC_BOT_DIRECTOR_USERNAME || 'DirectorBot'
const CIV_NAME = process.env.MC_BOT_CIV_USERNAME || '9woke'
const ALLOW = String(process.env.ALLOW_DIRECTOR_COMMANDS || 'true') === 'true'

const bot = createBot(DIRECTOR_NAME)

function log(...a){ console.log('[DIRECTOR]', ...a) }

bot.once('spawn', async () => {
  log('spawned as', DIRECTOR_NAME)
  if (ALLOW){
    // Optional camera-friendly settings (safe if no perms)
    bot.chat('/gamerule sendCommandFeedback false')
    bot.chat(`/title ${CIV_NAME} actionbar {"text":"9WOKE WORLD ENGINE: READY","color":"gold"}`)
  }
})

async function give(item, count){
  if (!ALLOW) return
  bot.chat(`/give ${CIV_NAME} ${item} ${count}`)
  await sleep(150)
}

async function tp(x,y,z){
  if (!ALLOW) return
  bot.chat(`/tp ${CIV_NAME} ${x} ${y} ${z}`)
  await sleep(150)
}

module.exports = { give, tp, bot }

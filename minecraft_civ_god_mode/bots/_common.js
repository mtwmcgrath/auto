const mineflayer = require('mineflayer')
require('dotenv').config()

function createBot(username){
  const host = process.env.MC_HOST || '127.0.0.1'
  const port = Number(process.env.MC_PORT || 25565)
  const auth = process.env.MC_AUTH || 'offline'

  return mineflayer.createBot({
    host,
    port,
    username,
    auth
  })
}

function sleep(ms){ return new Promise(r=>setTimeout(r, ms)) }

module.exports = { createBot, sleep }

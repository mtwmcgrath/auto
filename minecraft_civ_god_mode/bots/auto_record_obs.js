// bots/auto_record_obs.js
const log = require('../src/logger')
const { OBSController } = require('../src/obs')

const SECONDS = Number(process.env.REC_SECONDS || 60)

async function run(){
  const obs = new OBSController()
  await obs.startRecord()
  log.ok(`⏺️ Recording for ${SECONDS}s...`)
  await new Promise(r => setTimeout(r, SECONDS * 1000))
  await obs.stopRecord()
  log.ok('✅ Recording done')
}

run().catch(e => {
  console.error(e)
  process.exit(1)
})

const { OBSController } = require('./obs')
const log = require('./logger')
async function run() {
  const obs = new OBSController()
  await obs.connect()
  await obs.startRecord()
  log.info('Recording 3s...')
  await new Promise(r => setTimeout(r, 3000))
  await obs.stopRecord()
  process.exit(0)
}
run().catch(e => { log.err(e.message); process.exit(1) })

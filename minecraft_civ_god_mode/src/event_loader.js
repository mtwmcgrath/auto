const path = require('path')
const { paths } = require('./config')
const { latestFile, readJson } = require('./utils')
const log = require('./logger')

function loadLatestEvents() {
  const p = latestFile(paths.eventsDir, /^civ_sim_.*\.json$/)
  if (!p) return null
  const events = readJson(p)
  if (!Array.isArray(events)) return null
  log.info('Loaded events:', path.basename(p), 'count=', events.length)
  return { path: p, events }
}
module.exports = { loadLatestEvents }

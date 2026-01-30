const path = require('path')
const { paths } = require('./config')
const { ensureDir, writeJson } = require('./utils')

class MarkerWriter {
  constructor(sessionId) {
    ensureDir(paths.markersDir)
    this.sessionId = sessionId
    this.startedAt = Date.now()
    this.markers = []
  }
  mark(label, meta = {}) {
    const t = Date.now() - this.startedAt
    this.markers.push({ t_ms: t, label, meta })
  }
  save() {
    const out = path.join(paths.markersDir, `markers_${this.sessionId}.json`)
    writeJson(out, { sessionId: this.sessionId, startedAt: this.startedAt, markers: this.markers })
    return out
  }
}
module.exports = { MarkerWriter }

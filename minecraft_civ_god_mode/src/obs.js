const OBSWebSocket = require('obs-websocket-js').default
const { obs } = require('./config')
const log = require('./logger')

class OBSController {
  constructor() {
    this.obs = new OBSWebSocket()
    this.connected = false
  }
  async connect() {
    if (this.connected) return
    await this.obs.connect(obs.url, obs.password)
    this.connected = true
    log.ok('OBS connected')
  }
  async startRecord() {
    await this.connect()
    try { await this.obs.call('StartRecord'); log.ok('OBS recording started') }
    catch (e) { log.warn('StartRecord:', e.message) }
  }
  async stopRecord() {
    await this.connect()
    try { const r = await this.obs.call('StopRecord'); log.ok('OBS recording stopped'); return r }
    catch (e) { log.warn('StopRecord:', e.message); return null }
  }
}
module.exports = { OBSController }

const fs = require('fs')
const { paths } = require('./config')

function readJSONSafe(p){
  try{
    if(!fs.existsSync(p)) return null
    const raw = fs.readFileSync(p,'utf8').trim()
    if(!raw) return null
    return JSON.parse(raw)
  }catch{
    return null
  }
}

function writeCommand(cmd){
  fs.writeFileSync(paths.commandBusPath, JSON.stringify(cmd, null, 2), 'utf8')
}

function clearBus(){
  fs.writeFileSync(paths.commandBusPath, "{}", 'utf8')
}

function getCommandBus(){
  let lastSig = ""
  return {
    poll(){
      const data = readJSONSafe(paths.commandBusPath)
      if(!data || Object.keys(data).length === 0) return
      const sig = JSON.stringify(data)
      if(sig === lastSig) return
      lastSig = sig
      if(this._on) this._on(data)
      // clear after consuming so commands don't repeat
      clearBus()
    },
    on(event, cb){
      if(event === 'COMMAND') this._on = cb
    }
  }
}

module.exports = { writeCommand, getCommandBus }

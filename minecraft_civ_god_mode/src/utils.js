const fs = require('fs')
const path = require('path')

function ensureDir(p) { fs.mkdirSync(p, { recursive: true }) }

function latestFile(dir, regex) {
  const files = fs.readdirSync(dir)
    .filter(f => regex.test(f))
    .map(f => ({ f, t: fs.statSync(path.join(dir, f)).mtimeMs }))
    .sort((a,b) => b.t - a.t)
  if (!files.length) return null
  return path.join(dir, files[0].f)
}
function readJson(p) { return JSON.parse(fs.readFileSync(p, 'utf-8')) }
function writeJson(p, obj) {
  ensureDir(path.dirname(p))
  fs.writeFileSync(p, JSON.stringify(obj, null, 2), 'utf-8')
}
module.exports = { ensureDir, latestFile, readJson, writeJson }

require('dotenv').config()
const fs = require('fs')
const path = require('path')
const { spawn } = require('child_process')
const { paths } = require('../src/config')

const listPath = path.join(paths.dataDir, 'series_9woke.json')
if(!fs.existsSync(listPath)){
  console.error('Missing series list:', listPath)
  process.exit(1)
}
const list = JSON.parse(fs.readFileSync(listPath,'utf8'))

function runStory(storyFile){
  return new Promise((resolve, reject)=>{
    const proc = spawn('node', ['bots/story_runner_bot.js'], {
      cwd: paths.rootDir,
      env: { ...process.env, STORY_FILE: storyFile },
      stdio: 'inherit'
    })
    proc.on('close', (code)=> code===0 ? resolve() : reject(new Error('story failed: '+storyFile)))
  })
}

(async()=>{
  for(const ep of list){
    console.log('\n🌍 ===== RUN EPISODE:', ep, '=====')
    await runStory(ep)
    await new Promise(r=>setTimeout(r, 4000))
  }
  console.log('\n🏁 ALL EPISODES DONE')
})().catch(e=>{ console.error('SERIES ERROR:', e.message); process.exit(1) })

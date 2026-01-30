#!/usr/bin/env node

/**
 * Mega Bot System Launcher
 * Starts all bots in the correct order
 */

const { spawn } = require('child_process')
const path = require('path')
const fs = require('fs')

console.log('='.repeat(60))
console.log('  MINECRAFT MEGA BOT SYSTEM - LAUNCHER')
console.log('='.repeat(60))
console.log()

const botsDir = path.join(__dirname, '../bots')
const processes = []

// Bot launch configuration
const botLaunchConfig = [
  // Layer 6 - Coordination (start first)
  { name: 'Grand Orchestrator', path: 'layer6_coordination/grand_orchestrator_bot.js', delay: 0 },
  { name: 'Progress Reporter', path: 'layer6_coordination/progress_reporter_bot.js', delay: 2000 },
  { name: 'Emergency Response', path: 'layer6_coordination/emergency_response_bot.js', delay: 2000 },
  
  // Layer 1 - Creative
  { name: 'Story Analyzer', path: 'layer1_creative/story_analyzer_bot.js', delay: 1000 },
  { name: 'City Architect', path: 'layer1_creative/city_architect_bot.js', delay: 1000 },
  { name: 'Theme Designer', path: 'layer1_creative/theme_designer_bot.js', delay: 1000 },
  
  // Layer 2 - Resources
  { name: 'Lumberjack Squad', path: 'layer2_resources/lumberjack_squad_bot.js', delay: 1000 },
  { name: 'Farmer', path: 'layer2_resources/farmer_bot.js', delay: 1000 },
  
  // Layer 3 - Construction
  { name: 'Wall Builder', path: 'layer3_construction/wall_builder_bot.js', delay: 1000 }
]

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function launchBot(config) {
  const botPath = path.join(botsDir, config.path)
  
  if (!fs.existsSync(botPath)) {
    console.log(`⚠️  Bot not found: ${config.name} (${config.path})`)
    return null
  }
  
  console.log(`🚀 Launching: ${config.name}...`)
  
  const proc = spawn('node', [botPath], {
    stdio: 'inherit',
    cwd: path.join(__dirname, '..')
  })
  
  proc.on('error', (err) => {
    console.error(`❌ Error launching ${config.name}:`, err.message)
  })
  
  proc.on('exit', (code) => {
    if (code !== 0) {
      console.log(`⚠️  ${config.name} exited with code ${code}`)
    }
  })
  
  return proc
}

async function launchAll() {
  console.log(`Launching ${botLaunchConfig.length} bots...`)
  console.log()
  
  for (const config of botLaunchConfig) {
    const proc = await launchBot(config)
    if (proc) {
      processes.push({ name: config.name, process: proc })
    }
    
    if (config.delay) {
      await sleep(config.delay)
    }
  }
  
  console.log()
  console.log('='.repeat(60))
  console.log(`✅ Launched ${processes.length} bots successfully`)
  console.log('='.repeat(60))
  console.log()
  console.log('Press Ctrl+C to stop all bots')
}

// Graceful shutdown
process.on('SIGINT', () => {
  console.log()
  console.log('Shutting down all bots...')
  
  processes.forEach(({ name, process }) => {
    console.log(`Stopping ${name}...`)
    process.kill('SIGTERM')
  })
  
  setTimeout(() => {
    console.log('All bots stopped. Goodbye!')
    process.exit(0)
  }, 2000)
})

// Start
launchAll().catch(err => {
  console.error('Fatal error:', err)
  process.exit(1)
})

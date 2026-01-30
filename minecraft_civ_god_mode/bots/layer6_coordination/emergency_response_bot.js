require('dotenv').config()
const { createBot, sleep } = require('../_common')
const { getCommandBus } = require('../../src/command_bus')
const fs = require('fs')
const path = require('path')

const BOT_NAME = process.env.MC_BOT_EMERGENCY_RESPONSE_USERNAME || 'EmergencyResponseBot'
const bot = createBot(BOT_NAME)
const bus = getCommandBus()

function log(...a) { console.log('[EMERGENCY_RESPONSE]', ...a) }

let crashLog = []
let rescueOperations = []
let backupInterval = null

// Monitor bot health
function monitorBotHealth(botId, lastSeen) {
  const now = Date.now()
  const timeSinceLastSeen = now - lastSeen
  
  // If bot hasn't reported in 30 seconds, consider it crashed
  if (timeSinceLastSeen > 30000) {
    log('WARNING: Bot', botId, 'not responding for', Math.floor(timeSinceLastSeen/1000), 'seconds')
    handleBotCrash(botId)
  }
}

// Handle bot crash
function handleBotCrash(botId) {
  log('CRASH DETECTED:', botId)
  
  const crashRecord = {
    botId: botId,
    timestamp: Date.now(),
    timestampISO: new Date().toISOString(),
    action: 'detected'
  }
  
  crashLog.push(crashRecord)
  saveCrashLog()
  
  // Attempt restart
  log('Attempting to restart', botId, '...')
  
  // In a real implementation, would trigger bot restart
  // For now, just log the action
  
  crashRecord.action = 'restart_initiated'
  saveCrashLog()
}

// Rescue stuck bot
async function rescueBot(botId, location) {
  log('RESCUE OPERATION:', botId, 'at', location)
  
  const rescue = {
    botId: botId,
    location: location,
    timestamp: Date.now(),
    status: 'in_progress'
  }
  
  rescueOperations.push(rescue)
  
  // In a real implementation, would:
  // 1. Teleport bot to safe location
  // 2. Clear obstacles
  // 3. Reset bot state
  
  await sleep(2000)
  
  rescue.status = 'completed'
  rescue.completedAt = Date.now()
  
  log('Rescue completed for', botId)
}

// Undo mistakes
async function undoMistake(taskId, blocks) {
  log('UNDO OPERATION: Task', taskId)
  log('Reverting', blocks.length, 'blocks')
  
  // In a real implementation, would:
  // 1. Store block history
  // 2. Revert blocks to previous state
  // 3. Update bot task queue
  
  for (const block of blocks) {
    // Revert block
    await sleep(50)
  }
  
  log('Undo completed')
}

// Backup system state
function backupState() {
  log('Creating backup...')
  
  const backupDir = path.join(__dirname, '../../outputs/backups')
  fs.mkdirSync(backupDir, { recursive: true })
  
  const backup = {
    timestamp: Date.now(),
    timestampISO: new Date().toISOString(),
    crashLog: crashLog,
    rescueOperations: rescueOperations
  }
  
  const filename = `backup_${Date.now()}.json`
  const filepath = path.join(backupDir, filename)
  
  fs.writeFileSync(filepath, JSON.stringify(backup, null, 2))
  log('Backup saved:', filename)
  
  // Keep only last 10 backups
  const backups = fs.readdirSync(backupDir)
    .filter(f => f.startsWith('backup_'))
    .sort()
  
  if (backups.length > 10) {
    const toDelete = backups.slice(0, backups.length - 10)
    toDelete.forEach(f => {
      fs.unlinkSync(path.join(backupDir, f))
    })
  }
}

// Restore from backup
function restoreFromBackup(backupFile) {
  log('Restoring from backup:', backupFile)
  
  const backupPath = path.join(__dirname, '../../outputs/backups', backupFile)
  
  if (!fs.existsSync(backupPath)) {
    log('ERROR: Backup file not found:', backupFile)
    return false
  }
  
  const backup = JSON.parse(fs.readFileSync(backupPath, 'utf8'))
  
  crashLog = backup.crashLog || []
  rescueOperations = backup.rescueOperations || []
  
  log('Restore completed')
  return true
}

// Save crash log
function saveCrashLog() {
  const logPath = path.join(__dirname, '../../outputs/crash_log.json')
  fs.mkdirSync(path.dirname(logPath), { recursive: true })
  fs.writeFileSync(logPath, JSON.stringify(crashLog, null, 2))
}

// Generate emergency report
function generateEmergencyReport() {
  const report = {
    timestamp: new Date().toISOString(),
    totalCrashes: crashLog.length,
    totalRescues: rescueOperations.length,
    recentCrashes: crashLog.slice(-5),
    recentRescues: rescueOperations.slice(-5),
    systemHealth: crashLog.length === 0 ? 'good' : 'degraded'
  }
  
  log('='.repeat(50))
  log('EMERGENCY RESPONSE REPORT')
  log('='.repeat(50))
  log('Total Crashes:', report.totalCrashes)
  log('Total Rescues:', report.totalRescues)
  log('System Health:', report.systemHealth)
  log('='.repeat(50))
  
  return report
}

bot.once('spawn', async () => {
  log('Emergency Response Bot spawned')
  log('Standing by for emergencies...')
  
  setInterval(() => bus.poll(), 400)
  
  bus.on('COMMAND', async (cmd) => {
    try {
      const action = String(cmd.action || '').toUpperCase()
      
      if (action === 'CRASH_DETECTED') {
        handleBotCrash(cmd.botId)
        
      } else if (action === 'RESCUE_BOT') {
        await rescueBot(cmd.botId, cmd.location)
        
      } else if (action === 'UNDO') {
        await undoMistake(cmd.taskId, cmd.blocks || [])
        
      } else if (action === 'BACKUP') {
        backupState()
        
      } else if (action === 'RESTORE') {
        restoreFromBackup(cmd.backupFile)
        
      } else if (action === 'REPORT') {
        const report = generateEmergencyReport()
        const reportPath = path.join(__dirname, '../../outputs/emergency_report.json')
        fs.mkdirSync(path.dirname(reportPath), { recursive: true })
        fs.writeFileSync(reportPath, JSON.stringify(report, null, 2))
        
      } else if (action === 'PING') {
        log('pong')
      }
    } catch (e) {
      log('ERROR:', e?.message || e)
    }
  })
  
  // Auto-backup every 10 minutes
  backupInterval = setInterval(() => {
    backupState()
  }, 10 * 60 * 1000)
  
  log('Emergency response system active!')
})

bot.on('kicked', (r) => log('kicked:', r))
bot.on('error', (e) => log('error:', e?.message || e))

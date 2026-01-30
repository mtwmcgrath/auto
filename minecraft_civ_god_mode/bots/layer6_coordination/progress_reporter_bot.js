require('dotenv').config()
const { createBot, sleep } = require('../_common')
const { getCommandBus } = require('../../src/command_bus')
const fs = require('fs')
const path = require('path')

const BOT_NAME = process.env.MC_BOT_PROGRESS_REPORTER_USERNAME || 'ProgressReporterBot'
const bot = createBot(BOT_NAME)
const bus = getCommandBus()

function log(...a) { console.log('[PROGRESS_REPORTER]', ...a) }

let startTime = Date.now()
let lastReport = Date.now()
let reportCount = 0
let statistics = {
  blocksPlaced: 0,
  blocksDestroyed: 0,
  itemsCrafted: 0,
  distanceTraveled: 0,
  tasksCompleted: 0
}

// Generate progress report
function generateReport() {
  const now = Date.now()
  const elapsed = Math.floor((now - startTime) / 1000)
  const elapsedMinutes = Math.floor(elapsed / 60)
  const elapsedSeconds = elapsed % 60
  
  reportCount++
  
  const report = {
    reportNumber: reportCount,
    timestamp: new Date().toISOString(),
    elapsedTime: `${elapsedMinutes}m ${elapsedSeconds}s`,
    statistics: statistics,
    activeBots: 0, // Would query from orchestrator
    currentPhase: 'BUILDING', // Would query from orchestrator
    estimatedCompletion: 'calculating...'
  }
  
  log('='.repeat(50))
  log('PROGRESS REPORT #' + reportCount)
  log('='.repeat(50))
  log('Time Elapsed:', report.elapsedTime)
  log('Blocks Placed:', statistics.blocksPlaced)
  log('Tasks Completed:', statistics.tasksCompleted)
  log('Current Phase:', report.currentPhase)
  log('='.repeat(50))
  
  return report
}

// Save report to file
function saveReport(report) {
  const reportDir = path.join(__dirname, '../../outputs/reports')
  fs.mkdirSync(reportDir, { recursive: true })
  
  const filename = `progress_report_${reportCount}.json`
  const filepath = path.join(reportDir, filename)
  
  fs.writeFileSync(filepath, JSON.stringify(report, null, 2))
  log('Report saved to:', filename)
  
  // Also append to summary file
  const summaryPath = path.join(reportDir, 'progress_summary.jsonl')
  fs.appendFileSync(summaryPath, JSON.stringify(report) + '\n')
}

// Calculate statistics
function updateStatistics(data) {
  if (data.blocksPlaced) statistics.blocksPlaced += data.blocksPlaced
  if (data.blocksDestroyed) statistics.blocksDestroyed += data.blocksDestroyed
  if (data.itemsCrafted) statistics.itemsCrafted += data.itemsCrafted
  if (data.distanceTraveled) statistics.distanceTraveled += data.distanceTraveled
  if (data.tasksCompleted) statistics.tasksCompleted += data.tasksCompleted
}

// Calculate ETA
function calculateETA(progress, total) {
  if (progress === 0) return 'unknown'
  
  const elapsed = Date.now() - startTime
  const rate = progress / elapsed
  const remaining = total - progress
  const eta = remaining / rate
  
  const minutes = Math.floor(eta / 60000)
  return `~${minutes} minutes`
}

// Generate dashboard HTML (simplified)
function generateDashboard(report) {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <title>Mega Bot System - Progress Dashboard</title>
  <style>
    body { font-family: Arial; background: #1a1a1a; color: #fff; padding: 20px; }
    .header { background: #2d2d2d; padding: 20px; border-radius: 10px; margin-bottom: 20px; }
    .stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
    .stat-card { background: #2d2d2d; padding: 20px; border-radius: 10px; }
    .stat-value { font-size: 2em; font-weight: bold; color: #4CAF50; }
    .stat-label { color: #888; }
  </style>
</head>
<body>
  <div class="header">
    <h1>🏗️ Mega Bot System Dashboard</h1>
    <p>Report #${report.reportNumber} - ${report.timestamp}</p>
    <p>Elapsed Time: ${report.elapsedTime}</p>
  </div>
  
  <div class="stats">
    <div class="stat-card">
      <div class="stat-value">${statistics.blocksPlaced}</div>
      <div class="stat-label">Blocks Placed</div>
    </div>
    <div class="stat-card">
      <div class="stat-value">${statistics.tasksCompleted}</div>
      <div class="stat-label">Tasks Completed</div>
    </div>
    <div class="stat-card">
      <div class="stat-value">${report.currentPhase}</div>
      <div class="stat-label">Current Phase</div>
    </div>
  </div>
</body>
</html>
  `
  
  const dashboardPath = path.join(__dirname, '../../outputs/dashboard.html')
  fs.writeFileSync(dashboardPath, html)
  log('Dashboard updated:', dashboardPath)
}

bot.once('spawn', async () => {
  log('Progress Reporter Bot spawned')
  log('Generating reports every 5 minutes')
  
  startTime = Date.now()
  
  setInterval(() => bus.poll(), 400)
  
  bus.on('COMMAND', async (cmd) => {
    try {
      const action = String(cmd.action || '').toUpperCase()
      
      if (action === 'UPDATE_STATS') {
        updateStatistics(cmd.data || {})
        
      } else if (action === 'GENERATE_REPORT') {
        const report = generateReport()
        saveReport(report)
        generateDashboard(report)
        
      } else if (action === 'RESET_STATS') {
        statistics = {
          blocksPlaced: 0,
          blocksDestroyed: 0,
          itemsCrafted: 0,
          distanceTraveled: 0,
          tasksCompleted: 0
        }
        startTime = Date.now()
        reportCount = 0
        log('Statistics reset')
        
      } else if (action === 'PING') {
        log('pong')
      }
    } catch (e) {
      log('ERROR:', e?.message || e)
    }
  })
  
  // Auto-report every 5 minutes
  setInterval(() => {
    const report = generateReport()
    saveReport(report)
    generateDashboard(report)
  }, 5 * 60 * 1000)
  
  // Initial report
  const initialReport = generateReport()
  saveReport(initialReport)
  generateDashboard(initialReport)
  
  log('Progress reporting active!')
})

bot.on('kicked', (r) => log('kicked:', r))
bot.on('error', (e) => log('error:', e?.message || e))

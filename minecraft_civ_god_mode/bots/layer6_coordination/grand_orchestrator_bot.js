require('dotenv').config()
const { createBot, sleep } = require('../_common')
const { getCommandBus } = require('../../src/command_bus')
const fs = require('fs')
const path = require('path')

const BOT_NAME = process.env.MC_BOT_ORCHESTRATOR_USERNAME || 'OrchestratorBot'
const bot = createBot(BOT_NAME)
const bus = getCommandBus()

// State machine states
const STATES = {
  INIT: 'INIT',
  ANALYZE_INPUT: 'ANALYZE_INPUT',
  GENERATE_VISION: 'GENERATE_VISION',
  PLAN_CITY: 'PLAN_CITY',
  GATHER_RESOURCES: 'GATHER_RESOURCES',
  BUILD_FOUNDATION: 'BUILD_FOUNDATION',
  CONSTRUCT_BUILDINGS: 'CONSTRUCT_BUILDINGS',
  ADD_DETAILS: 'ADD_DETAILS',
  LANDSCAPING: 'LANDSCAPING',
  FINALIZE: 'FINALIZE',
  COMPLETE: 'COMPLETE'
}

// Bot management
let currentState = STATES.INIT
let activeBots = {}
let taskQueue = []
let visionDocument = null
let cityPlan = null

function log(...a) { console.log('[ORCHESTRATOR]', ...a) }

// Bot registration and management
function registerBot(botId, botType, botInstance) {
  activeBots[botId] = {
    id: botId,
    type: botType,
    instance: botInstance,
    status: 'idle',
    currentTask: null,
    lastUpdate: Date.now()
  }
  log(`Registered bot: ${botId} (${botType})`)
}

function getBotsByType(type) {
  return Object.values(activeBots).filter(b => b.type === type)
}

function assignTask(botId, task) {
  if (activeBots[botId]) {
    activeBots[botId].currentTask = task
    activeBots[botId].status = 'working'
    activeBots[botId].lastUpdate = Date.now()
    log(`Assigned task to ${botId}:`, task.action)
  }
}

function updateBotStatus(botId, status) {
  if (activeBots[botId]) {
    activeBots[botId].status = status
    activeBots[botId].lastUpdate = Date.now()
  }
}

// State machine handlers
async function handleInit() {
  log('Initializing Grand Orchestrator...')
  log('Waiting for bot registrations...')
  
  // Load bot fleet configuration
  const configPath = path.join(__dirname, '../../config/bot_fleet.json')
  if (fs.existsSync(configPath)) {
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'))
    log('Bot fleet configuration loaded:', config.total_bots, 'bots expected')
  }
  
  currentState = STATES.ANALYZE_INPUT
  log('State:', currentState)
}

async function handleAnalyzeInput(input) {
  log('Analyzing input...')
  
  if (!input) {
    log('No input provided. Waiting for user story or image...')
    return
  }
  
  // Delegate to Story Analyzer or Image Vision bot
  if (input.type === 'story') {
    log('Delegating to Story Analyzer Bot...')
    const storyBots = getBotsByType('story_analyzer')
    if (storyBots.length > 0) {
      assignTask(storyBots[0].id, { action: 'ANALYZE_STORY', data: input.data })
    }
  } else if (input.type === 'image') {
    log('Delegating to Image Vision Bot...')
    const visionBots = getBotsByType('image_vision')
    if (visionBots.length > 0) {
      assignTask(visionBots[0].id, { action: 'ANALYZE_IMAGE', data: input.data })
    }
  }
  
  currentState = STATES.GENERATE_VISION
}

async function handleGenerateVision() {
  log('Generating vision document...')
  
  // Wait for analysis results from creative bots
  // This would integrate with Story Analyzer and Image Vision results
  
  visionDocument = {
    theme: 'fantasy',
    style: 'medieval',
    colors: ['purple', 'blue', 'silver'],
    structures: ['towers', 'bridges', 'castle'],
    atmosphere: 'magical',
    timestamp: Date.now()
  }
  
  log('Vision document generated:', visionDocument)
  currentState = STATES.PLAN_CITY
}

async function handlePlanCity() {
  log('Planning city layout...')
  
  // Delegate to City Architect Bot
  const architectBots = getBotsByType('city_architect')
  if (architectBots.length > 0) {
    assignTask(architectBots[0].id, {
      action: 'PLAN_CITY',
      vision: visionDocument
    })
  }
  
  // Mock city plan
  cityPlan = {
    zones: {
      residential: { x: 0, z: 0, size: 50 },
      commercial: { x: 60, z: 0, size: 30 },
      industrial: { x: 100, z: 0, size: 40 }
    },
    roads: [
      { start: [0, 0], end: [100, 0] },
      { start: [50, -30], end: [50, 30] }
    ],
    landmarks: [
      { type: 'tower', x: 25, z: 25 },
      { type: 'castle', x: 75, z: 25 }
    ]
  }
  
  log('City plan created:', Object.keys(cityPlan))
  currentState = STATES.GATHER_RESOURCES
}

async function handleGatherResources() {
  log('Starting resource gathering phase...')
  
  // Assign tasks to resource gathering bots
  const lumberjackSquad = getBotsByType('lumberjack_squad')
  if (lumberjackSquad.length > 0) {
    assignTask(lumberjackSquad[0].id, {
      action: 'START_LOGGING',
      target: 1000,
      replant: true
    })
  }
  
  const minerChief = getBotsByType('miner_chief')
  if (minerChief.length > 0) {
    assignTask(minerChief[0].id, {
      action: 'START_MINING',
      target: { stone: 5000, iron: 500, coal: 300 }
    })
  }
  
  const farmers = getBotsByType('farmer')
  farmers.forEach(farmer => {
    assignTask(farmer.id, {
      action: 'START_FARMING',
      crops: ['wheat', 'carrots', 'potatoes']
    })
  })
  
  log('Resource gathering tasks assigned')
  
  // Simulate progression
  await sleep(2000)
  currentState = STATES.BUILD_FOUNDATION
}

async function handleBuildFoundation() {
  log('Starting foundation construction...')
  
  const foundationBuilders = getBotsByType('foundation_builder')
  
  cityPlan.zones && Object.entries(cityPlan.zones).forEach(([zoneName, zone]) => {
    if (foundationBuilders.length > 0) {
      const builder = foundationBuilders[0]
      assignTask(builder.id, {
        action: 'BUILD_FOUNDATION',
        zone: zoneName,
        x: zone.x,
        z: zone.z,
        size: zone.size
      })
    }
  })
  
  log('Foundation tasks assigned')
  await sleep(1500)
  currentState = STATES.CONSTRUCT_BUILDINGS
}

async function handleConstructBuildings() {
  log('Starting building construction...')
  
  const wallBuilders = getBotsByType('wall_builder')
  const roofBuilders = getBotsByType('roof_builder')
  
  if (cityPlan.landmarks) {
    cityPlan.landmarks.forEach((landmark, idx) => {
      if (wallBuilders[idx]) {
        assignTask(wallBuilders[idx].id, {
          action: 'BUILD_STRUCTURE',
          type: landmark.type,
          x: landmark.x,
          z: landmark.z,
          theme: visionDocument.theme
        })
      }
    })
  }
  
  log('Building construction tasks assigned')
  await sleep(1500)
  currentState = STATES.ADD_DETAILS
}

async function handleAddDetails() {
  log('Adding creative details...')
  
  const signWriters = getBotsByType('sign_writer')
  const artists = getBotsByType('artist')
  const redstoneEngineers = getBotsByType('redstone_engineer')
  
  signWriters.forEach(bot => {
    assignTask(bot.id, {
      action: 'PLACE_SIGNS',
      signs: [
        { x: 0, y: 65, z: 0, text: 'Welcome to the City' },
        { x: 50, y: 65, z: 0, text: 'Market District' }
      ]
    })
  })
  
  log('Detail tasks assigned')
  await sleep(1500)
  currentState = STATES.LANDSCAPING
}

async function handleLandscaping() {
  log('Starting landscaping...')
  
  const landscapers = getBotsByType('landscaper')
  
  landscapers.forEach(bot => {
    assignTask(bot.id, {
      action: 'LANDSCAPE',
      features: ['trees', 'flowers', 'gardens', 'fountains']
    })
  })
  
  log('Landscaping tasks assigned')
  await sleep(1500)
  currentState = STATES.FINALIZE
}

async function handleFinalize() {
  log('Finalizing city construction...')
  log('Total bots active:', Object.keys(activeBots).length)
  log('Vision:', visionDocument)
  log('City plan zones:', Object.keys(cityPlan.zones || {}))
  
  currentState = STATES.COMPLETE
}

async function handleComplete() {
  log('========================================')
  log('CITY CONSTRUCTION COMPLETE!')
  log('========================================')
  log('Total bots used:', Object.keys(activeBots).length)
  log('Final state:', currentState)
  
  // Generate final report
  const report = {
    state: currentState,
    vision: visionDocument,
    cityPlan: cityPlan,
    activeBots: Object.keys(activeBots).length,
    completedAt: new Date().toISOString()
  }
  
  const reportPath = path.join(__dirname, '../../outputs/final_report.json')
  fs.mkdirSync(path.dirname(reportPath), { recursive: true })
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2))
  
  log('Final report saved to:', reportPath)
}

// Main state machine loop
async function runStateMachine(input = null) {
  log('Running state machine. Current state:', currentState)
  
  try {
    switch (currentState) {
      case STATES.INIT:
        await handleInit()
        break
      case STATES.ANALYZE_INPUT:
        await handleAnalyzeInput(input)
        break
      case STATES.GENERATE_VISION:
        await handleGenerateVision()
        break
      case STATES.PLAN_CITY:
        await handlePlanCity()
        break
      case STATES.GATHER_RESOURCES:
        await handleGatherResources()
        break
      case STATES.BUILD_FOUNDATION:
        await handleBuildFoundation()
        break
      case STATES.CONSTRUCT_BUILDINGS:
        await handleConstructBuildings()
        break
      case STATES.ADD_DETAILS:
        await handleAddDetails()
        break
      case STATES.LANDSCAPING:
        await handleLandscaping()
        break
      case STATES.FINALIZE:
        await handleFinalize()
        break
      case STATES.COMPLETE:
        await handleComplete()
        break
    }
  } catch (err) {
    log('ERROR in state machine:', err.message)
  }
}

bot.once('spawn', async () => {
  log('Grand Orchestrator spawned on', process.env.MC_HOST)
  
  // Initialize
  await runStateMachine()
  
  // Listen for commands
  setInterval(() => bus.poll(), 500)
  
  bus.on('COMMAND', async (cmd) => {
    try {
      const action = String(cmd.action || '').toUpperCase()
      
      if (action === 'START') {
        log('Received START command with input:', cmd.input?.type)
        await runStateMachine(cmd.input)
      } else if (action === 'STATUS') {
        log('Current state:', currentState)
        log('Active bots:', Object.keys(activeBots).length)
      } else if (action === 'REGISTER_BOT') {
        registerBot(cmd.botId, cmd.botType, cmd.botInstance)
      } else if (action === 'UPDATE_BOT_STATUS') {
        updateBotStatus(cmd.botId, cmd.status)
      } else if (action === 'NEXT_STATE') {
        await runStateMachine()
      }
    } catch (e) {
      log('ERROR:', e?.message || e)
    }
  })
  
  // Progress loop - advance state automatically for demo
  setInterval(async () => {
    if (currentState !== STATES.COMPLETE && currentState !== STATES.INIT) {
      await runStateMachine()
    }
  }, 5000)
})

bot.on('kicked', (r) => log('kicked:', r))
bot.on('error', (e) => log('error:', e?.message || e))

// Export for other modules
module.exports = { registerBot, assignTask, updateBotStatus, STATES }

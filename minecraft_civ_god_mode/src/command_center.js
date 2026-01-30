require('dotenv').config()
const { writeCommand } = require('./command_bus')
const readline = require('readline')
const fs = require('fs')
const path = require('path')

/**
 * Command Center - Control Interface for Mega Bot System
 */

console.log('='.repeat(60))
console.log('  MINECRAFT MEGA BOT SYSTEM - COMMAND CENTER')
console.log('='.repeat(60))
console.log()

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: 'COMMAND> '
})

// Load story and image handlers
const { processStoryInput, saveStoryInput, EXAMPLE_STORIES } = require('./story_input_handler')
const { analyzeImage, generateBuildingData, saveImageAnalysis } = require('./image_input_handler')

// Active project state
let currentProject = null

function log(...args) {
  console.log('[COMMAND_CENTER]', ...args)
}

function showHelp() {
  console.log(`
Available Commands:
  /start [story|image] - Start a new project with story or image input
  /story <text|file>   - Load story from text or file
  /image <path>        - Load and analyze image
  /pause               - Pause all bots
  /resume              - Resume all bots
  /status              - Show system status
  /bots                - List all active bots
  /adjust <param>      - Adjust system parameters
  /save                - Save current project
  /load <project>      - Load saved project
  /preview             - Preview current build plan
  /help                - Show this help message
  /exit                - Exit command center
  `)
}

function showStatus() {
  console.log('\n--- SYSTEM STATUS ---')
  console.log('Project:', currentProject ? currentProject.name : 'None')
  console.log('State:', currentProject ? currentProject.state : 'IDLE')
  
  // Check bot fleet config
  const configPath = path.join(__dirname, '../config/bot_fleet.json')
  if (fs.existsSync(configPath)) {
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'))
    console.log('Bot Fleet:', config.total_bots, 'bots configured')
  }
  
  console.log('---\n')
}

function startProject(type, input) {
  log('Starting project with', type)
  
  currentProject = {
    name: `Project_${Date.now()}`,
    type: type,
    input: input,
    state: 'INIT',
    startTime: Date.now()
  }
  
  // Send START command to orchestrator
  writeCommand({
    action: 'START',
    input: {
      type: type,
      data: input
    }
  })
  
  log('Project started:', currentProject.name)
  log('Orchestrator notified')
}

function handleStoryInput(storyInput) {
  let storyText = ''
  
  // Check if it's an example story
  if (EXAMPLE_STORIES[storyInput]) {
    log('Using example story:', storyInput)
    storyText = EXAMPLE_STORIES[storyInput]
  } else if (fs.existsSync(storyInput)) {
    // Load from file
    log('Loading story from file:', storyInput)
    storyText = fs.readFileSync(storyInput, 'utf8')
  } else {
    // Treat as direct text
    storyText = storyInput
  }
  
  const processed = processStoryInput(storyText)
  saveStoryInput(processed)
  
  startProject('story', processed)
}

function handleImageInput(imagePath) {
  if (!fs.existsSync(imagePath)) {
    log('ERROR: Image file not found:', imagePath)
    return
  }
  
  log('Analyzing image:', imagePath)
  const analysis = analyzeImage(imagePath)
  const buildingData = generateBuildingData(analysis)
  saveImageAnalysis(buildingData)
  
  startProject('image', buildingData)
}

function pauseBots() {
  log('Pausing all bots...')
  writeCommand({ action: 'PAUSE' })
  if (currentProject) {
    currentProject.state = 'PAUSED'
  }
}

function resumeBots() {
  log('Resuming all bots...')
  writeCommand({ action: 'RESUME' })
  if (currentProject) {
    currentProject.state = 'RUNNING'
  }
}

function saveProject() {
  if (!currentProject) {
    log('No active project to save')
    return
  }
  
  const saveDir = path.join(__dirname, '../outputs/projects')
  fs.mkdirSync(saveDir, { recursive: true })
  
  const savePath = path.join(saveDir, `${currentProject.name}.json`)
  fs.writeFileSync(savePath, JSON.stringify(currentProject, null, 2))
  
  log('Project saved:', savePath)
}

function listBots() {
  console.log('\n--- BOT FLEET ---')
  const configPath = path.join(__dirname, '../config/bot_fleet.json')
  if (fs.existsSync(configPath)) {
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'))
    
    Object.entries(config.bot_groups).forEach(([layer, bots]) => {
      console.log(`\n${layer}:`)
      if (typeof bots === 'object') {
        Object.entries(bots).forEach(([name, count]) => {
          console.log(`  - ${name}: ${count}`)
        })
      }
    })
  }
  console.log('\n---\n')
}

// Command processing
rl.on('line', (line) => {
  const input = line.trim()
  
  if (!input) {
    rl.prompt()
    return
  }
  
  const [command, ...args] = input.split(' ')
  const cmd = command.toLowerCase()
  
  try {
    if (cmd === '/help' || cmd === 'help') {
      showHelp()
      
    } else if (cmd === '/status') {
      showStatus()
      
    } else if (cmd === '/start') {
      const type = args[0] || 'story'
      if (type === 'story') {
        console.log('Enter your story (or use example: fantasy_kingdom, peaceful_village, medieval_fortress):')
      } else if (type === 'image') {
        console.log('Enter image path:')
      }
      
    } else if (cmd === '/story') {
      const storyInput = args.join(' ')
      if (storyInput) {
        handleStoryInput(storyInput)
      } else {
        log('Usage: /story <text|file|example_name>')
      }
      
    } else if (cmd === '/image') {
      const imagePath = args[0]
      if (imagePath) {
        handleImageInput(imagePath)
      } else {
        log('Usage: /image <path>')
      }
      
    } else if (cmd === '/pause') {
      pauseBots()
      
    } else if (cmd === '/resume') {
      resumeBots()
      
    } else if (cmd === '/save') {
      saveProject()
      
    } else if (cmd === '/bots') {
      listBots()
      
    } else if (cmd === '/exit' || cmd === 'exit') {
      log('Shutting down command center...')
      process.exit(0)
      
    } else {
      log('Unknown command:', cmd)
      log('Type /help for available commands')
    }
    
  } catch (err) {
    log('ERROR:', err.message)
  }
  
  rl.prompt()
})

rl.on('close', () => {
  console.log('\nGoodbye!')
  process.exit(0)
})

// Initialize
showHelp()
showStatus()
rl.prompt()

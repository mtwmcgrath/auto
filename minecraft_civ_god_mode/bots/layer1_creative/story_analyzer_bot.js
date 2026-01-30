require('dotenv').config()
const { createBot, sleep } = require('../_common')
const { getCommandBus } = require('../../src/command_bus')
const fs = require('fs')
const path = require('path')

const BOT_NAME = process.env.MC_BOT_STORY_ANALYZER_USERNAME || 'StoryAnalyzerBot'
const bot = createBot(BOT_NAME)
const bus = getCommandBus()

function log(...a) { console.log('[STORY_ANALYZER]', ...a) }

// NLP-inspired keyword extraction (simplified)
function extractKeywords(text) {
  const keywords = []
  const lowered = text.toLowerCase()
  
  // Architecture keywords
  const archKeywords = ['castle', 'tower', 'bridge', 'house', 'wall', 'gate', 'palace', 'temple', 'cathedral']
  archKeywords.forEach(kw => {
    if (lowered.includes(kw)) keywords.push({ type: 'structure', value: kw })
  })
  
  // Style keywords
  const styleKeywords = ['gothic', 'medieval', 'modern', 'futuristic', 'fantasy', 'steampunk', 'oriental', 'viking']
  styleKeywords.forEach(kw => {
    if (lowered.includes(kw)) keywords.push({ type: 'style', value: kw })
  })
  
  // Color keywords
  const colorKeywords = ['red', 'blue', 'green', 'purple', 'white', 'black', 'silver', 'gold', 'pink', 'orange']
  colorKeywords.forEach(kw => {
    if (lowered.includes(kw)) keywords.push({ type: 'color', value: kw })
  })
  
  // Atmosphere keywords
  const atmKeywords = ['peaceful', 'magical', 'dark', 'bright', 'mysterious', 'grand', 'cozy', 'epic']
  atmKeywords.forEach(kw => {
    if (lowered.includes(kw)) keywords.push({ type: 'atmosphere', value: kw })
  })
  
  return keywords
}

// Extract themes from text
function extractThemes(text) {
  const themes = []
  const lowered = text.toLowerCase()
  
  if (lowered.includes('magic') || lowered.includes('wizard') || lowered.includes('spell')) {
    themes.push('magic')
  }
  if (lowered.includes('war') || lowered.includes('battle') || lowered.includes('fort')) {
    themes.push('military')
  }
  if (lowered.includes('trade') || lowered.includes('market') || lowered.includes('merchant')) {
    themes.push('commerce')
  }
  if (lowered.includes('farm') || lowered.includes('village') || lowered.includes('peaceful')) {
    themes.push('rural')
  }
  if (lowered.includes('city') || lowered.includes('urban') || lowered.includes('skyscraper')) {
    themes.push('urban')
  }
  
  return themes
}

// Analyze emotions/mood from text
function analyzeEmotion(text) {
  const lowered = text.toLowerCase()
  
  if (lowered.includes('happy') || lowered.includes('joy') || lowered.includes('cheerful')) {
    return 'joyful'
  }
  if (lowered.includes('dark') || lowered.includes('scary') || lowered.includes('ominous')) {
    return 'dark'
  }
  if (lowered.includes('peaceful') || lowered.includes('calm') || lowered.includes('serene')) {
    return 'peaceful'
  }
  if (lowered.includes('grand') || lowered.includes('epic') || lowered.includes('magnificent')) {
    return 'epic'
  }
  
  return 'neutral'
}

// Generate building concepts from narrative
function generateBuildingConcepts(keywords, themes) {
  const concepts = []
  
  // Extract structure types
  const structures = keywords.filter(k => k.type === 'structure').map(k => k.value)
  
  structures.forEach(structure => {
    concepts.push({
      type: structure,
      priority: 'high',
      count: structure === 'house' ? 5 : 1
    })
  })
  
  // Add default structures based on themes
  if (themes.includes('urban')) {
    concepts.push({ type: 'skyscraper', priority: 'medium', count: 3 })
    concepts.push({ type: 'road', priority: 'high', count: 10 })
  }
  if (themes.includes('rural')) {
    concepts.push({ type: 'cottage', priority: 'high', count: 8 })
    concepts.push({ type: 'barn', priority: 'medium', count: 2 })
  }
  if (themes.includes('magic')) {
    concepts.push({ type: 'wizard_tower', priority: 'high', count: 3 })
    concepts.push({ type: 'enchanting_library', priority: 'medium', count: 1 })
  }
  
  return concepts
}

// Suggest architectural styles
function suggestArchitecturalStyles(keywords, themes, emotion) {
  const styles = []
  
  // Check explicit style mentions
  const styleKeywords = keywords.filter(k => k.type === 'style')
  if (styleKeywords.length > 0) {
    styleKeywords.forEach(s => styles.push(s.value))
  } else {
    // Infer from themes and emotion
    if (themes.includes('magic')) {
      styles.push('fantasy', 'gothic')
    }
    if (themes.includes('military')) {
      styles.push('medieval', 'fortress')
    }
    if (themes.includes('urban')) {
      styles.push('modern', 'contemporary')
    }
    if (emotion === 'epic') {
      styles.push('grand', 'monumental')
    }
    if (emotion === 'peaceful') {
      styles.push('rustic', 'cottage')
    }
  }
  
  return styles.length > 0 ? styles : ['medieval'] // default
}

// Main analysis function
function analyzeStory(storyText) {
  log('Analyzing story...')
  log('Story length:', storyText.length, 'characters')
  
  const keywords = extractKeywords(storyText)
  const themes = extractThemes(storyText)
  const emotion = analyzeEmotion(storyText)
  const buildingConcepts = generateBuildingConcepts(keywords, themes)
  const architecturalStyles = suggestArchitecturalStyles(keywords, themes, emotion)
  
  const colorKeywords = keywords.filter(k => k.type === 'color').map(k => k.value)
  
  const analysis = {
    keywords: keywords,
    themes: themes,
    emotion: emotion,
    buildingConcepts: buildingConcepts,
    architecturalStyles: architecturalStyles,
    colorPalette: colorKeywords.length > 0 ? colorKeywords : ['gray', 'brown', 'green'],
    timestamp: Date.now()
  }
  
  log('Analysis complete:')
  log('- Keywords:', keywords.length)
  log('- Themes:', themes.join(', '))
  log('- Emotion:', emotion)
  log('- Building concepts:', buildingConcepts.length)
  log('- Styles:', architecturalStyles.join(', '))
  log('- Colors:', analysis.colorPalette.join(', '))
  
  return analysis
}

// Save blueprint to file
function saveBlueprint(analysis) {
  const outputPath = path.join(__dirname, '../../outputs/story_blueprint.json')
  fs.mkdirSync(path.dirname(outputPath), { recursive: true })
  fs.writeFileSync(outputPath, JSON.stringify(analysis, null, 2))
  log('Blueprint saved to:', outputPath)
}

bot.once('spawn', async () => {
  log('Story Analyzer Bot spawned')
  
  // Poll command bus
  setInterval(() => bus.poll(), 400)
  
  bus.on('COMMAND', async (cmd) => {
    try {
      const action = String(cmd.action || '').toUpperCase()
      
      if (action === 'ANALYZE_STORY') {
        const storyText = cmd.data || cmd.story || ''
        
        if (!storyText) {
          log('ERROR: No story text provided')
          return
        }
        
        const analysis = analyzeStory(storyText)
        saveBlueprint(analysis)
        
        // Send results back via command bus
        log('Story analysis complete. Results saved.')
      } else if (action === 'PING') {
        log('pong')
      }
    } catch (e) {
      log('ERROR:', e?.message || e)
    }
  })
  
  log('Ready to analyze stories!')
})

bot.on('kicked', (r) => log('kicked:', r))
bot.on('error', (e) => log('error:', e?.message || e))

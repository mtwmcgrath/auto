const fs = require('fs')
const path = require('path')

/**
 * Story Input Handler
 * Processes text stories and prepares them for the bot system
 */

function log(...a) { console.log('[STORY_INPUT]', ...a) }

/**
 * Process story input
 * @param {string} storyText - The story text from user
 * @returns {object} Processed story data
 */
function processStoryInput(storyText) {
  log('Processing story input...')
  log('Length:', storyText.length, 'characters')
  
  // Clean the text
  const cleanText = storyText.trim()
  
  // Extract sentences
  const sentences = cleanText
    .split(/[.!?]+/)
    .map(s => s.trim())
    .filter(s => s.length > 0)
  
  log('Extracted', sentences.length, 'sentences')
  
  // Prepare for Story Analyzer Bot
  const processedData = {
    type: 'story',
    raw: cleanText,
    sentences: sentences,
    wordCount: cleanText.split(/\s+/).length,
    timestamp: Date.now()
  }
  
  return processedData
}

/**
 * Save story input to file
 */
function saveStoryInput(storyData, filename = null) {
  const outputDir = path.join(__dirname, '../outputs/inputs')
  fs.mkdirSync(outputDir, { recursive: true })
  
  const outputFile = filename || `story_${Date.now()}.json`
  const outputPath = path.join(outputDir, outputFile)
  
  fs.writeFileSync(outputPath, JSON.stringify(storyData, null, 2))
  log('Story input saved to:', outputPath)
  
  return outputPath
}

/**
 * Example story inputs
 */
const EXAMPLE_STORIES = {
  fantasy_kingdom: `
    Một vương quốc kỳ diệu nơi các pháp sư sống trong những tòa tháp cao vút.
    Thành phố được xây dựng xung quanh một hồ nước phát sáng với ánh sáng ma thuật.
    Có những cây cầu pha lê bắc qua các kênh đào.
    Phong cách kiến trúc pha trộn giữa Gothic và Fantasy.
    Màu chủ đạo: tím, xanh dương và bạc.
  `,
  
  peaceful_village: `
    Một ngôi làng yên bình bên sông, với những căn nhà gỗ nhỏ.
    Có cầu tre bắc qua dòng sông trong xanh.
    Ruộng lúa vàng trải dài khắp nơi.
    Không khí thanh bình với tiếng chim hót.
    Phong cách kiến trúc đơn giản, gần gũi với thiên nhiên.
  `,
  
  medieval_fortress: `
    Một pháo đài đá kiên cố trên đỉnh núi cao.
    Có thành lũy dày và tháp canh ở bốn góc.
    Cổng thành bằng sắt kiên cố.
    Bên trong có kho vũ khí và doanh trại.
    Phong cách kiến trúc Medieval với tường đá xám.
  `
}

/**
 * Load story from file
 */
function loadStoryFromFile(filepath) {
  if (!fs.existsSync(filepath)) {
    log('ERROR: Story file not found:', filepath)
    return null
  }
  
  const content = fs.readFileSync(filepath, 'utf8')
  
  // Check if JSON or plain text
  try {
    return JSON.parse(content)
  } catch {
    // Plain text story
    return processStoryInput(content)
  }
}

// Export functions
module.exports = {
  processStoryInput,
  saveStoryInput,
  loadStoryFromFile,
  EXAMPLE_STORIES
}

// CLI usage
if (require.main === module) {
  const args = process.argv.slice(2)
  
  if (args.length === 0) {
    console.log('Usage: node story_input_handler.js <story_file>')
    console.log('Example stories available:')
    Object.keys(EXAMPLE_STORIES).forEach(key => {
      console.log('-', key)
    })
    process.exit(0)
  }
  
  const storyFile = args[0]
  
  // Check if it's an example story
  if (EXAMPLE_STORIES[storyFile]) {
    log('Using example story:', storyFile)
    const processed = processStoryInput(EXAMPLE_STORIES[storyFile])
    const savedPath = saveStoryInput(processed, `${storyFile}.json`)
    log('Processed and saved!')
  } else {
    // Load from file
    const story = loadStoryFromFile(storyFile)
    if (story) {
      log('Story loaded successfully')
      console.log(JSON.stringify(story, null, 2))
    }
  }
}

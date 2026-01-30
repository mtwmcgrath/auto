/**
 * STORY ANALYZER BOT - Layer 1: AI Creative
 * Uses NLP to parse stories and extract building requirements
 */

require('dotenv').config();
const { createBot } = require('../_common');
const { getCommandBus } = require('../../src/command_bus');

const BOT_NAME = 'StoryAnalyzer';
const bot = createBot(BOT_NAME);
const bus = getCommandBus();

function log(...args) {
  console.log('[STORY_ANALYZER]', ...args);
}

// Simple NLP patterns for Vietnamese and English
const BUILDING_PATTERNS = {
  // Vietnamese
  vi: {
    castle: /lâu đài|thành|dinh thự/gi,
    tower: /tháp|tòa|cao ốc/gi,
    house: /nhà|căn hộ|biệt thự/gi,
    wall: /tường|thành quách/gi,
    bridge: /cầu|cống/gi,
    temple: /đền|chùa|miếu/gi
  },
  // English
  en: {
    castle: /castle|fortress|citadel/gi,
    tower: /tower|spire|skyscraper/gi,
    house: /house|home|building|structure/gi,
    wall: /wall|barrier|fence/gi,
    bridge: /bridge/gi,
    temple: /temple|shrine|church/gi
  }
};

// Material patterns
const MATERIAL_PATTERNS = {
  vi: {
    white: /trắng|bạch/gi,
    stone: /đá|thạch/gi,
    wood: /gỗ|gỗ|mộc/gi,
    brick: /gạch|brick/gi,
    gold: /vàng|kim/gi
  },
  en: {
    white: /white/gi,
    stone: /stone|rock/gi,
    wood: /wood|wooden|oak/gi,
    brick: /brick/gi,
    gold: /gold|golden/gi
  }
};

// Minecraft block mapping
const BLOCK_MAPPING = {
  white: 'white_concrete',
  stone: 'stone_bricks',
  wood: 'oak_planks',
  brick: 'bricks',
  gold: 'gold_block'
};

bot.once('spawn', () => {
  log('🧠 Story Analyzer Bot spawned');
  bot.chat('/gamemode spectator');
  
  setInterval(() => bus.poll(), 500);
  
  bus.on('COMMAND', async (cmd) => {
    if (cmd.target === 'story_analyzer' || cmd.type === 'ANALYZE_INPUT') {
      await analyzeStory(cmd.data);
    }
  });
});

/**
 * Main story analysis function
 */
async function analyzeStory(data) {
  log('📖 Analyzing story input...');
  
  const { input, type } = data;
  
  if (type === 'story') {
    const blueprint = parseStory(input);
    log('✅ Story analysis complete');
    log('Blueprint:', JSON.stringify(blueprint, null, 2));
    
    // Send blueprint back to orchestrator
    await bus.send({
      type: 'BLUEPRINT_READY',
      target: 'grand_orchestrator',
      data: { blueprint }
    });
  } else if (type === 'image') {
    log('⚠️ Image analysis not yet implemented - delegating to image_vision_bot');
    await bus.send({
      type: 'ANALYZE_IMAGE',
      target: 'image_vision_bot',
      data: data
    });
  }
}

/**
 * Parse story text into structured blueprint
 */
function parseStory(storyText) {
  log('Parsing story text...');
  
  const blueprint = {
    buildings: [],
    materials: {},
    dimensions: {},
    theme: 'medieval',
    metadata: {
      parsedAt: Date.now(),
      language: detectLanguage(storyText)
    }
  };
  
  // Detect language
  const lang = blueprint.metadata.language;
  const buildingPatterns = BUILDING_PATTERNS[lang] || BUILDING_PATTERNS.en;
  const materialPatterns = MATERIAL_PATTERNS[lang] || MATERIAL_PATTERNS.en;
  
  // Extract buildings
  for (const [buildingType, pattern] of Object.entries(buildingPatterns)) {
    const matches = storyText.match(pattern);
    if (matches) {
      blueprint.buildings.push({
        type: buildingType,
        count: matches.length,
        priority: getBuildingPriority(buildingType)
      });
    }
  }
  
  // Extract materials
  for (const [material, pattern] of Object.entries(materialPatterns)) {
    if (pattern.test(storyText)) {
      blueprint.materials[material] = BLOCK_MAPPING[material] || 'stone';
    }
  }
  
  // Extract dimensions (numbers in text)
  const numbers = storyText.match(/\d+/g);
  if (numbers && numbers.length > 0) {
    blueprint.dimensions = {
      height: parseInt(numbers[0]) || 20,
      width: parseInt(numbers[1]) || 30,
      length: parseInt(numbers[2]) || 30
    };
  } else {
    // Default dimensions
    blueprint.dimensions = {
      height: 20,
      width: 30,
      length: 30
    };
  }
  
  // Extract count keywords (e.g., "4 towers")
  const countMatches = storyText.match(/(\d+)\s*(tháp|tower|nhà|house|tòa)/gi);
  if (countMatches) {
    log('Found count specifications:', countMatches);
  }
  
  return blueprint;
}

/**
 * Detect language (simple heuristic)
 */
function detectLanguage(text) {
  // Check for Vietnamese characters
  const vietnameseChars = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/gi;
  
  if (vietnameseChars.test(text)) {
    return 'vi';
  }
  return 'en';
}

/**
 * Get building priority for construction order
 */
function getBuildingPriority(buildingType) {
  const priorities = {
    wall: 1,      // Build walls first for security
    house: 2,     // Then houses
    tower: 3,     // Towers
    castle: 4,    // Castle/main structure
    bridge: 5,    // Infrastructure
    temple: 6     // Decorative last
  };
  
  return priorities[buildingType] || 5;
}

/**
 * Example story processing
 */
function exampleUsage() {
  // Example Vietnamese story
  const viStory = "Lâu đài trắng với 4 tháp cao 30 blocks";
  const blueprint1 = parseStory(viStory);
  log('Example VI:', blueprint1);
  
  // Example English story
  const enStory = "A white castle with 4 towers, each 30 blocks tall";
  const blueprint2 = parseStory(enStory);
  log('Example EN:', blueprint2);
}

module.exports = { bot, parseStory, analyzeStory };

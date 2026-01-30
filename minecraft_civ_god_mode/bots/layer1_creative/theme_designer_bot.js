require('dotenv').config()
const { createBot, sleep } = require('../_common')
const { getCommandBus } = require('../../src/command_bus')

const BOT_NAME = process.env.MC_BOT_THEME_DESIGNER_USERNAME || 'ThemeDesignerBot'
const bot = createBot(BOT_NAME)
const bus = getCommandBus()

function log(...a) { console.log('[THEME_DESIGNER]', ...a) }

// Theme specifications
const THEMES = {
  medieval: {
    blocks: {
      primary: ['stone_bricks', 'cobblestone', 'oak_planks'],
      secondary: ['oak_logs', 'dark_oak_planks'],
      accent: ['iron_bars', 'torch'],
      roof: ['oak_stairs', 'stone_brick_stairs']
    },
    decorations: ['lantern', 'flower_pot', 'banner'],
    style: 'rustic'
  },
  fantasy: {
    blocks: {
      primary: ['purpur_block', 'end_stone_bricks', 'quartz_block'],
      secondary: ['amethyst_block', 'sea_lantern'],
      accent: ['glowstone', 'crying_obsidian'],
      roof: ['purpur_stairs', 'prismarine_stairs']
    },
    decorations: ['sea_lantern', 'end_rod', 'brewing_stand'],
    style: 'magical'
  },
  modern: {
    blocks: {
      primary: ['white_concrete', 'light_gray_concrete', 'glass'],
      secondary: ['iron_block', 'quartz_block'],
      accent: ['redstone_lamp', 'sea_lantern'],
      roof: ['smooth_quartz', 'white_concrete']
    },
    decorations: ['redstone_lamp', 'iron_bars', 'lever'],
    style: 'contemporary'
  },
  steampunk: {
    blocks: {
      primary: ['copper_block', 'iron_block', 'dark_oak_planks'],
      secondary: ['oxidized_copper', 'coal_block'],
      accent: ['redstone_lamp', 'hopper', 'piston'],
      roof: ['copper_block', 'dark_oak_stairs']
    },
    decorations: ['lever', 'tripwire_hook', 'redstone'],
    style: 'industrial'
  },
  oriental: {
    blocks: {
      primary: ['red_concrete', 'orange_terracotta', 'spruce_planks'],
      secondary: ['gold_block', 'black_concrete'],
      accent: ['lantern', 'bamboo'],
      roof: ['red_nether_brick_stairs', 'nether_brick_stairs']
    },
    decorations: ['lantern', 'bamboo', 'cherry_leaves'],
    style: 'asian'
  }
}

// Generate theme specification
function createThemeSpec(themeName, colorPalette = []) {
  log('Creating theme specification for:', themeName)
  
  const baseTheme = THEMES[themeName] || THEMES.medieval
  
  // Apply color overrides if provided
  if (colorPalette.length > 0) {
    log('Applying color palette:', colorPalette.join(', '))
    
    // Map colors to Minecraft blocks
    const colorBlockMap = {
      red: 'red_concrete',
      blue: 'blue_concrete',
      green: 'green_concrete',
      purple: 'purple_concrete',
      white: 'white_concrete',
      black: 'black_concrete',
      silver: 'light_gray_concrete',
      gold: 'yellow_concrete',
      orange: 'orange_concrete',
      pink: 'pink_concrete'
    }
    
    colorPalette.forEach((color, idx) => {
      if (colorBlockMap[color]) {
        if (idx === 0) baseTheme.blocks.primary.push(colorBlockMap[color])
        else if (idx === 1) baseTheme.blocks.secondary.push(colorBlockMap[color])
        else baseTheme.blocks.accent.push(colorBlockMap[color])
      }
    })
  }
  
  const themeSpec = {
    name: themeName,
    style: baseTheme.style,
    palette: baseTheme.blocks,
    decorations: baseTheme.decorations,
    guidelines: {
      wallHeight: themeName === 'modern' ? 4 : 5,
      roofType: themeName === 'modern' ? 'flat' : 'gabled',
      windowSpacing: 3,
      doorType: themeName === 'modern' ? 'iron_door' : 'oak_door'
    },
    timestamp: Date.now()
  }
  
  log('Theme specification created')
  return themeSpec
}

// Select appropriate blocks for construction
function selectBlocks(themeSpec, structureType) {
  const selection = {
    walls: themeSpec.palette.primary[0],
    floor: themeSpec.palette.primary[1] || themeSpec.palette.primary[0],
    roof: themeSpec.palette.roof[0],
    decoration: themeSpec.decorations[0]
  }
  
  // Adjust based on structure type
  if (structureType === 'tower') {
    selection.walls = themeSpec.palette.secondary[0] || selection.walls
  } else if (structureType === 'house') {
    selection.walls = themeSpec.palette.primary[2] || selection.walls
  }
  
  return selection
}

bot.once('spawn', async () => {
  log('Theme Designer Bot spawned')
  log('Available themes:', Object.keys(THEMES).join(', '))
  
  setInterval(() => bus.poll(), 400)
  
  bus.on('COMMAND', async (cmd) => {
    try {
      const action = String(cmd.action || '').toUpperCase()
      
      if (action === 'CREATE_THEME') {
        const themeName = cmd.theme || 'medieval'
        const colorPalette = cmd.colors || []
        
        const themeSpec = createThemeSpec(themeName, colorPalette)
        log('Theme specification ready:', themeName)
        
        // Store for other bots to use
        const fs = require('fs')
        const path = require('path')
        const outputPath = path.join(__dirname, '../../outputs/theme_spec.json')
        fs.mkdirSync(path.dirname(outputPath), { recursive: true })
        fs.writeFileSync(outputPath, JSON.stringify(themeSpec, null, 2))
        
      } else if (action === 'SELECT_BLOCKS') {
        const structureType = cmd.structureType || 'house'
        // Would return block selection based on loaded theme
        log('Block selection for:', structureType)
        
      } else if (action === 'PING') {
        log('pong')
      }
    } catch (e) {
      log('ERROR:', e?.message || e)
    }
  })
  
  log('Ready to design themes!')
})

bot.on('kicked', (r) => log('kicked:', r))
bot.on('error', (e) => log('error:', e?.message || e))

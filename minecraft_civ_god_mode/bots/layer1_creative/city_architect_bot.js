require('dotenv').config()
const { createBot, sleep } = require('../_common')
const { getCommandBus } = require('../../src/command_bus')
const fs = require('fs')
const path = require('path')

const BOT_NAME = process.env.MC_BOT_CITY_ARCHITECT_USERNAME || 'CityArchitectBot'
const bot = createBot(BOT_NAME)
const bus = getCommandBus()

function log(...a) { console.log('[CITY_ARCHITECT]', ...a) }

// Generate city zones
function generateZones(size = 'medium') {
  const zones = {}
  
  if (size === 'small') {
    zones.residential = { x: 0, z: 0, width: 40, depth: 40 }
    zones.commercial = { x: 50, z: 0, width: 30, depth: 30 }
  } else if (size === 'medium') {
    zones.residential = { x: 0, z: 0, width: 60, depth: 60 }
    zones.commercial = { x: 70, z: 0, width: 40, depth: 40 }
    zones.industrial = { x: 120, z: 0, width: 50, depth: 50 }
  } else { // large
    zones.residential = { x: 0, z: 0, width: 100, depth: 100 }
    zones.commercial = { x: 110, z: 0, width: 80, depth: 80 }
    zones.industrial = { x: 200, z: 0, width: 80, depth: 80 }
    zones.parks = { x: 50, z: 110, width: 60, depth: 40 }
  }
  
  return zones
}

// Generate road network
function generateRoadNetwork(zones) {
  const roads = []
  
  // Main horizontal roads
  roads.push({
    type: 'main',
    start: { x: -10, z: 0 },
    end: { x: 300, z: 0 }
  })
  
  roads.push({
    type: 'main',
    start: { x: -10, z: 60 },
    end: { x: 300, z: 60 }
  })
  
  // Main vertical roads
  roads.push({
    type: 'main',
    start: { x: 30, z: -10 },
    end: { x: 30, z: 150 }
  })
  
  roads.push({
    type: 'main',
    start: { x: 90, z: -10 },
    end: { x: 90, z: 150 }
  })
  
  // Secondary roads within zones
  Object.entries(zones).forEach(([name, zone]) => {
    roads.push({
      type: 'secondary',
      start: { x: zone.x, z: zone.z + zone.depth/2 },
      end: { x: zone.x + zone.width, z: zone.z + zone.depth/2 }
    })
  })
  
  return roads
}

// Generate building plots
function generateBuildingPlots(zones, buildingConcepts = []) {
  const plots = []
  
  Object.entries(zones).forEach(([zoneName, zone]) => {
    const plotSize = zoneName === 'residential' ? 10 : 15
    const spacing = 3
    
    for (let x = zone.x; x < zone.x + zone.width; x += plotSize + spacing) {
      for (let z = zone.z; z < zone.z + zone.depth; z += plotSize + spacing) {
        plots.push({
          zone: zoneName,
          x: x,
          z: z,
          width: plotSize,
          depth: plotSize,
          buildingType: null // to be assigned
        })
      }
    }
  })
  
  // Assign building types from concepts
  if (buildingConcepts.length > 0) {
    let conceptIndex = 0
    plots.forEach(plot => {
      if (conceptIndex < buildingConcepts.length) {
        const concept = buildingConcepts[conceptIndex]
        plot.buildingType = concept.type
        plot.priority = concept.priority
        conceptIndex = (conceptIndex + 1) % buildingConcepts.length
      }
    })
  }
  
  return plots
}

// Plan city layout
function planCity(vision) {
  log('Planning city based on vision:', vision?.theme)
  
  const size = vision?.scale || 'medium'
  const zones = generateZones(size)
  const roads = generateRoadNetwork(zones)
  const plots = generateBuildingPlots(zones, vision?.buildingConcepts || [])
  
  const cityPlan = {
    version: '1.0',
    timestamp: Date.now(),
    theme: vision?.theme || 'medieval',
    style: vision?.style || 'default',
    zones: zones,
    roads: roads,
    plots: plots,
    landmarks: [],
    publicSpaces: []
  }
  
  // Add landmarks based on theme
  if (vision?.theme === 'fantasy' || vision?.theme === 'magic') {
    cityPlan.landmarks.push(
      { type: 'wizard_tower', x: 50, z: 50, height: 40 },
      { type: 'magic_fountain', x: 100, z: 100 }
    )
  } else if (vision?.theme === 'medieval') {
    cityPlan.landmarks.push(
      { type: 'castle', x: 150, z: 75, height: 30 },
      { type: 'town_square', x: 75, z: 75 }
    )
  }
  
  log('City plan created:')
  log('- Zones:', Object.keys(zones).length)
  log('- Roads:', roads.length)
  log('- Building plots:', plots.length)
  log('- Landmarks:', cityPlan.landmarks.length)
  
  return cityPlan
}

// Optimize space usage
function optimizeSpaceUsage(cityPlan) {
  log('Optimizing space usage...')
  
  // Remove overlapping plots
  const optimizedPlots = []
  cityPlan.plots.forEach(plot => {
    const overlaps = cityPlan.roads.some(road => {
      // Simple overlap detection
      return false // simplified for demo
    })
    if (!overlaps) {
      optimizedPlots.push(plot)
    }
  })
  
  cityPlan.plots = optimizedPlots
  log('Optimized plots:', optimizedPlots.length)
  
  return cityPlan
}

// Save city plan
function saveCityPlan(cityPlan) {
  const outputPath = path.join(__dirname, '../../outputs/city_plan.json')
  fs.mkdirSync(path.dirname(outputPath), { recursive: true })
  fs.writeFileSync(outputPath, JSON.stringify(cityPlan, null, 2))
  log('City plan saved to:', outputPath)
}

bot.once('spawn', async () => {
  log('City Architect Bot spawned')
  
  setInterval(() => bus.poll(), 400)
  
  bus.on('COMMAND', async (cmd) => {
    try {
      const action = String(cmd.action || '').toUpperCase()
      
      if (action === 'PLAN_CITY') {
        const vision = cmd.vision || {}
        
        let cityPlan = planCity(vision)
        cityPlan = optimizeSpaceUsage(cityPlan)
        saveCityPlan(cityPlan)
        
        log('City planning complete!')
      } else if (action === 'PING') {
        log('pong')
      }
    } catch (e) {
      log('ERROR:', e?.message || e)
    }
  })
  
  log('Ready to plan cities!')
})

bot.on('kicked', (r) => log('kicked:', r))
bot.on('error', (e) => log('error:', e?.message || e))

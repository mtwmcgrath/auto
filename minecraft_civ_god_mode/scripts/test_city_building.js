/**
 * Test script for City Building features
 * Kiểm tra các chức năng chặt cây và xây dựng thành phố
 */

const { getCommandBus } = require('../src/command_bus')
const { readJson } = require('../src/utils')
const path = require('path')

const bus = getCommandBus()

console.log('=== City Building Test Script ===')
console.log('Testing integrated bot commands...\n')

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function runTests() {
  // Đợi một chút để bots khởi động
  console.log('Waiting for bots to initialize...')
  await sleep(3000)
  
  // Test 1: Ping all bots
  console.log('\n[Test 1] Pinging bots...')
  bus.send({ action: 'PING' })
  await sleep(1000)
  
  // Test 2: Request stats
  console.log('\n[Test 2] Requesting stats...')
  bus.send({ action: 'STATS' })
  await sleep(1000)
  
  // Test 3: Tree chopping command
  console.log('\n[Test 3] Testing tree chopping...')
  bus.send({ 
    action: 'CHOP_TREE_ADVANCED',
    params: { count: 3 }
  })
  await sleep(5000)
  
  // Test 4: Build a simple structure
  console.log('\n[Test 4] Testing building...')
  bus.send({
    action: 'BUILD_HOUSE',
    params: { x: 100, y: 64, z: 100 }
  })
  await sleep(8000)
  
  // Test 5: Load city building project
  console.log('\n[Test 5] Loading city building project...')
  try {
    const projectPath = path.join(__dirname, '../data/events/city_building_project.json')
    const project = readJson(projectPath)
    console.log('Loaded project:', project.name)
    console.log('Phases:', project.phases.length)
    console.log('Buildings:', project.city_blueprint.buildings.length)
  } catch (err) {
    console.log('Error loading project:', err.message)
  }
  
  // Test 6: Start automated building (commented out - requires supervision)
  console.log('\n[Test 6] Automated building test (manual start required)')
  console.log('To start automated building, send command: START_AUTO_BUILD')
  console.log('To stop: STOP_AUTO_BUILD')
  
  // Uncomment to actually start:
  // bus.send({ action: 'START_AUTO_BUILD' })
  
  console.log('\n=== Tests Complete ===')
  console.log('Check bot logs for results')
  console.log('Bots will continue running...\n')
}

// Run tests
runTests().catch(err => {
  console.error('Test error:', err)
  process.exit(1)
})

// Keep script alive
process.on('SIGINT', () => {
  console.log('\nTest script terminated')
  process.exit(0)
})

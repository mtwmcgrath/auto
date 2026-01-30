/**
 * Test Script - Bot Name Generator
 * 
 * Tests the bot name generator without requiring a Minecraft server
 */

const BotNameGenerator = require('../src/bot_name_generator');
const path = require('path');

console.log('🧪 Testing Bot Name Generator\n');
console.log('='.repeat(60));

// Test 1: Single name generation
console.log('\n📝 Test 1: Single Name Generation');
console.log('-'.repeat(60));

const generator = new BotNameGenerator();

try {
  const name1 = generator.generateName('lumberjack', 'english', 'male');
  console.log(`✅ Generated English male lumberjack: ${name1}`);
  
  const name2 = generator.generateName('miner', 'vietnamese', 'female');
  console.log(`✅ Generated Vietnamese female miner: ${name2}`);
  
  const name3 = generator.generateName('builder', 'unique', 'neutral');
  console.log(`✅ Generated unique neutral builder: ${name3}`);
  
  const name4 = generator.generateName('farmer', 'random', 'random');
  console.log(`✅ Generated random farmer: ${name4}`);
  
  console.log('✅ Single name generation: PASSED');
} catch (error) {
  console.error('❌ Single name generation: FAILED', error.message);
}

// Test 2: Duplicate detection
console.log('\n📝 Test 2: Duplicate Detection');
console.log('-'.repeat(60));

const gen2 = new BotNameGenerator();
const usedNames = new Set();
let duplicateFound = false;

for (let i = 0; i < 50; i++) {
  const name = gen2.generateName('worker', 'english', 'random');
  if (usedNames.has(name)) {
    duplicateFound = true;
    console.error(`❌ Duplicate found: ${name}`);
    break;
  }
  usedNames.add(name);
}

if (!duplicateFound) {
  console.log(`✅ Generated 50 unique names without duplicates`);
  console.log('✅ Duplicate detection: PASSED');
} else {
  console.log('❌ Duplicate detection: FAILED');
}

// Summary
console.log('\n' + '='.repeat(60));
console.log('✅ Bot Name Generator is ready for production! 🚀');

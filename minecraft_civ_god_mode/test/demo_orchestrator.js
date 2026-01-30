/**
 * Demo Script - Grand Orchestrator (Dry Run)
 * 
 * Demonstrates what the Grand Orchestrator output looks like
 * without actually connecting to a Minecraft server
 */

const BotNameGenerator = require('../src/bot_name_generator');

console.log('🎭 Grand Orchestrator Demo (Dry Run)\n');
console.log('📋 Configuration: 100 bots max');
console.log('🌐 Server: 127.0.0.1:25565 (offline mode)');

console.log('\n🚀 Starting bot army initialization...\n');

// Generate names
console.log('🎲 Generating new bot names...');

const generator = new BotNameGenerator();
const bots = generator.generateBotArmy(100, {
  distribution: {
    english: 40,
    vietnamese: 30,
    chinese: 10,
    japanese: 10,
    korean: 5,
    unique: 5
  }
});

console.log(`\n✅ Generated ${bots.length} human-like names!`);
console.log('📊 Distribution:', generator.calculateDistribution());

console.log('\n👥 Bot Army Roster:');
console.log('='.repeat(50));

// Show first 20 bots
const roleEmojis = {
  lumberjack: '🪓',
  miner: '⛏️',
  farmer: '🌾',
  fisherman: '🎣',
  wall_builder: '🧱',
  foundation_builder: '🏗️',
  roof_builder: '🏠',
  interior_designer: '🎨',
  road_paver: '🛣️',
  landscaper: '🌳',
  skyscraper_specialist: '🏙️',
  detail_worker: '✨',
  courier: '📦',
  inventory_manager: '📋',
  toolsmith: '🔨',
  security: '🛡️',
  maintenance: '🔧',
  statue_builder: '🗿',
  sign_writer: '📝',
  redstone_engineer: '⚡',
  artist: '🎭'
};

// Simulate bot connection messages
bots.slice(0, 20).forEach(bot => {
  const emoji = roleEmojis[bot.role] || '👷';
  console.log(`  ✅ ${bot.name} ${emoji} (${bot.role}) - ${bot.team} team`);
});

console.log(`  ... and ${bots.length - 20} more bots\n`);

console.log('='.repeat(50));
console.log(`\n🎉 ${bots.length} builders ready to work! 🚀\n`);

// Show statistics
const stats = generator.getStats();

console.log('�� Bot Army Statistics:');
console.log('─'.repeat(50));
console.log(`Total Bots: ${stats.totalBots}`);
console.log('\n🌍 Regional Distribution:');

for (const [region, count] of Object.entries(stats.distribution)) {
  const percentage = ((count / stats.totalBots) * 100).toFixed(1);
  console.log(`  ${region.padEnd(15)} ${count.toString().padStart(3)} (${percentage}%)`);
}

console.log('\n👥 Teams:');
for (const [team, count] of Object.entries(stats.teams)) {
  console.log(`  ${team.padEnd(15)} ${count.toString().padStart(3)} members`);
}

console.log('\n💼 Top Roles:');
const topRoles = stats.roles.slice(0, 10);
for (const roleInfo of topRoles) {
  const emoji = roleEmojis[roleInfo.role] || '👷';
  console.log(`  ${emoji} ${roleInfo.role.padEnd(20)} ${roleInfo.count.toString().padStart(2)} workers`);
  console.log(`     Examples: ${roleInfo.names.join(', ')}`);
}

console.log('─'.repeat(50));

console.log('\n✨ COMPARISON:\n');
console.log('❌ OLD SYSTEM (bot_ prefix):');
console.log('   bot_lumberjack_01, bot_lumberjack_02, bot_miner_01...');
console.log('\n✅ NEW SYSTEM (human names):');
const sampleNames = bots.slice(0, 10).map(b => b.name).join(', ');
console.log(`   ${sampleNames}...\n`);

console.log('🎬 VIDEO HOOK EXAMPLES:\n');
console.log(`   "I hired ${bots[0].name}, ${bots[1].name}, and ${bots.length - 2} others to build a CITY! 🏙️"`);
console.log(`   "Watch ${bots[0].name} chop 1000 TREES in 10 minutes! 🪓🔥"`);
console.log(`   "${bots.length} people working together = THIS! 🤯"\n`);

console.log('✅ Demo completed! The system is ready for production! 🚀');

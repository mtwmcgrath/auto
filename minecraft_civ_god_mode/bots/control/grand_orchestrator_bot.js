/**
 * Grand Orchestrator Bot
 * 
 * Manages 100-bot army with human-like names
 * - Creates and coordinates 100 bots
 * - Assigns roles based on configuration
 * - Uses BotNameGenerator for human names
 * - Tracks bot status and assignments
 */

require('dotenv').config();
const mineflayer = require('mineflayer');
const path = require('path');
const fs = require('fs');
const BotNameGenerator = require('../../src/bot_name_generator');

// Load configuration
const configPath = path.join(__dirname, '../../config/bot_army_config.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

class GrandOrchestrator {
  constructor() {
    this.nameGenerator = new BotNameGenerator();
    this.bots = new Map(); // name → bot instance
    this.maxBots = config.orchestratorConfig.maxBots || 100;
    this.spawnDelay = config.orchestratorConfig.spawnDelay || 100;
    
    // Server configuration
    this.serverConfig = {
      host: process.env.MC_HOST || config.serverConfig.host || '127.0.0.1',
      port: Number(process.env.MC_PORT) || config.serverConfig.port || 25565,
      auth: process.env.MC_AUTH || config.serverConfig.auth || 'offline'
    };
    
    console.log('🎭 Grand Orchestrator initialized');
    console.log(`📋 Configuration: ${this.maxBots} bots max`);
    console.log(`🌐 Server: ${this.serverConfig.host}:${this.serverConfig.port}`);
  }

  /**
   * Initialize bot army with human names
   */
  async initializeBotArmy() {
    console.log('\n🚀 Starting bot army initialization...\n');
    
    // Load existing mapping if available
    const mappingFile = path.join(__dirname, '../../', config.botNaming.mappingFile);
    if (fs.existsSync(mappingFile)) {
      console.log('📂 Loading existing name mapping...');
      this.nameGenerator.loadNameMapping(mappingFile);
    } else {
      console.log('🎲 Generating new bot names...');
      
      // Generate bot names with distribution from config
      const botNames = this.nameGenerator.generateBotArmy(this.maxBots, {
        distribution: config.botNaming.distribution,
        roles: this.flattenRoleCounts(config.botCounts)
      });
      
      console.log(`\n✅ Generated ${botNames.length} human-like names!`);
      console.log('📊 Distribution:', this.nameGenerator.calculateDistribution());
      
      // Save mapping
      if (config.botNaming.saveMapping) {
        this.nameGenerator.saveNameMapping(mappingFile);
      }
    }
    
    // Get all generated bots
    const allBots = Array.from(this.nameGenerator.nameMetadata.entries()).map(([name, metadata]) => ({
      name,
      ...metadata
    }));
    
    console.log('\n👥 Bot Army Roster:');
    console.log('='.repeat(50));
    
    // Create bots one by one
    for (let i = 0; i < allBots.length && i < this.maxBots; i++) {
      const botData = allBots[i];
      await this.createBot(botData.name, botData.role, botData.team);
      
      // Add delay between spawns to avoid overwhelming the server
      if (this.spawnDelay > 0) {
        await this.sleep(this.spawnDelay);
      }
    }
    
    console.log('\n' + '='.repeat(50));
    console.log(`\n🎉 ${this.bots.size} builders ready to work! 🚀\n`);
    
    // Print statistics
    this.printStats();
  }

  /**
   * Create a single bot with human name
   */
  async createBot(name, role, team) {
    try {
      const bot = mineflayer.createBot({
        host: this.serverConfig.host,
        port: this.serverConfig.port,
        username: name, // ← Human name like "Alex" or "Minh"
        auth: this.serverConfig.auth,
        hideErrors: true // Suppress connection errors for cleaner output
      });
      
      bot.role = role;
      bot.team = team;
      bot.humanName = name;
      
      // Handle bot events
      bot.once('spawn', () => {
        const emoji = this.getRoleEmoji(role);
        console.log(`  ✅ ${name} ${emoji} (${role}) - ${team} team`);
      });
      
      bot.on('kicked', (reason) => {
        console.log(`  ⚠️  ${name} was kicked: ${reason}`);
        this.bots.delete(name);
      });
      
      bot.on('error', (err) => {
        // Only log critical errors
        if (err.message.includes('ECONNREFUSED')) {
          console.log(`  ❌ ${name} - Cannot connect to server`);
        }
      });
      
      bot.on('end', () => {
        this.bots.delete(name);
      });
      
      this.bots.set(name, bot);
      
    } catch (error) {
      console.error(`  ❌ Failed to create bot "${name}":`, error.message);
    }
  }

  /**
   * Flatten role counts from config into simple object
   */
  flattenRoleCounts(botCounts) {
    const roles = {};
    
    for (const [category, categoryRoles] of Object.entries(botCounts)) {
      for (const [roleName, count] of Object.entries(categoryRoles)) {
        // Convert camelCase to snake_case (e.g., lumberjackWorkers → lumberjack)
        const normalizedRole = roleName
          .replace(/Workers?$/i, '')
          .replace(/([A-Z])/g, '_$1')
          .toLowerCase()
          .replace(/^_/, '');
        
        roles[normalizedRole] = count;
      }
    }
    
    return roles;
  }

  /**
   * Get emoji for role
   */
  getRoleEmoji(role) {
    const emojis = {
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
    
    return emojis[role] || '👷';
  }

  /**
   * Print statistics
   */
  printStats() {
    const stats = this.nameGenerator.getStats();
    
    console.log('\n📊 Bot Army Statistics:');
    console.log('─'.repeat(50));
    console.log(`Total Bots: ${stats.totalBots}`);
    console.log('\n🌍 Regional Distribution:');
    
    for (const [region, count] of Object.entries(stats.distribution)) {
      const percentage = ((count / stats.totalBots) * 100).toFixed(1);
      console.log(`  ${region.padEnd(15)} ${count.toString().padStart(3)} (${percentage}%)`)`);
    }
    
    console.log('\n👥 Teams:');
    for (const [team, count] of Object.entries(stats.teams)) {
      console.log(`  ${team.padEnd(15)} ${count.toString().padStart(3)} members`);
    }
    
    console.log('\n💼 Top Roles:');
    const topRoles = stats.roles.slice(0, 10);
    for (const roleInfo of topRoles) {
      const emoji = this.getRoleEmoji(roleInfo.role);
      console.log(`  ${emoji} ${roleInfo.role.padEnd(20)} ${roleInfo.count.toString().padStart(2)} workers`);
      console.log(`     Examples: ${roleInfo.names.join(', ')}`);
    }
    
    console.log('─'.repeat(50));
  }

  /**
   * Get bot by name
   */
  getBotByName(name) {
    return this.bots.get(name);
  }

  /**
   * Get all bots by role
   */
  getBotsByRole(role) {
    const names = this.nameGenerator.getNamesByRole(role);
    return names.map(name => this.bots.get(name)).filter(Boolean);
  }

  /**
   * Get all bots by team
   */
  getBotsByTeam(team) {
    const botsInTeam = [];
    
    for (const [name, bot] of this.bots.entries()) {
      if (bot.team === team) {
        botsInTeam.push(bot);
      }
    }
    
    return botsInTeam;
  }

  /**
   * Send command to specific bot
   */
  sendCommand(botName, command) {
    const bot = this.getBotByName(botName);
    
    if (!bot) {
      console.warn(`⚠️  Bot "${botName}" not found`);
      return false;
    }
    
    try {
      bot.chat(command);
      return true;
    } catch (error) {
      console.error(`❌ Failed to send command to ${botName}:`, error.message);
      return false;
    }
  }

  /**
   * Broadcast command to all bots
   */
  broadcastCommand(command) {
    let successCount = 0;
    
    for (const [name, bot] of this.bots.entries()) {
      try {
        bot.chat(command);
        successCount++;
      } catch (error) {
        console.error(`Failed to send to ${name}:`, error.message);
      }
    }
    
    console.log(`📢 Broadcast to ${successCount}/${this.bots.size} bots`);
    return successCount;
  }

  /**
   * Shutdown all bots
   */
  async shutdown() {
    console.log('\n🛑 Shutting down bot army...');
    
    for (const [name, bot] of this.bots.entries()) {
      try {
        bot.quit();
        console.log(`  👋 ${name} disconnected`);
      } catch (error) {
        console.error(`Failed to disconnect ${name}:`, error.message);
      }
    }
    
    this.bots.clear();
    console.log('✅ All bots disconnected');
  }

  /**
   * Sleep utility
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Run if executed directly
if (require.main === module) {
  const orchestrator = new GrandOrchestrator();
  
  // Handle graceful shutdown
  process.on('SIGINT', async () => {
    console.log('\n\n⚠️  Received SIGINT signal');
    await orchestrator.shutdown();
    process.exit(0);
  });
  
  process.on('SIGTERM', async () => {
    console.log('\n\n⚠️  Received SIGTERM signal');
    await orchestrator.shutdown();
    process.exit(0);
  });
  
  // Initialize bot army
  orchestrator.initializeBotArmy().catch(error => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });
}

module.exports = GrandOrchestrator;

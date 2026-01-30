#!/usr/bin/env node

/**
 * CLI Name Manager
 * 
 * Command-line interface for managing bot names
 * - List all bot names
 * - Regenerate names
 * - Find bot by name
 * - Get team roster
 * - Get role roster
 */

const path = require('path');
const fs = require('fs');
const BotNameGenerator = require('./bot_name_generator');

const MAPPING_FILE = path.join(__dirname, '../data/bot_names_mapping.json');
const CONFIG_FILE = path.join(__dirname, '../config/bot_army_config.json');

class CLINameManager {
  constructor() {
    this.generator = new BotNameGenerator();
    this.loadMapping();
  }

  loadMapping() {
    if (fs.existsSync(MAPPING_FILE)) {
      this.generator.loadNameMapping(MAPPING_FILE);
    } else {
      console.warn('⚠️  No mapping file found. Run "regenerate" command first.');
    }
  }

  saveMapping() {
    this.generator.saveNameMapping(MAPPING_FILE);
  }

  /**
   * List all bot names
   */
  list(options = {}) {
    const bots = Array.from(this.generator.nameMetadata.entries()).map(([name, metadata]) => ({
      name,
      ...metadata
    }));

    if (bots.length === 0) {
      console.log('No bots found. Run "regenerate" command first.');
      return;
    }

    console.log(`\n👥 ${bots.length} Bots:\n`);
    console.log('─'.repeat(60));

    // Filter by options
    let filteredBots = bots;
    if (options.role) {
      filteredBots = bots.filter(b => b.role === options.role);
    }
    if (options.team) {
      filteredBots = bots.filter(b => b.team === options.team);
    }
    if (options.region) {
      filteredBots = bots.filter(b => b.region === options.region);
    }

    // Display bots
    filteredBots.forEach((bot, index) => {
      const emoji = this.getRoleEmoji(bot.role);
      console.log(`${(index + 1).toString().padStart(3)}. ${bot.name.padEnd(20)} ${emoji} ${bot.role.padEnd(25)} (${bot.region})`);
    });

    console.log('─'.repeat(60));
    console.log(`Total: ${filteredBots.length} bots\n`);
  }

  /**
   * Regenerate all bot names
   */
  regenerate(options = {}) {
    console.log('🎲 Regenerating bot names...\n');

    // Load config
    const config = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));

    // Create new generator
    this.generator = new BotNameGenerator();

    // Flatten role counts
    const roles = this.flattenRoleCounts(config.botCounts);

    // Generate names
    const count = options.count || config.orchestratorConfig.maxBots || 100;
    const distribution = options.region 
      ? { [options.region]: 100 } 
      : config.botNaming.distribution;

    const bots = this.generator.generateBotArmy(count, {
      distribution,
      roles
    });

    console.log(`✅ Generated ${bots.length} new names!\n`);

    // Save to file
    this.saveMapping();

    // Show statistics
    this.stats();
  }

  /**
   * Find bot by name
   */
  find(name) {
    const bot = this.generator.findByName(name);

    if (!bot) {
      console.log(`❌ Bot "${name}" not found`);
      return;
    }

    console.log('\n🔍 Bot Information:\n');
    console.log('─'.repeat(40));
    console.log(`Name:     ${bot.name}`);
    console.log(`Role:     ${bot.role} ${this.getRoleEmoji(bot.role)}`);
    console.log(`Team:     ${bot.team}`);
    console.log(`Region:   ${bot.region}`);
    console.log(`Gender:   ${bot.gender}`);
    console.log('─'.repeat(40));
    console.log();
  }

  /**
   * Get team roster
   */
  team(teamName) {
    const bots = this.generator.getNamesByTeam(teamName);

    if (bots.length === 0) {
      console.log(`❌ No bots found for team "${teamName}"`);
      return;
    }

    console.log(`\n👥 ${teamName.toUpperCase()} Team (${bots.length} members):\n`);
    console.log('─'.repeat(50));

    // Group by role
    const byRole = {};
    for (const bot of bots) {
      if (!byRole[bot.role]) {
        byRole[bot.role] = [];
      }
      byRole[bot.role].push(bot.name);
    }

    // Display by role
    for (const [role, names] of Object.entries(byRole)) {
      const emoji = this.getRoleEmoji(role);
      console.log(`\n${emoji} ${role.toUpperCase()} (${names.length}):`);
      console.log(`  ${names.join(', ')}`);
    }

    console.log('\n' + '─'.repeat(50));
    console.log();
  }

  /**
   * Get role roster
   */
  role(roleName) {
    const names = this.generator.getNamesByRole(roleName);

    if (names.length === 0) {
      console.log(`❌ No bots found for role "${roleName}"`);
      return;
    }

    const emoji = this.getRoleEmoji(roleName);
    console.log(`\n${emoji} ${roleName.toUpperCase()} (${names.length} workers):\n`);
    console.log('─'.repeat(50));
    console.log(names.join(', '));
    console.log('─'.repeat(50));
    console.log();
  }

  /**
   * Show statistics
   */
  stats() {
    const stats = this.generator.getStats();

    console.log('\n📊 Bot Army Statistics:\n');
    console.log('─'.repeat(50));
    console.log(`Total Bots: ${stats.totalBots}\n`);

    console.log('🌍 Regional Distribution:');
    for (const [region, count] of Object.entries(stats.distribution)) {
      const percentage = ((count / stats.totalBots) * 100).toFixed(1);
      const bar = '█'.repeat(Math.round(percentage / 2));
      console.log(`  ${region.padEnd(15)} ${count.toString().padStart(3)} (${percentage}%) ${bar}`);
    }

    console.log('\n👥 Teams:');
    for (const [team, count] of Object.entries(stats.teams)) {
      const percentage = ((count / stats.totalBots) * 100).toFixed(1);
      console.log(`  ${team.padEnd(15)} ${count.toString().padStart(3)} (${percentage}%)`);
    }

    console.log('\n💼 Top Roles:');
    const topRoles = stats.roles.slice(0, 10);
    for (const roleInfo of topRoles) {
      const emoji = this.getRoleEmoji(roleInfo.role);
      console.log(`  ${emoji} ${roleInfo.role.padEnd(25)} ${roleInfo.count.toString().padStart(2)} workers`);
    }

    console.log('─'.repeat(50));
    console.log();
  }

  /**
   * Flatten role counts
   */
  flattenRoleCounts(botCounts) {
    const roles = {};
    
    for (const [category, categoryRoles] of Object.entries(botCounts)) {
      for (const [roleName, count] of Object.entries(categoryRoles)) {
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
   * Show help
   */
  help() {
    console.log(`
📝 Bot Name Manager CLI

Usage: node src/cli_name_manager.js <command> [options]

Commands:
  list                    List all bot names
  list --role <role>      List bots by role
  list --team <team>      List bots by team
  list --region <region>  List bots by region

  regenerate              Regenerate all bot names
  regenerate --count <n>  Regenerate with specific count
  regenerate --region <r> Regenerate with specific region

  find <name>             Find bot by name
  team <team>             Show team roster
  role <role>             Show role roster
  stats                   Show statistics
  help                    Show this help message

Examples:
  node src/cli_name_manager.js list
  node src/cli_name_manager.js list --role lumberjack
  node src/cli_name_manager.js list --team resource
  node src/cli_name_manager.js regenerate --region vietnamese
  node src/cli_name_manager.js find Alex
  node src/cli_name_manager.js team resource
  node src/cli_name_manager.js role miner
  node src/cli_name_manager.js stats
`);
  }
}

// CLI entry point
if (require.main === module) {
  const args = process.argv.slice(2);
  const command = args[0];
  
  const manager = new CLINameManager();

  try {
    switch (command) {
      case 'list': {
        const options = {};
        for (let i = 1; i < args.length; i += 2) {
          const flag = args[i].replace('--', '');
          const value = args[i + 1];
          options[flag] = value;
        }
        manager.list(options);
        break;
      }

      case 'regenerate': {
        const options = {};
        for (let i = 1; i < args.length; i += 2) {
          const flag = args[i].replace('--', '');
          const value = args[i + 1];
          options[flag] = flag === 'count' ? parseInt(value) : value;
        }
        manager.regenerate(options);
        break;
      }

      case 'find':
        if (!args[1]) {
          console.error('❌ Usage: find <name>');
          process.exit(1);
        }
        manager.find(args[1]);
        break;

      case 'team':
        if (!args[1]) {
          console.error('❌ Usage: team <team>');
          process.exit(1);
        }
        manager.team(args[1]);
        break;

      case 'role':
        if (!args[1]) {
          console.error('❌ Usage: role <role>');
          process.exit(1);
        }
        manager.role(args[1]);
        break;

      case 'stats':
        manager.stats();
        break;

      case 'help':
      case '--help':
      case '-h':
      default:
        manager.help();
        break;
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

module.exports = CLINameManager;

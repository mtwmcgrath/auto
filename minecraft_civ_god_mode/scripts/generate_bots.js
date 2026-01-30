#!/usr/bin/env node

/**
 * Bot File Generator
 * 
 * Automatically generates all 100+ bot files for the bot army
 * This script creates the file structure and basic implementations
 */

const fs = require('fs');
const path = require('path');

const BASE_DIR = path.join(__dirname, '..');

// Bot templates
const templates = {
  lumberjackWorker: (id) => `/**
 * Lumberjack Worker #${id}
 * Part of 20-worker lumberjack squad
 */

require('dotenv').config();
const { createBot } = require('../_common');
const { LumberjackWorker } = require('./lumberjack_worker_01');

const WORKER_ID = 'lumberjack_worker_${id}';

// Reuse implementation from worker_01
const worker = new LumberjackWorker(WORKER_ID);

if (require.main === module) {
  (async () => {
    await worker.initialize();
    console.log(\`✅ \${WORKER_ID} ready to work!\`);
  })();
}

module.exports = { worker };
`,

  minerWorker: (id) => `/**
 * Miner Worker #${id}
 * Part of 20-worker mining team
 */

require('dotenv').config();
const { createBot, sleep } = require('../_common');
const { pathfinder, Movements, goals } = require('mineflayer-pathfinder');

const WORKER_ID = 'miner_worker_${id}';

class MinerWorker {
  constructor(workerId = WORKER_ID) {
    this.workerId = workerId;
    this.bot = null;
    this.zone = null;
    this.oresMined = 0;
    this.isWorking = false;
  }
  
  async initialize() {
    this.bot = createBot(this.workerId);
    this.bot.loadPlugin(pathfinder);
    
    return new Promise((resolve) => {
      this.bot.once('spawn', async () => {
        const mcData = require('minecraft-data')(this.bot.version);
        const movements = new Movements(this.bot, mcData);
        this.bot.pathfinder.setMovements(movements);
        
        console.log(\`⛏️ \${this.workerId} spawned\`);
        resolve();
      });
    });
  }
  
  setZone(zone) {
    this.zone = zone;
    console.log(\`📍 \${this.workerId} assigned to \${zone.id}\`);
  }
  
  async startMining() {
    this.isWorking = true;
    console.log(\`⛏️ \${this.workerId} starting mining...\`);
    // Mining implementation here
  }
  
  getStatus() {
    return {
      id: this.workerId,
      zone: this.zone?.id || 'NONE',
      oresMined: this.oresMined,
      isWorking: this.isWorking
    };
  }
}

module.exports = { MinerWorker };

if (require.main === module) {
  (async () => {
    const miner = new MinerWorker();
    await miner.initialize();
  })();
}
`,

  wallBuilder: (id) => `/**
 * Wall Builder #${id}
 * Part of 10-builder construction team
 */

require('dotenv').config();
const { createBot } = require('../_common');
const { WallBuilder } = require('./wall_builder_01');

const BUILDER_ID = 'wall_builder_${id}';

// Reuse implementation from builder_01
const builder = new WallBuilder(BUILDER_ID);

if (require.main === module) {
  (async () => {
    await builder.initialize();
    console.log(\`✅ \${BUILDER_ID} ready to build walls!\`);
  })();
}

module.exports = { builder };
`,

  genericBot: (type, id) => `/**
 * ${type} #${id}
 * Part of the 100-bot army
 */

require('dotenv').config();
const { createBot } = require('../_common');

const BOT_ID = '${type.toLowerCase().replace(/\s+/g, '_')}_${id}';

class ${type.replace(/\s+/g, '')} {
  constructor(botId = BOT_ID) {
    this.botId = botId;
    this.bot = null;
    this.isActive = false;
  }
  
  async initialize() {
    this.bot = createBot(this.botId);
    
    return new Promise((resolve) => {
      this.bot.once('spawn', () => {
        console.log(\`✅ \${this.botId} spawned\`);
        this.isActive = true;
        resolve();
      });
    });
  }
  
  getStatus() {
    return {
      id: this.botId,
      isActive: this.isActive
    };
  }
}

module.exports = { ${type.replace(/\s+/g, '')} };

if (require.main === module) {
  (async () => {
    const bot = new ${type.replace(/\s+/g, '')}();
    await bot.initialize();
  })();
}
`
};

// Bot definitions
const botDefinitions = {
  resource: {
    lumberjackWorkers: { count: 20, start: 2, template: 'lumberjackWorker' },
    minerWorkers: { count: 20, start: 1, template: 'minerWorker' },
    farmers: { count: 3, start: 1, template: 'genericBot', type: 'Farmer' },
    fishermen: { count: 3, start: 1, template: 'genericBot', type: 'Fisherman' }
  },
  construction: {
    foundationBuilders: { count: 2, start: 1, template: 'genericBot', type: 'FoundationBuilder' },
    wallBuilders: { count: 10, start: 2, template: 'wallBuilder' },
    roofBuilders: { count: 2, start: 1, template: 'genericBot', type: 'RoofBuilder' },
    interiorDesigners: { count: 3, start: 1, template: 'genericBot', type: 'InteriorDesigner' },
    roadPavers: { count: 2, start: 1, template: 'genericBot', type: 'RoadPaver' },
    landscapers: { count: 2, start: 1, template: 'genericBot', type: 'Landscaper' },
    skyscraperSpecialists: { count: 2, start: 1, template: 'genericBot', type: 'SkyscraperSpecialist' },
    detailWorkers: { count: 9, start: 1, template: 'genericBot', type: 'DetailWorker' }
  },
  support: {
    couriers: { count: 10, start: 1, template: 'genericBot', type: 'Courier' },
    inventoryManagers: { count: 2, start: 1, template: 'genericBot', type: 'InventoryManager' },
    toolSmiths: { count: 2, start: 1, template: 'genericBot', type: 'ToolSmith' },
    security: { count: 2, start: 1, template: 'genericBot', type: 'SecurityBot' },
    maintenance: { count: 3, start: 1, template: 'genericBot', type: 'MaintenanceBot' }
  },
  artists: {
    statueBuilders: { count: 2, start: 1, template: 'genericBot', type: 'StatueBuilder' },
    redstoneEngineers: { count: 2, start: 1, template: 'genericBot', type: 'RedstoneEngineer' }
  }
};

function padNumber(num, width = 2) {
  return String(num).padStart(width, '0');
}

function generateBotFile(layer, category, index, definition) {
  const { template, type } = definition;
  
  let filename, content;
  
  if (template === 'lumberjackWorker') {
    filename = `lumberjack_worker_${padNumber(index)}.js`;
    content = templates.lumberjackWorker(padNumber(index));
  } else if (template === 'minerWorker') {
    filename = `miner_worker_${padNumber(index)}.js`;
    content = templates.minerWorker(padNumber(index));
  } else if (template === 'wallBuilder') {
    filename = `wall_builder_${padNumber(index)}.js`;
    content = templates.wallBuilder(padNumber(index));
  } else if (template === 'genericBot') {
    const typeLower = type.toLowerCase().replace(/([A-Z])/g, '_$1').toLowerCase().replace(/^_/, '');
    filename = `${typeLower}_${padNumber(index)}.js`;
    content = templates.genericBot(type, padNumber(index));
  }
  
  const layerDir = path.join(BASE_DIR, 'bots', layer);
  const filepath = path.join(layerDir, filename);
  
  // Create directory if it doesn't exist
  if (!fs.existsSync(layerDir)) {
    fs.mkdirSync(layerDir, { recursive: true });
  }
  
  // Write file
  fs.writeFileSync(filepath, content);
  
  return filename;
}

function main() {
  console.log('🤖 Generating 100-Bot Army Files...\n');
  
  let totalFiles = 0;
  
  for (const [layer, categories] of Object.entries(botDefinitions)) {
    console.log(`\n📁 Layer: ${layer}`);
    
    for (const [category, definition] of Object.entries(categories)) {
      console.log(`  📋 ${category}:`);
      
      for (let i = definition.start; i < definition.start + definition.count; i++) {
        const filename = generateBotFile(layer, category, i, definition);
        console.log(`    ✅ ${filename}`);
        totalFiles++;
      }
    }
  }
  
  console.log(`\n✅ Generated ${totalFiles} bot files!`);
  console.log('\n🎯 Bot Army Structure:');
  console.log('  - Resource Layer: 46 bots');
  console.log('  - Construction Layer: 30 bots');
  console.log('  - Support Layer: 20 bots');
  console.log('  - Artist Layer: 6 bots');
  console.log('  - Control Layer: 3 bots (manual)');
  console.log('  - Camera System: 10 bots (manual)');
  console.log(`  📊 Total: ${totalFiles} generated + existing core files`);
}

if (require.main === module) {
  main();
}

module.exports = { generateBotFile, templates };
